import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase-server';
import type { Database } from '@/types/supabase';

type Transaction = Database['public']['Tables']['financial_transactions']['Row'];
type Holding = Database['public']['Tables']['portfolio_holdings']['Row'];

export async function POST(request: Request) {
  try {
    const supabase = await createServerComponentClient();
    
    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Ottieni tutte le transazioni dell'utente
    const { data: transactions, error: transError } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (transError) {
      console.error('Errore nel recupero transazioni:', transError);
      return NextResponse.json({ error: 'Errore nel recupero transazioni' }, { status: 500 });
    }

    // Calcola holdings attuali
    const holdings = new Map<string, {
      ticker_symbol: string | null;
      asset_name: string;
      total_quantity: number;
      average_cost: number;
      total_cost: number;
      asset_type: string;
    }>();

    transactions?.forEach((transaction: Transaction) => {
      if (transaction.transaction_type === 'buy' || transaction.transaction_type === 'sell') {
        const key = transaction.ticker_symbol || transaction.asset_name;
        const existing = holdings.get(key) || {
          ticker_symbol: transaction.ticker_symbol,
          asset_name: transaction.asset_name,
          total_quantity: 0,
          average_cost: 0,
          total_cost: 0,
          asset_type: transaction.asset_type
        };

        if (transaction.transaction_type === 'buy') {
          const newQuantity = existing.total_quantity + (transaction.quantity || 0);
          const newTotalCost = existing.total_cost + (transaction.total_amount || 0);
          existing.total_quantity = newQuantity;
          existing.total_cost = newTotalCost;
          existing.average_cost = newQuantity > 0 ? newTotalCost / newQuantity : 0;
        } else if (transaction.transaction_type === 'sell') {
          existing.total_quantity -= (transaction.quantity || 0);
          if (existing.total_quantity > 0) {
            existing.total_cost = existing.total_quantity * existing.average_cost;
          } else {
            existing.total_cost = 0;
            existing.average_cost = 0;
          }
        }

        if (existing.total_quantity > 0) {
          holdings.set(key, existing);
        } else {
          holdings.delete(key);
        }
      }
    });

    // Aggiorna la tabella portfolio_holdings
    const holdingsArray = Array.from(holdings.values());
    
    // Prima elimina tutti gli holdings esistenti
    const { error: deleteError } = await supabase
      .from('portfolio_holdings')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Errore nell\'eliminazione holdings:', deleteError);
      return NextResponse.json({ error: 'Errore nell\'aggiornamento holdings' }, { status: 500 });
    }

    // Inserisci i nuovi holdings
    if (holdingsArray.length > 0) {
      const { error: insertError } = await supabase
        .from('portfolio_holdings')
        .insert(
          holdingsArray.map(holding => ({
            user_id: user.id,
            ticker_symbol: holding.ticker_symbol,
            asset_name: holding.asset_name,
            total_quantity: holding.total_quantity,
            average_cost: holding.average_cost,
            total_cost: holding.total_cost,
            asset_type: holding.asset_type,
            current_price: holding.average_cost, // Sarà aggiornato dall'API prezzi
            current_value: holding.total_quantity * holding.average_cost,
            unrealized_gain_loss: 0,
            percentage_of_portfolio: 0
          }))
        );

      if (insertError) {
        console.error('Errore nell\'inserimento holdings:', insertError);
        return NextResponse.json({ error: 'Errore nell\'inserimento holdings' }, { status: 500 });
      }
    }

    // Calcola allocazioni per asset type
    const allocations = new Map<string, number>();
    let totalValue = 0;

    holdingsArray.forEach(holding => {
      const value = holding.total_quantity * holding.average_cost;
      totalValue += value;
      const currentAllocation = allocations.get(holding.asset_type) || 0;
      allocations.set(holding.asset_type, currentAllocation + value);
    });

    // Aggiorna portfolio_allocations
    const { error: deleteAllocError } = await supabase
      .from('portfolio_allocations')
      .delete()
      .eq('user_id', user.id);

    if (deleteAllocError) {
      console.error('Errore nell\'eliminazione allocazioni:', deleteAllocError);
      return NextResponse.json({ error: 'Errore nell\'aggiornamento allocazioni' }, { status: 500 });
    }

    if (totalValue > 0) {
      const allocationsArray = Array.from(allocations.entries()).map(([assetType, value]) => ({
        user_id: user.id,
        asset_type: assetType,
        current_percentage: (value / totalValue) * 100,
        current_value: value
      }));

      const { error: insertAllocError } = await supabase
        .from('portfolio_allocations')
        .insert(allocationsArray);

      if (insertAllocError) {
        console.error('Errore nell\'inserimento allocazioni:', insertAllocError);
        return NextResponse.json({ error: 'Errore nell\'inserimento allocazioni' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      holdings: holdingsArray,
      allocations: Array.from(allocations.entries()).map(([type, value]) => ({
        asset_type: type,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
      })),
      totalValue
    });

  } catch (error) {
    console.error('Errore nella sincronizzazione portfolio:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerComponentClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Ottieni holdings attuali
    const { data: holdings, error: holdingsError } = await supabase
      .from('portfolio_holdings')
      .select('*')
      .eq('user_id', user.id);

    if (holdingsError) {
      console.error('Errore nel recupero holdings:', holdingsError);
      return NextResponse.json({ error: 'Errore nel recupero holdings' }, { status: 500 });
    }

    // Ottieni allocazioni attuali
    const { data: allocations, error: allocError } = await supabase
      .from('portfolio_allocations')
      .select('*')
      .eq('user_id', user.id);

    if (allocError) {
      console.error('Errore nel recupero allocazioni:', allocError);
      return NextResponse.json({ error: 'Errore nel recupero allocazioni' }, { status: 500 });
    }

    const totalValue = holdings?.reduce((sum: number, holding: Holding) => sum + (holding.current_value || 0), 0) || 0;

    return NextResponse.json({
      holdings: holdings || [],
      allocations: allocations || [],
      totalValue
    });

  } catch (error) {
    console.error('Errore nel recupero dati portfolio:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}