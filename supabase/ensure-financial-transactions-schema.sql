-- Migrazione di sicurezza per assicurare che la tabella financial_transactions
-- e tutte le sue colonne esistano correttamente
-- Risolve problemi di cache schema PGRST204

-- Crea la tabella se non esiste (con IF NOT EXISTS per sicurezza)
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

-- Verifica e aggiungi colonne mancanti se necessario
DO $$
BEGIN
  -- Verifica colonna date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'date'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN date DATE NOT NULL DEFAULT CURRENT_DATE;
    RAISE NOTICE 'Aggiunta colonna date';
  END IF;

  -- Verifica colonna type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'type'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN type TEXT NOT NULL DEFAULT 'buy';
    RAISE NOTICE 'Aggiunta colonna type';
  END IF;

  -- Verifica colonna asset_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'asset_type'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN asset_type TEXT NOT NULL DEFAULT 'stock';
    RAISE NOTICE 'Aggiunta colonna asset_type';
  END IF;

  -- Verifica colonna ticker
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'ticker'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN ticker TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Aggiunta colonna ticker';
  END IF;

  -- Verifica colonna name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN name TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'Aggiunta colonna name';
  END IF;

  -- Verifica colonna quantity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'quantity'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN quantity DECIMAL(20, 8) NOT NULL DEFAULT 0;
    RAISE NOTICE 'Aggiunta colonna quantity';
  END IF;

  -- Verifica colonna price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'price'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN price DECIMAL(20, 8) NOT NULL DEFAULT 0;
    RAISE NOTICE 'Aggiunta colonna price';
  END IF;

  -- Verifica colonna fees
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'fees'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN fees DECIMAL(20, 8) NOT NULL DEFAULT 0;
    RAISE NOTICE 'Aggiunta colonna fees';
  END IF;

  -- Verifica colonna total
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'total'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN total DECIMAL(20, 8) NOT NULL DEFAULT 0;
    RAISE NOTICE 'Aggiunta colonna total';
  END IF;

  -- Verifica colonna notes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'financial_transactions' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE financial_transactions ADD COLUMN notes TEXT;
    RAISE NOTICE 'Aggiunta colonna notes';
  END IF;

  RAISE NOTICE 'Verifica colonne completata';
END $$;

-- Crea indici se non esistono
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_ticker ON financial_transactions(ticker);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_asset_type ON financial_transactions(asset_type);

-- Abilita RLS se non già abilitato
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'financial_transactions' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS abilitato per financial_transactions';
  END IF;
END $$;

-- Crea policy se non esistono
DO $$
BEGIN
  -- Policy per SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'financial_transactions' 
    AND policyname = 'Users can view own financial transactions'
  ) THEN
    CREATE POLICY "Users can view own financial transactions" ON financial_transactions
      FOR SELECT USING (auth.uid() = user_id);
    RAISE NOTICE 'Policy SELECT creata';
  END IF;

  -- Policy per INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'financial_transactions' 
    AND policyname = 'Users can insert own financial transactions'
  ) THEN
    CREATE POLICY "Users can insert own financial transactions" ON financial_transactions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    RAISE NOTICE 'Policy INSERT creata';
  END IF;

  -- Policy per UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'financial_transactions' 
    AND policyname = 'Users can update own financial transactions'
  ) THEN
    CREATE POLICY "Users can update own financial transactions" ON financial_transactions
      FOR UPDATE USING (auth.uid() = user_id);
    RAISE NOTICE 'Policy UPDATE creata';
  END IF;

  -- Policy per DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'financial_transactions' 
    AND policyname = 'Users can delete own financial transactions'
  ) THEN
    CREATE POLICY "Users can delete own financial transactions" ON financial_transactions
      FOR DELETE USING (auth.uid() = user_id);
    RAISE NOTICE 'Policy DELETE creata';
  END IF;
END $$;

-- Crea o ricrea la funzione per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crea trigger se non esiste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_financial_transactions_updated_at'
  ) THEN
    CREATE TRIGGER update_financial_transactions_updated_at 
      BEFORE UPDATE ON financial_transactions 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Trigger updated_at creato';
  END IF;
END $$;

-- Verifica constraint CHECK se non esistono
DO $$
BEGIN
  -- Constraint per type
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%type%check%' 
    AND conrelid = 'financial_transactions'::regclass
  ) THEN
    ALTER TABLE financial_transactions 
    ADD CONSTRAINT financial_transactions_type_check 
    CHECK (type IN ('buy', 'sell', 'dividend', 'interest'));
    RAISE NOTICE 'Constraint type aggiunto';
  END IF;

  -- Constraint per asset_type
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%asset_type%check%' 
    AND conrelid = 'financial_transactions'::regclass
  ) THEN
    ALTER TABLE financial_transactions 
    ADD CONSTRAINT financial_transactions_asset_type_check 
    CHECK (asset_type IN ('stock', 'etf', 'bond', 'crypto', 'commodity'));
    RAISE NOTICE 'Constraint asset_type aggiunto';
  END IF;

  -- Constraint per quantity
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%quantity%check%' 
    AND conrelid = 'financial_transactions'::regclass
  ) THEN
    ALTER TABLE financial_transactions 
    ADD CONSTRAINT financial_transactions_quantity_check 
    CHECK (quantity > 0);
    RAISE NOTICE 'Constraint quantity aggiunto';
  END IF;

  -- Constraint per price
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%price%check%' 
    AND conrelid = 'financial_transactions'::regclass
  ) THEN
    ALTER TABLE financial_transactions 
    ADD CONSTRAINT financial_transactions_price_check 
    CHECK (price >= 0);
    RAISE NOTICE 'Constraint price aggiunto';
  END IF;

  -- Constraint per fees
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE '%fees%check%' 
    AND conrelid = 'financial_transactions'::regclass
  ) THEN
    ALTER TABLE financial_transactions 
    ADD CONSTRAINT financial_transactions_fees_check 
    CHECK (fees >= 0);
    RAISE NOTICE 'Constraint fees aggiunto';
  END IF;
END $$;

-- Crea funzioni di utilità se non esistono
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

-- Crea funzione per metriche portfolio
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

-- Aggiorna commenti sulla tabella
COMMENT ON TABLE financial_transactions IS 'Tabella per tracciare tutte le transazioni finanziarie degli utenti - Schema assicurato per risolvere PGRST204';
COMMENT ON COLUMN financial_transactions.date IS 'Data della transazione - Colonna critica per PGRST204';
COMMENT ON COLUMN financial_transactions.type IS 'Tipo di transazione: buy, sell, dividend, interest';
COMMENT ON COLUMN financial_transactions.asset_type IS 'Tipo di asset: stock, etf, bond, crypto, commodity';

-- Messaggio finale
DO $$
BEGIN
  RAISE NOTICE '✅ Schema financial_transactions assicurato e verificato';
  RAISE NOTICE '✅ Tutte le colonne, indici, policy e constraint sono presenti';
  RAISE NOTICE '✅ Problema PGRST204 dovrebbe essere risolto';
END $$;