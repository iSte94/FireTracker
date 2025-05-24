-- ============================================
-- SETUP COMPLETO MODULO INVESTIMENTI
-- ============================================
-- Questo file unifica tutti gli script SQL necessari per il modulo investimenti
-- Può essere eseguito manualmente in Supabase SQL Editor

-- ============================================
-- PARTE 1: SCHEMA E TABELLE
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Assicurati che la funzione update_updated_at esista
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Investment Goals table
CREATE TABLE IF NOT EXISTS investment_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN (
    'monthly_investment',
    'portfolio_allocation', 
    'annual_return',
    'target_portfolio_value',
    'retirement_income',
    'emergency_fund',
    'custom'
  )),
  target_value NUMERIC(12, 2) NOT NULL,
  current_value NUMERIC(12, 2) DEFAULT 0,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_target_value CHECK (target_value > 0)
);

-- Portfolio Allocations table
CREATE TABLE IF NOT EXISTS portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES investment_goals(id) ON DELETE CASCADE NOT NULL,
  asset_class TEXT NOT NULL CHECK (asset_class IN (
    'stocks',
    'bonds',
    'crypto',
    'etf',
    'funds',
    'cash',
    'real_estate',
    'commodities',
    'other'
  )),
  target_percentage NUMERIC(5, 2) NOT NULL CHECK (target_percentage >= 0 AND target_percentage <= 100),
  current_percentage NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(goal_id, asset_class)
);

-- Financial Transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'buy',
    'sell',
    'dividend',
    'interest',
    'deposit',
    'withdrawal',
    'fee',
    'tax'
  )),
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'stock',
    'etf',
    'fund',
    'bond',
    'crypto',
    'cash',
    'real_estate',
    'commodity',
    'other'
  )),
  asset_name TEXT NOT NULL,
  ticker_symbol TEXT,
  quantity NUMERIC(12, 6),
  price_per_unit NUMERIC(12, 6),
  total_amount NUMERIC(12, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  fees NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_quantity CHECK (quantity IS NULL OR quantity > 0),
  CONSTRAINT positive_price CHECK (price_per_unit IS NULL OR price_per_unit > 0),
  CONSTRAINT positive_fees CHECK (fees >= 0)
);

-- Portfolio Holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  asset_type TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  ticker_symbol TEXT,
  total_quantity NUMERIC(12, 6) NOT NULL,
  average_cost NUMERIC(12, 6) NOT NULL,
  total_cost NUMERIC(12, 2) NOT NULL,
  current_price NUMERIC(12, 6),
  current_value NUMERIC(12, 2),
  unrealized_gain_loss NUMERIC(12, 2),
  percentage_of_portfolio NUMERIC(5, 2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, asset_type, asset_name, ticker_symbol)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investment_goals_user_id ON investment_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_goals_status ON investment_goals(status);
CREATE INDEX IF NOT EXISTS idx_investment_goals_goal_type ON investment_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_goal_id ON portfolio_allocations(goal_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_asset ON financial_transactions(asset_type, ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_asset ON portfolio_holdings(asset_type, ticker_symbol);

-- Enable Row Level Security
ALTER TABLE investment_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investment_goals
CREATE POLICY "Users can view own investment goals" ON investment_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investment goals" ON investment_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investment goals" ON investment_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investment goals" ON investment_goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for portfolio_allocations
CREATE POLICY "Users can view own portfolio allocations" ON portfolio_allocations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM investment_goals 
      WHERE investment_goals.id = portfolio_allocations.goal_id 
      AND investment_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own portfolio allocations" ON portfolio_allocations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM investment_goals 
      WHERE investment_goals.id = portfolio_allocations.goal_id 
      AND investment_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own portfolio allocations" ON portfolio_allocations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM investment_goals 
      WHERE investment_goals.id = portfolio_allocations.goal_id 
      AND investment_goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own portfolio allocations" ON portfolio_allocations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM investment_goals 
      WHERE investment_goals.id = portfolio_allocations.goal_id 
      AND investment_goals.user_id = auth.uid()
    )
  );

-- RLS Policies for financial_transactions
CREATE POLICY "Users can view own financial transactions" ON financial_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial transactions" ON financial_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial transactions" ON financial_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial transactions" ON financial_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for portfolio_holdings
CREATE POLICY "Users can view own portfolio holdings" ON portfolio_holdings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio holdings" ON portfolio_holdings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio holdings" ON portfolio_holdings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio holdings" ON portfolio_holdings
  FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_investment_goals_updated_at
  BEFORE UPDATE ON investment_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_portfolio_allocations_updated_at
  BEFORE UPDATE ON portfolio_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PARTE 2: FUNZIONI
-- ============================================

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
    NULL as current_price,
    NULL as current_value,
    NULL as unrealized_gain_loss,
    0 as percentage_of_portfolio,
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
          THEN 100
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
  -- Handle DELETE case
  IF TG_OP = 'DELETE' THEN
    -- Recalculate portfolio holdings for the user
    PERFORM calculate_portfolio_holdings(OLD.user_id);
    
    -- Update all active portfolio allocation goals for the user
    PERFORM update_portfolio_allocations(ig.id)
    FROM investment_goals ig
    WHERE ig.user_id = OLD.user_id
      AND ig.goal_type = 'portfolio_allocation'
      AND ig.status = 'active';
    
    -- Update all investment goals for the user
    PERFORM update_investment_goal_values(ig.id)
    FROM investment_goals ig
    WHERE ig.user_id = OLD.user_id
      AND ig.status = 'active';
    
    RETURN OLD;
  ELSE
    -- For INSERT and UPDATE
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
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for financial transactions
DROP TRIGGER IF EXISTS trigger_update_portfolio_after_transaction ON financial_transactions;
CREATE TRIGGER trigger_update_portfolio_after_transaction
  AFTER INSERT OR UPDATE OR DELETE ON financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_portfolio_after_transaction();

-- Function to update portfolio prices
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

-- ============================================
-- PARTE 3: VISTE E FUNZIONI HELPER
-- ============================================

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

-- Helper function to validate portfolio allocations sum to 100%
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
DROP TRIGGER IF EXISTS validate_portfolio_allocations_trigger ON portfolio_allocations;
CREATE TRIGGER validate_portfolio_allocations_trigger
  BEFORE INSERT OR UPDATE ON portfolio_allocations
  FOR EACH ROW
  EXECUTE FUNCTION validate_portfolio_allocations();

-- Function to record a new transaction
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

-- ============================================
-- COMMENTI E DOCUMENTAZIONE
-- ============================================

COMMENT ON TABLE investment_goals IS 'Stores user investment goals and targets';
COMMENT ON COLUMN investment_goals.goal_type IS 'Type of investment goal: monthly_investment, portfolio_allocation, annual_return, etc.';
COMMENT ON COLUMN investment_goals.current_value IS 'Automatically calculated based on goal type';

COMMENT ON TABLE portfolio_allocations IS 'Target asset allocation percentages for portfolio goals';
COMMENT ON COLUMN portfolio_allocations.current_percentage IS 'Automatically calculated from actual portfolio holdings';

COMMENT ON TABLE financial_transactions IS 'Records all financial transactions including buys, sells, dividends, etc.';
COMMENT ON COLUMN financial_transactions.transaction_type IS 'Type of transaction: buy, sell, dividend, interest, deposit, withdrawal, fee, tax';

COMMENT ON TABLE portfolio_holdings IS 'Current portfolio positions calculated from transactions';
COMMENT ON COLUMN portfolio_holdings.unrealized_gain_loss IS 'Calculated as (current_value - total_cost) when prices are available';

-- ============================================
-- MESSAGGIO DI COMPLETAMENTO
-- ============================================
-- Setup completato! Le seguenti tabelle sono state create:
-- - investment_goals
-- - portfolio_allocations
-- - financial_transactions
-- - portfolio_holdings
--
-- Le seguenti viste sono state create:
-- - portfolio_by_asset_class
-- - investment_goals_progress
-- - monthly_investment_summary
--
-- Tutte le funzioni e trigger necessari sono stati configurati.
-- Il modulo investimenti è ora pronto per l'uso!