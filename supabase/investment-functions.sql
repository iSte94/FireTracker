-- Functions for portfolio calculations and automatic updates

-- Function to calculate portfolio holdings from transactions
CREATE OR REPLACE FUNCTION calculate_portfolio_holdings(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete existing holdings for the user
  DELETE FROM portfolio_holdings WHERE user_id = p_user_id;
  
  -- Insert calculated holdings
  INSERT INTO portfolio_holdings (
    user_id,
    asset_type,
    asset_name,
    ticker_symbol,
    total_quantity,
    average_cost,
    total_cost,
    current_price,
    current_value,
    unrealized_gain_loss,
    percentage_of_portfolio,
    last_updated
  )
  SELECT 
    p_user_id,
    asset_type,
    asset_name,
    ticker_symbol,
    SUM(CASE 
      WHEN transaction_type IN ('buy', 'deposit') THEN quantity
      WHEN transaction_type IN ('sell', 'withdrawal') THEN -quantity
      ELSE 0
    END) as total_quantity,
    CASE 
      WHEN SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE 0 END) > 0
      THEN SUM(CASE WHEN transaction_type = 'buy' THEN total_amount ELSE 0 END) / 
           SUM(CASE WHEN transaction_type = 'buy' THEN quantity ELSE 0 END)
      ELSE 0
    END as average_cost,
    SUM(CASE 
      WHEN transaction_type = 'buy' THEN total_amount
      WHEN transaction_type = 'sell' THEN -total_amount
      ELSE 0
    END) as total_cost,
    NULL as current_price, -- To be updated by external price feed
    NULL as current_value, -- To be calculated when current_price is available
    NULL as unrealized_gain_loss, -- To be calculated when current_price is available
    0 as percentage_of_portfolio, -- To be calculated after all holdings are inserted
    NOW()
  FROM financial_transactions
  WHERE user_id = p_user_id
    AND transaction_type IN ('buy', 'sell', 'deposit', 'withdrawal')
  GROUP BY asset_type, asset_name, ticker_symbol
  HAVING SUM(CASE 
    WHEN transaction_type IN ('buy', 'deposit') THEN quantity
    WHEN transaction_type IN ('sell', 'withdrawal') THEN -quantity
    ELSE 0
  END) > 0;
  
  -- Update portfolio percentages
  WITH total_portfolio AS (
    SELECT SUM(COALESCE(current_value, total_cost)) as total_value
    FROM portfolio_holdings
    WHERE user_id = p_user_id
  )
  UPDATE portfolio_holdings
  SET percentage_of_portfolio = CASE 
    WHEN (SELECT total_value FROM total_portfolio) > 0
    THEN (COALESCE(current_value, total_cost) / (SELECT total_value FROM total_portfolio)) * 100
    ELSE 0
  END
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update current portfolio allocations
CREATE OR REPLACE FUNCTION update_portfolio_allocations(p_goal_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_total_value NUMERIC;
BEGIN
  -- Get user_id from goal
  SELECT user_id INTO v_user_id
  FROM investment_goals
  WHERE id = p_goal_id;
  
  -- Calculate total portfolio value
  SELECT SUM(COALESCE(current_value, total_cost))
  INTO v_total_value
  FROM portfolio_holdings
  WHERE user_id = v_user_id;
  
  -- Update current percentages for each asset class
  UPDATE portfolio_allocations pa
  SET current_percentage = COALESCE(
    (
      SELECT SUM(ph.percentage_of_portfolio)
      FROM portfolio_holdings ph
      WHERE ph.user_id = v_user_id
        AND ph.asset_type = CASE 
          WHEN pa.asset_class = 'stocks' THEN 'stock'
          WHEN pa.asset_class = 'bonds' THEN 'bond'
          WHEN pa.asset_class = 'crypto' THEN 'crypto'
          WHEN pa.asset_class = 'etf' THEN 'etf'
          WHEN pa.asset_class = 'funds' THEN 'fund'
          WHEN pa.asset_class = 'cash' THEN 'cash'
          WHEN pa.asset_class = 'real_estate' THEN 'real_estate'
          WHEN pa.asset_class = 'commodities' THEN 'commodity'
          ELSE 'other'
        END
    ), 0
  ),
  updated_at = NOW()
  WHERE goal_id = p_goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update investment goal current values
CREATE OR REPLACE FUNCTION update_investment_goal_values(p_goal_id UUID)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
  v_goal_type TEXT;
  v_current_value NUMERIC;
BEGIN
  -- Get goal details
  SELECT user_id, goal_type 
  INTO v_user_id, v_goal_type
  FROM investment_goals
  WHERE id = p_goal_id;
  
  -- Calculate current value based on goal type
  CASE v_goal_type
    WHEN 'portfolio_allocation' THEN
      -- For allocation goals, check if current allocation matches target
      SELECT 
        CASE 
          WHEN COUNT(*) = SUM(CASE WHEN ABS(current_percentage - target_percentage) <= 5 THEN 1 ELSE 0 END)
          THEN 100 -- Goal achieved if all allocations are within 5% of target
          ELSE (SUM(CASE WHEN ABS(current_percentage - target_percentage) <= 5 THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100
        END
      INTO v_current_value
      FROM portfolio_allocations
      WHERE goal_id = p_goal_id;
      
    WHEN 'target_portfolio_value' THEN
      -- Total portfolio value
      SELECT SUM(COALESCE(current_value, total_cost))
      INTO v_current_value
      FROM portfolio_holdings
      WHERE user_id = v_user_id;
      
    WHEN 'monthly_investment' THEN
      -- Average monthly investment over last 12 months
      SELECT AVG(monthly_total)
      INTO v_current_value
      FROM (
        SELECT 
          DATE_TRUNC('month', transaction_date) as month,
          SUM(CASE WHEN transaction_type = 'buy' THEN total_amount ELSE 0 END) as monthly_total
        FROM financial_transactions
        WHERE user_id = v_user_id
          AND transaction_date >= CURRENT_DATE - INTERVAL '12 months'
          AND transaction_type = 'buy'
        GROUP BY DATE_TRUNC('month', transaction_date)
      ) monthly_investments;
      
    WHEN 'annual_return' THEN
      -- Calculate annual return percentage
      WITH portfolio_values AS (
        SELECT 
          SUM(COALESCE(current_value, total_cost)) as current_total,
          SUM(total_cost) as cost_basis
        FROM portfolio_holdings
        WHERE user_id = v_user_id
      )
      SELECT 
        CASE 
          WHEN cost_basis > 0 
          THEN ((current_total - cost_basis) / cost_basis) * 100
          ELSE 0
        END
      INTO v_current_value
      FROM portfolio_values;
      
    ELSE
      -- For other goal types, use the existing current_value
      SELECT current_value 
      INTO v_current_value
      FROM investment_goals
      WHERE id = p_goal_id;
  END CASE;
  
  -- Update the goal with calculated value
  UPDATE investment_goals
  SET 
    current_value = COALESCE(v_current_value, 0),
    updated_at = NOW(),
    status = CASE 
      WHEN COALESCE(v_current_value, 0) >= target_value THEN 'completed'
      ELSE status
    END
  WHERE id = p_goal_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update portfolio after transaction
CREATE OR REPLACE FUNCTION update_portfolio_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate portfolio holdings for the user
  PERFORM calculate_portfolio_holdings(NEW.user_id);
  
  -- Update all active portfolio allocation goals for the user
  PERFORM update_portfolio_allocations(ig.id)
  FROM investment_goals ig
  WHERE ig.user_id = NEW.user_id
    AND ig.goal_type = 'portfolio_allocation'
    AND ig.status = 'active';
  
  -- Update all investment goals for the user
  PERFORM update_investment_goal_values(ig.id)
  FROM investment_goals ig
  WHERE ig.user_id = NEW.user_id
    AND ig.status = 'active';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for financial transactions
CREATE TRIGGER trigger_update_portfolio_after_transaction
  AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_after_transaction();

-- Function to update portfolio prices (to be called by external service)
CREATE OR REPLACE FUNCTION update_portfolio_prices(
  p_user_id UUID,
  p_ticker_symbol TEXT,
  p_current_price NUMERIC
)
RETURNS VOID AS $$
BEGIN
  -- Update the current price and calculate current value
  UPDATE portfolio_holdings
  SET 
    current_price = p_current_price,
    current_value = total_quantity * p_current_price,
    unrealized_gain_loss = (total_quantity * p_current_price) - total_cost,
    last_updated = NOW()
  WHERE user_id = p_user_id
    AND ticker_symbol = p_ticker_symbol;
  
  -- Recalculate portfolio percentages
  WITH total_portfolio AS (
    SELECT SUM(COALESCE(current_value, total_cost)) as total_value
    FROM portfolio_holdings
    WHERE user_id = p_user_id
  )
  UPDATE portfolio_holdings
  SET percentage_of_portfolio = CASE 
    WHEN (SELECT total_value FROM total_portfolio) > 0
    THEN (COALESCE(current_value, total_cost) / (SELECT total_value FROM total_portfolio)) * 100
    ELSE 0
  END
  WHERE user_id = p_user_id;
  
  -- Update related goals
  PERFORM update_investment_goal_values(ig.id)
  FROM investment_goals ig
  WHERE ig.user_id = p_user_id
    AND ig.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get portfolio summary
CREATE OR REPLACE FUNCTION get_portfolio_summary(p_user_id UUID)
RETURNS TABLE (
  total_value NUMERIC,
  total_cost NUMERIC,
  total_gain_loss NUMERIC,
  total_gain_loss_percentage NUMERIC,
  asset_count INTEGER,
  last_transaction_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(COALESCE(ph.current_value, ph.total_cost)) as total_value,
    SUM(ph.total_cost) as total_cost,
    SUM(COALESCE(ph.unrealized_gain_loss, 0)) as total_gain_loss,
    CASE 
      WHEN SUM(ph.total_cost) > 0 
      THEN (SUM(COALESCE(ph.unrealized_gain_loss, 0)) / SUM(ph.total_cost)) * 100
      ELSE 0
    END as total_gain_loss_percentage,
    COUNT(DISTINCT ph.id)::INTEGER as asset_count,
    MAX(ft.transaction_date) as last_transaction_date
  FROM portfolio_holdings ph
  LEFT JOIN financial_transactions ft ON ft.user_id = ph.user_id
  WHERE ph.user_id = p_user_id
  GROUP BY ph.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check portfolio allocation deviations
CREATE OR REPLACE FUNCTION check_allocation_deviations(p_goal_id UUID)
RETURNS TABLE (
  asset_class TEXT,
  target_percentage NUMERIC,
  current_percentage NUMERIC,
  deviation NUMERIC,
  action_needed TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.asset_class,
    pa.target_percentage,
    pa.current_percentage,
    pa.current_percentage - pa.target_percentage as deviation,
    CASE 
      WHEN pa.current_percentage - pa.target_percentage > 5 THEN 'Reduce position'
      WHEN pa.current_percentage - pa.target_percentage < -5 THEN 'Increase position'
      ELSE 'On target'
    END as action_needed
  FROM portfolio_allocations pa
  WHERE pa.goal_id = p_goal_id
  ORDER BY ABS(pa.current_percentage - pa.target_percentage) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;