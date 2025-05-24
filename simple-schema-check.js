#!/usr/bin/env node

/**
 * Script semplificato per verificare lo schema financial_transactions
 * Versione minimalista senza dipendenze esterne
 * Usa solo @supabase/supabase-js e moduli Node.js nativi
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * Carica automaticamente le variabili di ambiente dal file .env.local
 */
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          // Rimuovi virgolette se presenti
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key.trim()] = value;
        }
      }
    });
    console.log('✅ Variabili di ambiente caricate da .env.local');
  } catch (error) {
    console.log('⚠️  File .env.local non trovato o non leggibile, uso variabili di ambiente esistenti');
  }
}

// Carica automaticamente le variabili di ambiente
loadEnvFile();

// Leggi variabili ambiente da process.env (ora caricate automaticamente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRORE: Variabili di ambiente mancanti');
  console.error('');
  console.error('Assicurati di aver configurato:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Nel file .env.local oppure nelle variabili di ambiente del sistema');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableExists() {
  console.log('🔍 Verifica tabella financial_transactions...');
  
  try {
    // Prova una query semplice per verificare se la tabella esiste
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Tabella financial_transactions: NON ESISTE');
        return false;
      } else {
        console.log('⚠️  Tabella financial_transactions: ERRORE -', error.message);
        return null;
      }
    }
    
    console.log('✅ Tabella financial_transactions: ESISTE');
    return true;
  } catch (err) {
    console.log('⚠️  Errore nella verifica:', err.message);
    return null;
  }
}

async function checkBasicColumns() {
  console.log('\n🔍 Verifica colonne essenziali...');
  
  const essentialColumns = ['id', 'user_id', 'date', 'type', 'ticker', 'quantity', 'price'];
  const results = {};
  
  for (const column of essentialColumns) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select(column)
        .limit(1);
      
      if (error) {
        console.log(`❌ Colonna ${column}: NON ACCESSIBILE`);
        results[column] = false;
      } else {
        console.log(`✅ Colonna ${column}: OK`);
        results[column] = true;
      }
    } catch (err) {
      console.log(`⚠️  Colonna ${column}: ERRORE -`, err.message);
      results[column] = null;
    }
  }
  
  return results;
}

async function checkRLSStatus() {
  console.log('\n🔍 Verifica RLS (Row Level Security)...');
  
  try {
    // Prova a inserire un record di test (dovrebbe fallire se RLS è attivo senza auth)
    const { data, error } = await supabase
      .from('financial_transactions')
      .insert({
        user_id: 'test-user-id',
        date: '2024-01-01',
        type: 'buy',
        ticker: 'TEST',
        quantity: 1,
        price: 100
      })
      .select();
    
    if (error) {
      if (error.code === '42501' || error.message.includes('RLS') || error.message.includes('policy')) {
        console.log('✅ RLS: ATTIVO (sicurezza abilitata)');
        return true;
      } else {
        console.log('⚠️  RLS: ERRORE nella verifica -', error.message);
        return null;
      }
    } else {
      console.log('❌ RLS: NON ATTIVO (attenzione: tabella non protetta!)');
      // Rimuovi il record di test se inserito
      if (data && data[0]) {
        await supabase
          .from('financial_transactions')
          .delete()
          .eq('id', data[0].id);
      }
      return false;
    }
  } catch (err) {
    console.log('⚠️  Errore nella verifica RLS:', err.message);
    return null;
  }
}

function generateSimpleReport(tableExists, columns, rlsActive) {
  console.log('\n📊 REPORT SEMPLIFICATO');
  console.log('======================');
  
  if (tableExists === false) {
    console.log('❌ STATO: Schema NON applicato');
    console.log('');
    console.log('🔧 AZIONE RICHIESTA:');
    console.log('   1. Applica lo schema manualmente nel Supabase Dashboard');
    console.log('   2. Oppure usa: node apply-financial-transactions-schema.js');
    console.log('');
    return;
  }
  
  if (tableExists === null) {
    console.log('⚠️  STATO: Errore nella verifica');
    console.log('');
    console.log('🔧 AZIONE RICHIESTA:');
    console.log('   1. Verifica le credenziali Supabase');
    console.log('   2. Controlla la connessione al database');
    console.log('');
    return;
  }
  
  // Conta colonne funzionanti
  const workingColumns = Object.values(columns).filter(status => status === true).length;
  const totalColumns = Object.keys(columns).length;
  
  console.log(`✅ STATO: Tabella esistente (${workingColumns}/${totalColumns} colonne OK)`);
  
  if (workingColumns < totalColumns) {
    console.log('⚠️  Alcune colonne potrebbero mancare o essere inaccessibili');
  }
  
  if (rlsActive === true) {
    console.log('🔒 SICUREZZA: RLS attivo (buono)');
  } else if (rlsActive === false) {
    console.log('⚠️  SICUREZZA: RLS non attivo (attenzione!)');
  }
  
  console.log('');
  console.log('💡 PROSSIMI PASSI:');
  if (workingColumns === totalColumns && rlsActive === true) {
    console.log('   ✅ Schema sembra completo e sicuro');
    console.log('   🧪 Testa con: node test-financial-transaction.js');
  } else {
    console.log('   🔧 Applica schema completo nel Supabase Dashboard');
    console.log('   📋 Usa il file: supabase/financial-transactions-schema-safe.sql');
  }
}

async function main() {
  console.log('🔍 VERIFICA SEMPLIFICATA SCHEMA FINANCIAL TRANSACTIONS');
  console.log('======================================================');
  console.log(`📍 URL Supabase: ${supabaseUrl}`);
  console.log('');
  
  try {
    const tableExists = await checkTableExists();
    
    let columns = {};
    let rlsActive = null;
    
    if (tableExists === true) {
      columns = await checkBasicColumns();
      rlsActive = await checkRLSStatus();
    }
    
    generateSimpleReport(tableExists, columns, rlsActive);
    
  } catch (error) {
    console.error('\n❌ ERRORE FATALE:', error.message);
    console.error('');
    console.error('🔧 POSSIBILI SOLUZIONI:');
    console.error('   1. Verifica le variabili di ambiente');
    console.error('   2. Controlla la connessione internet');
    console.error('   3. Verifica le credenziali Supabase');
    process.exit(1);
  }
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main();
}

module.exports = { main };