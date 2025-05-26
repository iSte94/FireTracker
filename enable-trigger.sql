-- Script per riattivare il trigger automatico per la creazione profili
-- Esegui questo nello SQL Editor di Supabase

-- Ricreo la funzione handle_new_user se non esiste già
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

-- Elimino il trigger esistente se presente (per evitare duplicati)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Ricreo il trigger per l'inserimento automatico dei profili
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Messaggio di conferma
SELECT 'Trigger riattivato con successo. La creazione automatica dei profili è ora attiva.' as result;