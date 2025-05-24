-- Aggiungi il campo view_mode alla tabella profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS view_mode TEXT DEFAULT 'fire_budget' 
CHECK (view_mode IN ('fire_only', 'fire_budget'));

-- Aggiungi un commento descrittivo
COMMENT ON COLUMN profiles.view_mode IS 'Modalità di visualizzazione dell''applicazione: fire_only (Solo FIRE) o fire_budget (FIRE & Budget)';

-- Aggiorna la funzione handle_new_user per includere view_mode
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
    2350,
    28200,
    30,
    65,
    4,
    7,
    2,
    'fire_budget'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica che il campo sia stato aggiunto
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'view_mode';