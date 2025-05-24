-- Aggiorna la funzione handle_new_user per includere il campo view_mode

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    email, 
    full_name, 
    avatar_url, 
    monthly_expenses, 
    annual_expenses, 
    current_age, 
    retirement_age, 
    swr_rate, 
    expected_return, 
    inflation_rate,
    view_mode
  )
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
    2, -- Default inflation rate
    'fire_budget' -- Default view mode
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;