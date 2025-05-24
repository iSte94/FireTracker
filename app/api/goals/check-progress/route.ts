import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

type Goal = Database['public']['Tables']['investment_goals']['Row'];
type Allocation = Database['public']['Tables']['portfolio_allocations']['Row'];

export async function GET(request: Request) {
  try {
    console.log('=== API GOALS CHECK-PROGRESS DEBUG ===');
    console.log('Request URL:', request.url);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const supabase = await createServerComponentClient();
    
    // Verifica autenticazione
    console.log('Tentativo di ottenere utente...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth result:');
    console.log('- User found:', !!user);
    console.log('- User ID:', user?.id);
    console.log('- Auth error:', authError?.message);
    
    if (authError || !user) {
      console.log('RETURNING 401 - No user or auth error');
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    
    console.log('User authenticated successfully, proceeding...');

    // Ottieni tutti gli obiettivi attivi dell'utente
    const { data: goals, error: goalsError } = await supabase
      .from('investment_goals')
      .select(`
        *,
        portfolio_allocations (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (goalsError) {
      console.error('Errore nel recupero obiettivi:', goalsError);
      return NextResponse.json({ error: 'Errore nel recupero obiettivi' }, { status: 500 });
    }

    // Ottieni il valore totale del portfolio
    const { data: holdings, error: holdingsError } = await supabase
      .from('portfolio_holdings')
      .select('current_value, asset_type')
      .eq('user_id', user.id);

    if (holdingsError) {
      console.error('Errore nel recupero holdings:', holdingsError);
      return NextResponse.json({ error: 'Errore nel recupero holdings' }, { status: 500 });
    }

    const totalPortfolioValue = holdings?.reduce((sum, h) => sum + (h.current_value || 0), 0) || 0;

    // Calcola allocazioni correnti per asset type
    const currentAllocations = new Map<string, number>();
    holdings?.forEach(holding => {
      const current = currentAllocations.get(holding.asset_type) || 0;
      currentAllocations.set(holding.asset_type, current + (holding.current_value || 0));
    });

    // Analizza ogni obiettivo
    const goalsProgress = await Promise.all(
      goals?.map(async (goal: any) => {
        let progress = 0;
        let status = 'on_track';
        let deviations: any[] = [];

        switch (goal.goal_type) {
          case 'target_portfolio_value':
            progress = totalPortfolioValue > 0 ? (totalPortfolioValue / goal.target_value) * 100 : 0;
            if (progress < 80) status = 'behind';
            if (progress >= 100) status = 'completed';
            break;

          case 'portfolio_allocation':
            // Verifica deviazioni dalle allocazioni target
            const allocations = goal.portfolio_allocations as Allocation[];
            allocations?.forEach(allocation => {
              const currentValue = currentAllocations.get(allocation.asset_class) || 0;
              const currentPercentage = totalPortfolioValue > 0
                ? (currentValue / totalPortfolioValue) * 100
                : 0;
              const deviation = Math.abs(currentPercentage - allocation.target_percentage);
              
              if (deviation > 5) {
                deviations.push({
                  asset_class: allocation.asset_class,
                  target: allocation.target_percentage,
                  current: currentPercentage,
                  deviation: deviation,
                  action: currentPercentage < allocation.target_percentage ? 'increase' : 'decrease'
                });
              }
            });
            
            // Calcola progresso basato sulle deviazioni
            const avgDeviation = deviations.length > 0
              ? deviations.reduce((sum, d) => sum + d.deviation, 0) / deviations.length
              : 0;
            progress = Math.max(0, 100 - avgDeviation * 2);
            
            if (deviations.length > 0) status = 'needs_rebalancing';
            break;

          case 'monthly_investment':
            // Calcola investimenti del mese corrente
            const currentMonth = new Date().toISOString().slice(0, 7);
            const { data: monthlyTransactions } = await supabase
              .from('financial_transactions')
              .select('total_amount')
              .eq('user_id', user.id)
              .eq('transaction_type', 'buy')
              .gte('transaction_date', `${currentMonth}-01`)
              .lte('transaction_date', `${currentMonth}-31`);

            const monthlyInvested = monthlyTransactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
            progress = goal.target_value > 0 ? (monthlyInvested / goal.target_value) * 100 : 0;
            
            if (progress < 100) status = 'incomplete';
            if (progress >= 100) status = 'completed';
            break;

          case 'annual_return':
            // Calcola rendimento annuale
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            const { data: yearAgoHoldings } = await supabase
              .from('financial_transactions')
              .select('total_amount')
              .eq('user_id', user.id)
              .lte('transaction_date', oneYearAgo.toISOString().split('T')[0]);

            const yearAgoValue = yearAgoHoldings?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
            const annualReturn = yearAgoValue > 0
              ? ((totalPortfolioValue - yearAgoValue) / yearAgoValue) * 100
              : 0;
            
            progress = goal.target_value > 0 ? (annualReturn / goal.target_value) * 100 : 0;
            
            if (progress < 80) status = 'underperforming';
            if (progress >= 100) status = 'achieved';
            break;
        }

        return {
          id: goal.id,
          title: goal.title,
          goal_type: goal.goal_type,
          target_value: goal.target_value,
          current_value: goal.current_value,
          progress: Math.min(100, Math.max(0, progress)),
          status,
          deviations,
          last_checked: new Date().toISOString()
        };
      }) || []
    );

    // Identifica obiettivi che necessitano attenzione
    const needsAttention = goalsProgress.filter(g => 
      g.status === 'behind' || 
      g.status === 'needs_rebalancing' || 
      g.status === 'underperforming'
    );

    return NextResponse.json({
      success: true,
      totalPortfolioValue,
      goalsProgress,
      needsAttention,
      summary: {
        total: goalsProgress.length,
        onTrack: goalsProgress.filter(g => g.status === 'on_track').length,
        completed: goalsProgress.filter(g => g.status === 'completed' || g.status === 'achieved').length,
        needsAction: needsAttention.length
      }
    });

  } catch (error) {
    console.error('Errore nel controllo progresso obiettivi:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// POST endpoint per aggiornare il progresso di un obiettivo specifico
export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient();
    const body = await request.json();
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json({ error: 'ID obiettivo richiesto' }, { status: 400 });
    }

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Ottieni l'obiettivo
    const { data: goal, error: goalError } = await supabase
      .from('investment_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Obiettivo non trovato' }, { status: 404 });
    }

    // Calcola il nuovo valore corrente basato sul tipo di obiettivo
    let newCurrentValue = goal.current_value;

    switch (goal.goal_type) {
      case 'target_portfolio_value':
        const { data: holdings } = await supabase
          .from('portfolio_holdings')
          .select('current_value')
          .eq('user_id', user.id);
        
        newCurrentValue = holdings?.reduce((sum, h) => sum + (h.current_value || 0), 0) || 0;
        break;

      case 'monthly_investment':
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: monthlyTransactions } = await supabase
          .from('financial_transactions')
          .select('total_amount')
          .eq('user_id', user.id)
          .eq('transaction_type', 'buy')
          .gte('transaction_date', `${currentMonth}-01`)
          .lte('transaction_date', `${currentMonth}-31`);

        newCurrentValue = monthlyTransactions?.reduce((sum, t) => sum + t.total_amount, 0) || 0;
        break;
    }

    // Aggiorna l'obiettivo
    const { error: updateError } = await supabase
      .from('investment_goals')
      .update({
        current_value: newCurrentValue,
        status: newCurrentValue >= goal.target_value ? 'completed' : 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId);

    if (updateError) {
      console.error('Errore aggiornamento obiettivo:', updateError);
      return NextResponse.json({ error: 'Errore aggiornamento obiettivo' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      goalId,
      previousValue: goal.current_value,
      newValue: newCurrentValue,
      progress: (newCurrentValue / goal.target_value) * 100
    });

  } catch (error) {
    console.error('Errore aggiornamento progresso:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}