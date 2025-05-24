#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carica variabili d'ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Errore: Variabili Supabase non configurate');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInvestmentModule() {
  console.log('🧪 Test Modulo Investimenti\n');

  try {
    // 1. Test API Portfolio Sync
    console.log('📊 Test API Portfolio Sync...');
    const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/portfolio/sync`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (syncResponse.ok) {
      const syncData = await syncResponse.json();
      console.log('✅ Portfolio Sync API funzionante');
      console.log(`   - Holdings: ${syncData.holdings?.length || 0}`);
      console.log(`   - Valore totale: €${syncData.totalValue?.toFixed(2) || '0.00'}`);
    } else {
      console.log('❌ Errore Portfolio Sync API:', syncResponse.status);
    }

    // 2. Test API Prezzi
    console.log('\n💰 Test API Prezzi...');
    const pricesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/portfolio/prices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (pricesResponse.ok) {
      const pricesData = await pricesResponse.json();
      console.log('✅ Prices API funzionante');
      console.log(`   - Prezzi disponibili: ${pricesData.prices?.length || 0}`);
    } else {
      console.log('❌ Errore Prices API:', pricesResponse.status);
    }

    // 3. Test API Goals Progress
    console.log('\n🎯 Test API Goals Progress...');
    const goalsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/goals/check-progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (goalsResponse.ok) {
      const goalsData = await goalsResponse.json();
      console.log('✅ Goals Progress API funzionante');
      console.log(`   - Obiettivi totali: ${goalsData.summary?.total || 0}`);
      console.log(`   - In linea: ${goalsData.summary?.onTrack || 0}`);
      console.log(`   - Richiedono attenzione: ${goalsData.summary?.needsAction || 0}`);
    } else {
      console.log('❌ Errore Goals Progress API:', goalsResponse.status);
    }

    // 4. Test Database Tables
    console.log('\n🗄️  Test Tabelle Database...');
    
    const tables = [
      { name: 'investment_goals', displayName: 'Obiettivi Investimento' },
      { name: 'portfolio_allocations', displayName: 'Allocazioni Portfolio' },
      { name: 'financial_transactions', displayName: 'Transazioni Finanziarie' },
      { name: 'portfolio_holdings', displayName: 'Holdings Portfolio' }
    ];

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table.name)
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.displayName}: Errore - ${error.message}`);
      } else {
        console.log(`✅ ${table.displayName}: OK (${data} record)`);
      }
    }

    // 5. Test Funzionalità Critiche
    console.log('\n⚡ Test Funzionalità Critiche...');
    
    // Test calcolo allocazioni
    const { data: allocations } = await supabase
      .from('portfolio_allocations')
      .select('*')
      .limit(5);

    if (allocations && allocations.length > 0) {
      const totalPercentage = allocations.reduce((sum, a) => sum + (a.current_percentage || 0), 0);
      console.log(`✅ Calcolo allocazioni: ${totalPercentage.toFixed(2)}% totale`);
      
      if (Math.abs(totalPercentage - 100) > 1 && totalPercentage > 0) {
        console.log('   ⚠️  Attenzione: Le allocazioni non sommano al 100%');
      }
    } else {
      console.log('   ℹ️  Nessuna allocazione trovata');
    }

    // Test deviazioni
    const { data: goals } = await supabase
      .from('investment_goals')
      .select('*, portfolio_allocations(*)')
      .eq('goal_type', 'portfolio_allocation')
      .limit(1)
      .single();

    if (goals && goals.portfolio_allocations) {
      console.log(`✅ Controllo deviazioni per obiettivo: ${goals.title}`);
      const deviations = goals.portfolio_allocations.filter((a: any) => 
        Math.abs((a.current_percentage || 0) - a.target_percentage) > 5
      );
      
      if (deviations.length > 0) {
        console.log(`   ⚠️  ${deviations.length} allocazioni deviano >5% dal target`);
      } else {
        console.log('   ✅ Tutte le allocazioni sono entro i limiti');
      }
    }

    console.log('\n✨ Test completati!');
    
    // Riepilogo
    console.log('\n📋 RIEPILOGO TEST');
    console.log('================');
    console.log('Se tutti i test sono passati (✅), il modulo è pronto all\'uso.');
    console.log('Se ci sono errori (❌), verifica:');
    console.log('1. Il server Next.js è in esecuzione (npm run dev)');
    console.log('2. Le variabili d\'ambiente sono configurate');
    console.log('3. Il database è stato inizializzato con setup:investment');
    console.log('4. Sei autenticato nell\'applicazione');

  } catch (error) {
    console.error('\n❌ Errore durante i test:', error);
    process.exit(1);
  }
}

// Esegui test
testInvestmentModule();