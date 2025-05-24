-- Test data for investment goals module
-- This script creates sample data for testing the goals page

-- First, get a test user ID (you'll need to replace this with an actual user ID from your auth.users table)
-- You can find your user ID by running: SELECT id, email FROM auth.users;

-- Replace this with your actual user ID
DO $$
DECLARE
    test_user_id UUID := 'YOUR_USER_ID_HERE'; -- REPLACE THIS!
    goal1_id UUID;
    goal2_id UUID;
    goal3_id UUID;
BEGIN
    -- Create a portfolio allocation goal
    INSERT INTO investment_goals (
        user_id, 
        title, 
        description, 
        goal_type, 
        target_value, 
        current_value, 
        target_date, 
        status
    ) VALUES (
        test_user_id,
        'Portfolio Bilanciato 60/40',
        'Mantenere un portfolio bilanciato con 60% azioni e 40% obbligazioni',
        'portfolio_allocation',
        100000,
        75000,
        '2025-12-31',
        'active'
    ) RETURNING id INTO goal1_id;

    -- Add allocations for the portfolio goal
    INSERT INTO portfolio_allocations (goal_id, asset_class, target_percentage, current_percentage) VALUES
    (goal1_id, 'stocks', 60, 65),
    (goal1_id, 'bonds', 40, 35);

    -- Create a target portfolio value goal
    INSERT INTO investment_goals (
        user_id, 
        title, 
        description, 
        goal_type, 
        target_value, 
        current_value, 
        target_date, 
        status
    ) VALUES (
        test_user_id,
        'Obiettivo Pensione FIRE',
        'Raggiungere 500.000€ per la pensione anticipata',
        'target_portfolio_value',
        500000,
        125000,
        '2035-01-01',
        'active'
    ) RETURNING id INTO goal2_id;

    -- Create a monthly investment goal
    INSERT INTO investment_goals (
        user_id, 
        title, 
        description, 
        goal_type, 
        target_value, 
        current_value, 
        status
    ) VALUES (
        test_user_id,
        'Investimento Mensile PAC',
        'Investire almeno 1000€ al mese nel portfolio',
        'monthly_investment',
        1000,
        850,
        'active'
    ) RETURNING id INTO goal3_id;

    -- Add some sample transactions
    INSERT INTO financial_transactions (
        user_id,
        transaction_type,
        asset_type,
        asset_name,
        ticker_symbol,
        quantity,
        price_per_unit,
        total_amount,
        transaction_date,
        currency,
        fees
    ) VALUES
    -- Stock purchases
    (test_user_id, 'buy', 'stock', 'Apple Inc.', 'AAPL', 10, 150.00, 1500.00, '2024-01-15', 'EUR', 5.00),
    (test_user_id, 'buy', 'stock', 'Microsoft Corp.', 'MSFT', 5, 300.00, 1500.00, '2024-02-01', 'EUR', 5.00),
    (test_user_id, 'buy', 'etf', 'Vanguard S&P 500', 'VOO', 20, 400.00, 8000.00, '2024-02-15', 'EUR', 10.00),
    
    -- Bond purchases
    (test_user_id, 'buy', 'bond', 'Italian Government Bond', 'BTP', 100, 98.50, 9850.00, '2024-03-01', 'EUR', 15.00),
    (test_user_id, 'buy', 'etf', 'iShares Euro Bond', 'IEAC', 50, 120.00, 6000.00, '2024-03-15', 'EUR', 8.00),
    
    -- Crypto purchase
    (test_user_id, 'buy', 'crypto', 'Bitcoin', 'BTC', 0.5, 45000.00, 22500.00, '2024-04-01', 'EUR', 50.00),
    
    -- Dividend received
    (test_user_id, 'dividend', 'stock', 'Apple Inc.', 'AAPL', NULL, NULL, 50.00, '2024-04-15', 'EUR', 0.00);

    -- Add sample portfolio holdings
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
        percentage_of_portfolio
    ) VALUES
    (test_user_id, 'stock', 'Apple Inc.', 'AAPL', 10, 150.00, 1500.00, 165.00, 1650.00, 150.00, 2.2),
    (test_user_id, 'stock', 'Microsoft Corp.', 'MSFT', 5, 300.00, 1500.00, 320.00, 1600.00, 100.00, 2.1),
    (test_user_id, 'etf', 'Vanguard S&P 500', 'VOO', 20, 400.00, 8000.00, 420.00, 8400.00, 400.00, 11.2),
    (test_user_id, 'bond', 'Italian Government Bond', 'BTP', 100, 98.50, 9850.00, 99.00, 9900.00, 50.00, 13.2),
    (test_user_id, 'etf', 'iShares Euro Bond', 'IEAC', 50, 120.00, 6000.00, 118.00, 5900.00, -100.00, 7.9),
    (test_user_id, 'crypto', 'Bitcoin', 'BTC', 0.5, 45000.00, 22500.00, 95000.00, 47500.00, 25000.00, 63.3);

    RAISE NOTICE 'Test data created successfully!';
    RAISE NOTICE 'Goal 1 ID: %', goal1_id;
    RAISE NOTICE 'Goal 2 ID: %', goal2_id;
    RAISE NOTICE 'Goal 3 ID: %', goal3_id;
END $$;

-- To use this script:
-- 1. First find your user ID: SELECT id, email FROM auth.users;
-- 2. Replace 'YOUR_USER_ID_HERE' with your actual user ID
-- 3. Run this script in your Supabase SQL editor

-- To clean up test data:
-- DELETE FROM financial_transactions WHERE user_id = 'YOUR_USER_ID_HERE';
-- DELETE FROM portfolio_holdings WHERE user_id = 'YOUR_USER_ID_HERE';
-- DELETE FROM investment_goals WHERE user_id = 'YOUR_USER_ID_HERE';