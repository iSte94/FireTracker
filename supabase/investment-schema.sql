-- Investment Goals and Portfolio Management Schema
-- This schema extends the existing FIRE tracker with investment tracking capabilities

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Portfolio Holdings table (materialized view for performance)
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
CREATE INDEX idx_investment_goals_user_id ON investment_goals(user_id);
CREATE INDEX idx_investment_goals_status ON investment_goals(status);
CREATE INDEX idx_investment_goals_goal_type ON investment_goals(goal_type);

CREATE INDEX idx_portfolio_allocations_goal_id ON portfolio_allocations(goal_id);

CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX idx_financial_transactions_asset ON financial_transactions(asset_type, ticker_symbol);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(transaction_type);

CREATE INDEX idx_portfolio_holdings_user_id ON portfolio_holdings(user_id);
CREATE INDEX idx_portfolio_holdings_asset ON portfolio_holdings(asset_type, ticker_symbol);

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