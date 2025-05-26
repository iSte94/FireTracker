-- Create tables for FIRE Progress Tracker

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  monthly_expenses NUMERIC(10, 2),
  annual_expenses NUMERIC(10, 2),
  current_age INTEGER,
  retirement_age INTEGER,
  swr_rate NUMERIC(5, 2),
  expected_return NUMERIC(5, 2),
  inflation_rate NUMERIC(5, 2)
);

-- Net Worth tracking
CREATE TABLE IF NOT EXISTS net_worth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  notes TEXT
);

-- Expenses by category
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT
);

-- Financial Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'FIRE', 'COAST_FIRE', 'BARISTA_FIRE', 'CUSTOM'
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) NOT NULL,
  target_date DATE,
  notes TEXT,
  status TEXT NOT NULL -- 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL, -- 'INCOME', 'EXPENSE'
  notes TEXT
);

-- Set up Row Level Security (RLS)
-- Enable row level security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE net_worth ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can only view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Net Worth: Users can only CRUD their own net worth entries
CREATE POLICY "Users can view own net worth" ON net_worth
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own net worth" ON net_worth
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own net worth" ON net_worth
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own net worth" ON net_worth
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses: Users can only CRUD their own expenses
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Goals: Users can only CRUD their own goals
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions: Users can only CRUD their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url, monthly_expenses, annual_expenses, current_age, retirement_age, swr_rate, expected_return, inflation_rate)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    2350, -- Default monthly expenses
    28200, -- Default annual expenses
    30, -- Default current age
    65, -- Default retirement age
    4, -- Default SWR rate
    7, -- Default expected return
    2 -- Default inflation rate
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
