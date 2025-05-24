-- Schema sicuro per le transazioni finanziarie
-- Versione che gestisce elementi già esistenti senza causare errori
-- Controlla l'esistenza delle colonne prima di creare indici

-- Crea la tabella per le transazioni finanziarie (se non esiste)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'interest')),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'etf', 'bond', 'crypto', 'commodity')),
  ticker TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(20, 8) NOT NULL CHECK (quantity > 0),
  price DECIMAL(20, 8) NOT NULL CHECK (price >= 0),
  fees DECIMAL(20, 8) NOT NULL DEFAULT 0 CHECK (fees >= 0),
  total DECIMAL(20, 8) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crea indici per migliorare le performance (solo se non esistono e se le colonne esistono)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_transactions_user_id') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'user_id') THEN
            CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
        END IF;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_transactions_date') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'date') THEN
            CREATE INDEX idx_financial_transactions_date ON financial_transactions(date DESC);
        END IF;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_transactions_ticker') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'ticker') THEN
            CREATE INDEX idx_financial_transactions_ticker ON financial_transactions(ticker);
        END IF;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_transactions_type') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'type') THEN
            CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
        END IF;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_financial_transactions_asset_type') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'asset_type') THEN
            CREATE INDEX idx_financial_transactions_asset_type ON financial_transactions(asset_type);
        END IF;
    END IF;
END $$;

-- Aggiungi colonne mancanti se non esistono
DO $$
BEGIN
    -- Aggiungi colonna date se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'date') THEN
        ALTER TABLE financial_transactions ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    -- Aggiungi colonna type se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'type') THEN
        ALTER TABLE financial_transactions ADD COLUMN type TEXT NOT NULL DEFAULT 'buy' CHECK (type IN ('buy', 'sell', 'dividend', 'interest'));
    END IF;
    
    -- Aggiungi colonna ticker se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'ticker') THEN
        ALTER TABLE financial_transactions ADD COLUMN ticker TEXT NOT NULL DEFAULT 'UNKNOWN';
    END IF;
    
    -- Aggiungi colonna name se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'name') THEN
        ALTER TABLE financial_transactions ADD COLUMN name TEXT NOT NULL DEFAULT 'Unknown Asset';
    END IF;
    
    -- Aggiungi colonna asset_type se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'asset_type') THEN
        ALTER TABLE financial_transactions ADD COLUMN asset_type TEXT NOT NULL DEFAULT 'stock' CHECK (asset_type IN ('stock', 'etf', 'bond', 'crypto', 'commodity'));
    END IF;
    
    -- Aggiungi colonna price se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'price') THEN
        ALTER TABLE financial_transactions ADD COLUMN price DECIMAL(20, 8) NOT NULL DEFAULT 0 CHECK (price >= 0);
    END IF;
    
    -- Aggiungi colonna fees se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'fees') THEN
        ALTER TABLE financial_transactions ADD COLUMN fees DECIMAL(20, 8) NOT NULL DEFAULT 0 CHECK (fees >= 0);
    END IF;
    
    -- Aggiungi colonna total se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'total') THEN
        ALTER TABLE financial_transactions ADD COLUMN total DECIMAL(20, 8) NOT NULL DEFAULT 0;
    END IF;
    
    -- Aggiungi colonna notes se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'notes') THEN
        ALTER TABLE financial_transactions ADD COLUMN notes TEXT;
    END IF;
    
    -- Aggiungi colonna created_at se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'created_at') THEN
        ALTER TABLE financial_transactions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Aggiungi colonna updated_at se non esiste
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'updated_at') THEN
        ALTER TABLE financial_transactions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Abilita RLS (Row Level Security) solo se non è già abilitato
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'financial_transactions' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Policy per permettere agli utenti di vedere solo le proprie transazioni
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can view own financial transactions' 
        AND tablename = 'financial_transactions'
    ) THEN
        CREATE POLICY "Users can view own financial transactions" ON financial_transactions
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Policy per permettere agli utenti di inserire le proprie transazioni
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can insert own financial transactions' 
        AND tablename = 'financial_transactions'
    ) THEN
        CREATE POLICY "Users can insert own financial transactions" ON financial_transactions
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Policy per permettere agli utenti di aggiornare le proprie transazioni
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can update own financial transactions' 
        AND tablename = 'financial_transactions'
    ) THEN
        CREATE POLICY "Users can update own financial transactions" ON financial_transactions
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Policy per permettere agli utenti di eliminare le proprie transazioni
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can delete own financial transactions' 
        AND tablename = 'financial_transactions'
    ) THEN
        CREATE POLICY "Users can delete own financial transactions" ON financial_transactions
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Funzione per aggiornare il timestamp updated_at (sempre ricreata)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare automaticamente updated_at (solo se non esiste)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_financial_transactions_updated_at'
    ) THEN
        CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE
          ON financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Funzione per calcolare le holdings correnti di un utente (sempre ricreata)
CREATE OR REPLACE FUNCTION get_user_holdings(p_user_id UUID)
RETURNS TABLE (
  ticker TEXT,
  name TEXT,
  asset_type TEXT,
  quantity DECIMAL,
  avg_price DECIMAL,
  total_cost DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH holdings_calc AS (
    SELECT 
      ft.ticker,
      ft.name,
      ft.asset_type,
      SUM(
        CASE 
          WHEN ft.type = 'buy' THEN ft.quantity
          WHEN ft.type = 'sell' THEN -ft.quantity
          ELSE 0
        END
      ) as net_quantity,
      SUM(
        CASE 
          WHEN ft.type = 'buy' THEN ft.total
          WHEN ft.type = 'sell' THEN -(ft.quantity * 
            (SELECT AVG(price) FROM financial_transactions 
             WHERE ticker = ft.ticker AND user_id = p_user_id AND type = 'buy' AND date <= ft.date))
          ELSE 0
        END
      ) as net_cost
    FROM financial_transactions ft
    WHERE ft.user_id = p_user_id
    GROUP BY ft.ticker, ft.name, ft.asset_type
    HAVING SUM(
      CASE 
        WHEN ft.type = 'buy' THEN ft.quantity
        WHEN ft.type = 'sell' THEN -ft.quantity
        ELSE 0
      END
    ) > 0
  )
  SELECT 
    hc.ticker,
    hc.name,
    hc.asset_type,
    hc.net_quantity as quantity,
    CASE 
      WHEN hc.net_quantity > 0 THEN hc.net_cost / hc.net_quantity
      ELSE 0
    END as avg_price,
    hc.net_cost as total_cost
  FROM holdings_calc hc;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per calcolare le metriche del portafoglio (sempre ricreata)
CREATE OR REPLACE FUNCTION get_portfolio_metrics(p_user_id UUID)
RETURNS TABLE (
  total_cost DECIMAL,
  total_dividends DECIMAL,
  total_fees DECIMAL,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN type IN ('buy', 'sell') THEN total ELSE 0 END), 0) as total_cost,
    COALESCE(SUM(CASE WHEN type IN ('dividend', 'interest') THEN total ELSE 0 END), 0) as total_dividends,
    COALESCE(SUM(fees), 0) as total_fees,
    COUNT(*) as transaction_count
  FROM financial_transactions
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commenti sulla tabella e colonne per documentazione
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'financial_transactions') THEN
        COMMENT ON TABLE financial_transactions IS 'Tabella per tracciare tutte le transazioni finanziarie degli utenti';
        COMMENT ON COLUMN financial_transactions.type IS 'Tipo di transazione: buy, sell, dividend, interest';
        COMMENT ON COLUMN financial_transactions.asset_type IS 'Tipo di asset: stock, etf, bond, crypto, commodity';
        COMMENT ON COLUMN financial_transactions.ticker IS 'Simbolo/ticker dell''asset';
        COMMENT ON COLUMN financial_transactions.quantity IS 'Quantità di asset coinvolti nella transazione';
        COMMENT ON COLUMN financial_transactions.price IS 'Prezzo per unità dell''asset';
        COMMENT ON COLUMN financial_transactions.fees IS 'Commissioni associate alla transazione';
        COMMENT ON COLUMN financial_transactions.total IS 'Valore totale della transazione (quantità * prezzo + fees per buy, quantità * prezzo - fees per sell)';
    END IF;
END $$;