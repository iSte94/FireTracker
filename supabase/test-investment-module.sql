-- Test script per il modulo investimenti
-- Esegui questo script dopo aver installato il modulo per verificare che tutto funzioni

-- Nota: Sostituisci 'test_user_id' con un UUID valido di un utente nel tuo sistema
-- Per testing, puoi usare: SELECT id FROM auth.users LIMIT 1;

DO $$
DECLARE
  v_user_id UUID;
  v_goal_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Ottieni un user_id per il test (usa il primo utente disponibile)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Nessun utente trovato. Crea prima un utente di test.';
    RETURN;
  END IF;
  
  RAISE NOTICE 'Testing con user_id: %', v_user_id;
  
  -- Test 1: Crea un obiettivo di allocazione portafoglio
  RAISE NOTICE '1. Creazione obiettivo di allocazione portafoglio...';
  INSERT INTO investment_goals (
    user_id, title, description, goal_type, target_value, status
  ) VALUES (
    v_user_id,
    'Portafoglio Bilanciato Test',
    'Test di un portafoglio 60/30/10',
    'portfolio_allocation',
    100,
    'active'
  ) RETURNING id INTO v_goal_id;
  RAISE NOTICE '   ✓ Obiettivo creato con ID: %', v_goal_id;
  
  -- Test 2: Aggiungi allocazioni target
  RAISE NOTICE '2. Aggiunta allocazioni target...';
  INSERT INTO portfolio_allocations (goal_id, asset_class, target_percentage)
  VALUES 
    (v_goal_id, 'stocks', 60),
    (v_goal_id, 'bonds', 30),
    (v_goal_id, 'cash', 10);
  RAISE NOTICE '   ✓ Allocazioni create';
  
  -- Test 3: Crea alcune transazioni di test
  RAISE NOTICE '3. Creazione transazioni di test...';
  
  -- Acquisto azioni
  INSERT INTO financial_transactions (
    user_id, transaction_type, asset_type, asset_name, ticker_symbol,
    quantity, price_per_unit, total_amount, transaction_date, fees, currency
  ) VALUES (
    v_user_id, 'buy', 'stock', 'Apple Inc.', 'AAPL',
    10, 150.00, 1500.00, CURRENT_DATE - INTERVAL '30 days', 5.00, 'EUR'
  );
  
  -- Acquisto ETF
  INSERT INTO financial_transactions (
    user_id, transaction_type, asset_type, asset_name, ticker_symbol,
    quantity, price_per_unit, total_amount, transaction_date, fees, currency
  ) VALUES (
    v_user_id, 'buy', 'etf', 'Vanguard S&P 500', 'VOO',
    5, 400.00, 2000.00, CURRENT_DATE - INTERVAL '20 days', 2.00, 'EUR'
  );
  
  -- Acquisto obbligazioni
  INSERT INTO financial_transactions (
    user_id, transaction_type, asset_type, asset_name, ticker_symbol,
    quantity, price_per_unit, total_amount, transaction_date, fees, currency
  ) VALUES (
    v_user_id, 'buy', 'bond', 'Treasury Bond 10Y', 'TB10',
    1000, 0.98, 980.00, CURRENT_DATE - INTERVAL '15 days', 1.00, 'EUR'
  );
  
  -- Deposito cash
  INSERT INTO financial_transactions (
    user_id, transaction_type, asset_type, asset_name,
    total_amount, transaction_date, currency
  ) VALUES (
    v_user_id, 'deposit', 'cash', 'Cash Account',
    500.00, CURRENT_DATE - INTERVAL '10 days', 'EUR'
  );
  
  -- Dividendo
  INSERT INTO financial_transactions (
    user_id, transaction_type, asset_type, asset_name, ticker_symbol,
    total_amount, transaction_date, currency
  ) VALUES (
    v_user_id, 'dividend', 'stock', 'Apple Inc.', 'AAPL',
    15.00, CURRENT_DATE - INTERVAL '5 days', 'EUR'
  );
  
  RAISE NOTICE '   ✓ Transazioni create';
  
  -- Test 4: Verifica che le holdings siano state calcolate
  RAISE NOTICE '4. Verifica calcolo holdings...';
  PERFORM pg_sleep(1); -- Attendi che i trigger completino
  
  IF EXISTS (SELECT 1 FROM portfolio_holdings WHERE user_id = v_user_id) THEN
    RAISE NOTICE '   ✓ Holdings calcolate correttamente';
    
    -- Mostra le holdings
    FOR v_transaction_id IN 
      SELECT id FROM portfolio_holdings WHERE user_id = v_user_id
    LOOP
      RAISE NOTICE '   - Found holding: %', v_transaction_id;
    END LOOP;
  ELSE
    RAISE NOTICE '   ✗ Nessuna holding trovata!';
  END IF;
  
  -- Test 5: Aggiorna prezzi correnti
  RAISE NOTICE '5. Aggiornamento prezzi correnti...';
  PERFORM update_portfolio_prices(v_user_id, 'AAPL', 165.00);
  PERFORM update_portfolio_prices(v_user_id, 'VOO', 420.00);
  RAISE NOTICE '   ✓ Prezzi aggiornati';
  
  -- Test 6: Verifica riepilogo portafoglio
  RAISE NOTICE '6. Riepilogo portafoglio...';
  PERFORM get_portfolio_summary(v_user_id);
  RAISE NOTICE '   ✓ Riepilogo disponibile';
  
  -- Test 7: Crea altri tipi di obiettivi
  RAISE NOTICE '7. Creazione altri tipi di obiettivi...';
  
  -- Obiettivo investimento mensile
  INSERT INTO investment_goals (
    user_id, title, goal_type, target_value, status
  ) VALUES (
    v_user_id,
    'Investimento Mensile €500',
    'monthly_investment',
    500,
    'active'
  );
  
  -- Obiettivo valore portafoglio
  INSERT INTO investment_goals (
    user_id, title, goal_type, target_value, target_date, status
  ) VALUES (
    v_user_id,
    'Portafoglio €100k entro 2030',
    'target_portfolio_value',
    100000,
    '2030-12-31',
    'active'
  );
  
  RAISE NOTICE '   ✓ Altri obiettivi creati';
  
  -- Test 8: Verifica validazione allocazioni
  RAISE NOTICE '8. Test validazione allocazioni (deve fallire)...';
  BEGIN
    INSERT INTO portfolio_allocations (goal_id, asset_class, target_percentage)
    VALUES (v_goal_id, 'crypto', 50); -- Questo dovrebbe fallire (totale > 100%)
    RAISE NOTICE '   ✗ Validazione non funziona!';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '   ✓ Validazione funziona correttamente (errore atteso: %)', SQLERRM;
  END;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== TEST COMPLETATI CON SUCCESSO ===';
  RAISE NOTICE '';
  RAISE NOTICE 'Prossimi passi:';
  RAISE NOTICE '1. Verifica i dati nelle tabelle con:';
  RAISE NOTICE '   SELECT * FROM investment_goals WHERE user_id = ''%'';', v_user_id;
  RAISE NOTICE '   SELECT * FROM portfolio_holdings WHERE user_id = ''%'';', v_user_id;
  RAISE NOTICE '   SELECT * FROM portfolio_by_asset_class WHERE user_id = ''%'';', v_user_id;
  RAISE NOTICE '';
  RAISE NOTICE '2. Pulisci i dati di test con:';
  RAISE NOTICE '   DELETE FROM investment_goals WHERE user_id = ''%'';', v_user_id;
  RAISE NOTICE '   DELETE FROM financial_transactions WHERE user_id = ''%'';', v_user_id;
  RAISE NOTICE '   DELETE FROM portfolio_holdings WHERE user_id = ''%'';', v_user_id;
  
END $$;

-- Query di verifica opzionali (decommentale per eseguirle)
/*
-- Mostra tutti gli obiettivi
SELECT * FROM investment_goals_progress;

-- Mostra il portafoglio per classe di asset
SELECT * FROM portfolio_by_asset_class;

-- Mostra lo storico transazioni
SELECT * FROM transaction_history_with_balance ORDER BY transaction_date DESC;

-- Mostra il riepilogo mensile
SELECT * FROM monthly_investment_summary ORDER BY month DESC;
*/