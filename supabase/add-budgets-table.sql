-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  period TEXT NOT NULL, -- 'MONTHLY', 'QUARTERLY', 'YEARLY'
  start_date DATE NOT NULL,
  end_date DATE,
  is_recurring BOOLEAN DEFAULT true,
  notes TEXT,
  alert_threshold NUMERIC(5, 2) DEFAULT 80, -- Alert when spending reaches this percentage
  shared_with UUID[] DEFAULT '{}', -- Array of user IDs for shared budgets
  goal_id UUID REFERENCES goals(id), -- Link to specific goals
  status TEXT DEFAULT 'ACTIVE' -- 'ACTIVE', 'PAUSED', 'COMPLETED'
);

-- Create budget_alerts table for tracking notifications
CREATE TABLE IF NOT EXISTS budget_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  budget_id UUID REFERENCES budgets(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  alert_type TEXT NOT NULL, -- 'THRESHOLD_REACHED', 'BUDGET_EXCEEDED', 'PERIOD_ENDING'
  percentage_used NUMERIC(5, 2),
  message TEXT,
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for budgets
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for budget_alerts
CREATE POLICY "Users can view own alerts" ON budget_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON budget_alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category ON budgets(category);
CREATE INDEX idx_budgets_period ON budgets(period);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budget_alerts_user_id ON budget_alerts(user_id);
CREATE INDEX idx_budget_alerts_budget_id ON budget_alerts(budget_id);