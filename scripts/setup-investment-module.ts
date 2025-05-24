#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Carica variabili d'ambiente
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Errore: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devono essere configurati in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupInvestmentModule() {
  console.log('🚀 Avvio setup modulo investimenti...\n');

  try {
    // 1. Esegui migration schema database
    console.log('📊 Creazione tabelle database...');
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'investment-schema.sql'),
      'utf8'
    );
    
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schemaSQL
    });

    if (schemaError) {
      console.error('❌ Errore creazione schema:', schemaError);
      throw schemaError;
    }
    console.log('✅ Tabelle create con successo');

    // 2. Esegui funzioni database
    console.log('\n📝 Creazione funzioni database...');
    const functionsSQL = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'investment-functions.sql'),
      'utf8'
    );
    
    const { error: functionsError } = await supabase.rpc('exec_sql', {
      sql: functionsSQL
    });

    if (functionsError) {
      console.error('❌ Errore creazione funzioni:', functionsError);
      throw functionsError;
    }
    console.log('✅ Funzioni create con successo');

    // 3. Verifica installazione
    console.log('\n🔍 Verifica installazione...');
    
    // Verifica tabelle
    const tables = [
      'investment_goals',
      'portfolio_allocations',
      'financial_transactions',
      'portfolio_holdings'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Errore verifica tabella ${table}:`, error);
        throw error;
      }
      console.log(`✅ Tabella ${table} verificata`);
    }

    // 4. Crea dati di esempio (opzionale)
    console.log('\n📦 Vuoi creare dati di esempio? (y/n)');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        await createSampleData();
      }
      
      console.log('\n✨ Setup completato con successo!');
      console.log('\n📚 Prossimi passi:');
      console.log('1. Avvia il server di sviluppo: npm run dev');
      console.log('2. Vai alla sezione Goals per creare i tuoi obiettivi');
      console.log('3. Aggiungi transazioni nella sezione Financial Transactions');
      console.log('4. Monitora il tuo progresso nella Dashboard');
      
      readline.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('\n❌ Errore durante il setup:', error);
    process.exit(1);
  }
}

async function createSampleData() {
  console.log('\n📝 Creazione dati di esempio...');
  
  try {
    // Ottieni l'utente corrente (assumendo che ci sia un utente di test)
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError || !users || users.length === 0) {
      console.log('⚠️  Nessun utente trovato. Salta creazione dati di esempio.');
      return;
    }

    const userId = users[0].id;
    console.log(`📤 Creazione dati per utente: ${users[0].email}`);

    // Crea obiettivo di esempio
    const { data: goal, error: goalError } = await supabase
      .from('investment_goals')
      .insert({
        user_id: userId,
        title: 'Portfolio Bilanciato FIRE',
        description: 'Allocazione target per raggiungere FIRE in 15 anni',
        goal_type: 'portfolio_allocation',
        target_value: 500000,
        current_value: 0,
        target_date: new Date(new Date().setFullYear(new Date().getFullYear() + 15)).toISOString()
      })
      .select()
      .single();

    if (goalError) {
      console.error('❌ Errore creazione obiettivo:', goalError);
      return;
    }

    // Crea allocazioni target
    const allocations = [
      { asset_class: 'stocks', target_percentage: 60 },
      { asset_class: 'bonds', target_percentage: 20 },
      { asset_class: 'etf', target_percentage: 15 },
      { asset_class: 'cash', target_percentage: 5 }
    ];

    for (const allocation of allocations) {
      await supabase
        .from('portfolio_allocations')
        .insert({
          goal_id: goal.id,
          ...allocation
        });
    }

    // Crea alcune transazioni di esempio
    const transactions = [
      {
        user_id: userId,
        transaction_type: 'buy',
        asset_type: 'etf',
        asset_name: 'Vanguard S&P 500 ETF',
        ticker_symbol: 'VOO',
        quantity: 10,
        price_per_unit: 400,
        total_amount: 4000,
        transaction_date: new Date().toISOString().split('T')[0],
        fees: 5
      },
      {
        user_id: userId,
        transaction_type: 'buy',
        asset_type: 'stock',
        asset_name: 'Apple Inc.',
        ticker_symbol: 'AAPL',
        quantity: 20,
        price_per_unit: 180,
        total_amount: 3600,
        transaction_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fees: 5
      }
    ];

    for (const transaction of transactions) {
      await supabase
        .from('financial_transactions')
        .insert(transaction);
    }

    console.log('✅ Dati di esempio creati con successo');

  } catch (error) {
    console.error('❌ Errore creazione dati di esempio:', error);
  }
}

// Esegui setup
setupInvestmentModule();