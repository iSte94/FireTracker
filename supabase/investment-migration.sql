-- Complete Investment Module Migration
-- Run this file to add investment tracking capabilities to your FIRE tracker

-- First, run the schema creation
\i investment-schema.sql

-- Then, run the functions
\i investment-functions.sql

-- Create useful views for reporting

-- View for portfolio overview by asset class
CREATE OR REPLACE VIEW portfolio_by_asset_class AS
SELECT 
  ph.user_id,
  ph.asset_type,
  COUNT(DISTINCT ph.ticker_symbol) as number_of_assets,
  SUM(ph.total_quantity) as total_units,
  SUM(ph.total_cost) as total_invested,
  SUM(COALESCE(ph.current_value, ph.total_cost)) as current_value,
  SUM(COALESCE(ph.unrealized_gain_loss, 0)) as unrealized_gain_loss,
  CASE 
    WHEN SUM(ph.total_cost) > 0 
    THEN (SUM(COALESCE(ph.unrealized_gain_loss, 0)) / SUM(ph.total_cost)) * 100
    ELSE 0
  END as return_percentage,
  SUM(ph.percentage_of_portfolio) as portfolio_percentage
FROM portfolio_holdings ph
GROUP BY ph.user_id, ph.asset_type;

-- Grant access to the view
GRANT SELECT ON portfolio_by_asset_class TO authenticated;

-- View for investment goals progress
CREATE OR REPLACE VIEW investment_goals_progress AS
SELECT 
  ig.id,
  ig.user_id,
  ig.title,
  ig.goal_type,
  ig.target_value,
  ig.current_value,
  CASE 
    WHEN ig.target_value > 0 
    THEN (ig.current_value / ig.target_value) * 100
    ELSE 0
  END as progress_percentage,
  ig.target_date,
  CASE 
    WHEN ig.target_date IS NOT NULL 
    THEN ig.target_date - CURRENT_DATE
    ELSE NULL
  END as days_remaining,
  ig.status,
  ig.created_at,
  ig.updated_at
FROM investment_goals ig;

-- Grant access to the view
GRANT SELECT ON investment_goals_progress TO authenticated;

-- View for transaction history with running balance
CREATE OR REPLACE VIEW transaction_history_with_balance AS
SELECT 
  ft.id,
  ft.user_id,
  ft.transaction_date,
  ft.transaction_type,
  ft.asset_type,
  ft.asset_name,
  ft.ticker_symbol,
  ft.quantity,
  ft.price_per_unit,
  ft.total_amount,
  ft.fees,
  ft.currency,
  SUM(
    CASE 
      WHEN ft2.transaction_type IN ('buy', 'deposit') THEN ft2.total_amount
      WHEN ft2.transaction_type IN ('sell', 'withdrawal') THEN -ft2.total_amount
      ELSE 0
    END
  ) OVER (
    PARTITION BY ft.user_id 
    ORDER BY ft2.transaction_date, ft2.created_at
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) as running_balance
FROM financial_transactions ft
JOIN financial_transactions ft2 ON ft2.user_id = ft.user_id 
  AND (ft2.transaction_date < ft.transaction_date 
    OR (ft2.transaction_date = ft.transaction_date AND ft2.created_at <= ft.created_at));

-- Grant access to the view
GRANT SELECT ON transaction_history_with_balance TO authenticated;

-- View for monthly investment summary
CREATE OR REPLACE VIEW monthly_investment_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', transaction_date) as month,
  SUM(CASE WHEN transaction_type = 'buy' THEN total_amount ELSE 0 END) as total_invested,
  SUM(CASE WHEN transaction_type = 'sell' THEN total_amount ELSE 0 END) as total_withdrawn,
  SUM(CASE WHEN transaction_type = 'dividend' THEN total_amount ELSE 0 END) as total_dividends,
  SUM(CASE WHEN transaction_type = 'interest' THEN total_amount ELSE 0 END) as total_interest,
  SUM(fees) as total_fees,
  COUNT(*) as transaction_count
FROM financial_transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

-- Grant access to the view
GRANT SELECT ON monthly_investment_summary TO authenticated;

-- Add RLS policies for views
ALTER VIEW portfolio_by_asset_class SET (security_invoker = true);
ALTER VIEW investment_goals_progress SET (security_invoker = true);
ALTER VIEW transaction_history_with_balance SET (security_invoker = true);
ALTER VIEW monthly_investment_summary SET (security_invoker = true);

-- Create helper function to validate portfolio allocations sum to 100%
CREATE OR REPLACE FUNCTION validate_portfolio_allocations()
RETURNS TRIGGER AS $$
DECLARE
  v_total_percentage NUMERIC;
BEGIN
  -- Calculate total percentage for the goal
  SELECT SUM(target_percentage)
  INTO v_total_percentage
  FROM portfolio_allocations
  WHERE goal_id = NEW.goal_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  
  -- Add the new/updated percentage
  v_total_percentage := COALESCE(v_total_percentage, 0) + NEW.target_percentage;
  
  -- Check if total exceeds 100%
  IF v_total_percentage > 100 THEN
    RAISE EXCEPTION 'Total portfolio allocation cannot exceed 100%%. Current total: %', v_total_percentage;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for portfolio allocation validation
CREATE TRIGGER validate_portfolio_allocations_trigger
  BEFORE INSERT OR UPDATE ON portfolio_allocations
  FOR EACH ROW
  EXECUTE FUNCTION validate_portfolio_allocations();

-- Sample data insertion functions (for testing)
CREATE OR REPLACE FUNCTION create_sample_investment_goal(
  p_user_id UUID,
  p_title TEXT,
  p_goal_type TEXT,
  p_target_value NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_goal_id UUID;
BEGIN
  INSERT INTO investment_goals (
    user_id, title, goal_type, target_value, status
  ) VALUES (
    p_user_id, p_title, p_goal_type, p_target_value, 'active'
  ) RETURNING id INTO v_goal_id;
  
  -- If it's a portfolio allocation goal, create default allocations
  IF p_goal_type = 'portfolio_allocation' THEN
    INSERT INTO portfolio_allocations (goal_id, asset_class, target_percentage)
    VALUES 
      (v_goal_id, 'stocks', 60),
      (v_goal_id, 'bonds', 30),
      (v_goal_id, 'cash', 10);
  END IF;
  
  RETURN v_goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a new transaction and update portfolio
CREATE OR REPLACE FUNCTION record_financial_transaction(
  p_user_id UUID,
  p_transaction_type TEXT,
  p_asset_type TEXT,
  p_asset_name TEXT,
  p_ticker_symbol TEXT,
  p_quantity NUMERIC,
  p_price_per_unit NUMERIC,
  p_transaction_date DATE,
  p_fees NUMERIC DEFAULT 0,
  p_currency TEXT DEFAULT 'EUR',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_total_amount NUMERIC;
BEGIN
  -- Calculate total amount
  v_total_amount := p_quantity * p_price_per_unit;
  
  -- Insert transaction
  INSERT INTO financial_transactions (
    user_id, transaction_type, asset_type, asset_name, ticker_symbol,
    quantity, price_per_unit, total_amount, transaction_date,
    fees, currency, notes
  ) VALUES (
    p_user_id, p_transaction_type, p_asset_type, p_asset_name, p_ticker_symbol,
    p_quantity, p_price_per_unit, v_total_amount, p_transaction_date,
    p_fees, p_currency, p_notes
  ) RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments to tables and columns for documentation
COMMENT ON TABLE investment_goals IS 'Stores user investment goals and targets';
COMMENT ON COLUMN investment_goals.goal_type IS 'Type of investment goal: monthly_investment, portfolio_allocation, annual_return, etc.';
COMMENT ON COLUMN investment_goals.current_value IS 'Automatically calculated based on goal type';

COMMENT ON TABLE portfolio_allocations IS 'Target asset allocation percentages for portfolio goals';
COMMENT ON COLUMN portfolio_allocations.current_percentage IS 'Automatically calculated from actual portfolio holdings';

COMMENT ON TABLE financial_transactions IS 'Records all financial transactions including buys, sells, dividends, etc.';
COMMENT ON COLUMN financial_transactions.transaction_type IS 'Type of transaction: buy, sell, dividend, interest, deposit, withdrawal, fee, tax';

COMMENT ON TABLE portfolio_holdings IS 'Current portfolio positions calculated from transactions';
COMMENT ON COLUMN portfolio_holdings.unrealized_gain_loss IS 'Calculated as (current_value - total_cost) when prices are available';

-- Create indexes for foreign key relationships
CREATE INDEX idx_portfolio_allocations_goal_fk ON portfolio_allocations(goal_id);
CREATE INDEX idx_investment_goals_user_fk ON investment_goals(user_id);
CREATE INDEX idx_financial_transactions_user_fk ON financial_transactions(user_id);
CREATE INDEX idx_portfolio_holdings_user_fk ON portfolio_holdings(user_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Investment module migration completed successfully!';
  RAISE NOTICE 'Tables created: investment_goals, portfolio_allocations, financial_transactions, portfolio_holdings';
  RAISE NOTICE 'Views created: portfolio_by_asset_class, investment_goals_progress, transaction_history_with_balance, monthly_investment_summary';
  RAISE NOTICE 'Functions created: calculate_portfolio_holdings, update_portfolio_allocations, update_investment_goal_values, and more';
END $$;