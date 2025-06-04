import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('=== API GOALS CHECK-PROGRESS DEBUG ===');
    console.log('Request URL:', request.url);
    
    // Verifica autenticazione
    const session = await getServerSession(authOptions);
    
    console.log('Auth result:');
    console.log('- Session found:', !!session);
    console.log('- User ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      console.log('RETURNING 401 - No session or user');
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }
    
    console.log('User authenticated successfully, proceeding...');

    // Ottieni tutti gli obiettivi attivi dell'utente
    const goals = await prisma.investmentGoal.findMany({
      where: {
        userId: session.user.id,
        status: 'active'
      },
      include: {
        portfolioAllocations: true
      }
    });

    if (!goals) {
      console.log('No goals found for user');
      return NextResponse.json({ goals: [], totalPortfolioValue: 0 });
    }

    // Ottieni il valore totale del portfolio
    const holdings = await prisma.portfolioHolding.findMany({
      where: {
        userId: session.user.id
      },
      select: {
        currentValue: true,
        assetType: true
      }
    });

    const totalPortfolioValue = holdings?.reduce((sum, h) => sum + Number(h.currentValue || 0), 0) || 0;

    // Calcola allocazioni correnti per asset type
    const currentAllocations = new Map<string, number>();
    holdings?.forEach(holding => {
      const current = currentAllocations.get(holding.assetType) || 0;
      currentAllocations.set(holding.assetType, current + Number(holding.currentValue || 0));
    });

    // Analizza ogni obiettivo
    const goalsProgress = await Promise.all(
      goals.map(async (goal) => {
        let progress = 0;
        let status = 'on_track';
        let deviations: any[] = [];

        switch (goal.goalType) {
          case 'target_portfolio_value':
            progress = totalPortfolioValue > 0 ? (totalPortfolioValue / Number(goal.targetValue)) * 100 : 0;
            if (progress < 80) status = 'behind';
            if (progress >= 100) status = 'completed';
            break;

          case 'portfolio_allocation':
            // Verifica deviazioni dalle allocazioni target
            const allocations = goal.portfolioAllocations;
            allocations?.forEach(allocation => {
              const currentValue = currentAllocations.get(allocation.assetClass) || 0;
              const currentPercentage = totalPortfolioValue > 0
                ? (currentValue / totalPortfolioValue) * 100
                : 0;
              const deviation = Math.abs(currentPercentage - Number(allocation.targetPercentage));
              
              if (deviation > 5) {
                deviations.push({
                  asset_class: allocation.assetClass,
                  target: Number(allocation.targetPercentage),
                  current: currentPercentage,
                  deviation: deviation,
                  action: currentPercentage < Number(allocation.targetPercentage) ? 'increase' : 'decrease'
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
            const monthlyTransactions = await prisma.financialTransaction.findMany({
              where: {
                userId: session.user.id,
                transactionType: 'buy',
                transactionDate: {
                  gte: new Date(`${currentMonth}-01`),
                  lte: new Date(`${currentMonth}-31`)
                }
              },
              select: {
                totalAmount: true
              }
            });

            const monthlyInvested = monthlyTransactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
            progress = Number(goal.targetValue) > 0 ? (monthlyInvested / Number(goal.targetValue)) * 100 : 0;
            
            if (progress < 100) status = 'incomplete';
            if (progress >= 100) status = 'completed';
            break;

          case 'annual_return':
            // Calcola rendimento annuale
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            const yearAgoTransactions = await prisma.financialTransaction.findMany({
              where: {
                userId: session.user.id,
                transactionDate: {
                  lte: oneYearAgo
                }
              },
              select: {
                totalAmount: true
              }
            });

            const yearAgoValue = yearAgoTransactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
            const annualReturn = yearAgoValue > 0
              ? ((totalPortfolioValue - yearAgoValue) / yearAgoValue) * 100
              : 0;
            
            progress = Number(goal.targetValue) > 0 ? (annualReturn / Number(goal.targetValue)) * 100 : 0;
            
            if (progress < 80) status = 'underperforming';
            if (progress >= 100) status = 'achieved';
            break;
        }

        return {
          id: goal.id,
          title: goal.title,
          goal_type: goal.goalType,
          target_value: Number(goal.targetValue),
          current_value: Number(goal.currentValue),
          progress: Math.min(100, Math.max(0, progress)),
          status,
          deviations,
          last_checked: new Date().toISOString()
        };
      })
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
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json({ error: 'ID obiettivo richiesto' }, { status: 400 });
    }

    // Verifica autenticazione
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // Ottieni l'obiettivo
    const goal = await prisma.investmentGoal.findFirst({
      where: {
        id: goalId,
        userId: session.user.id
      }
    });

    if (!goal) {
      return NextResponse.json({ error: 'Obiettivo non trovato' }, { status: 404 });
    }

    // Calcola il nuovo valore corrente basato sul tipo di obiettivo
    let newCurrentValue = Number(goal.currentValue);

    switch (goal.goalType) {
      case 'target_portfolio_value':
        const holdings = await prisma.portfolioHolding.findMany({
          where: {
            userId: session.user.id
          },
          select: {
            currentValue: true
          }
        });
        
        newCurrentValue = holdings?.reduce((sum, h) => sum + Number(h.currentValue || 0), 0) || 0;
        break;

      case 'monthly_investment':
        const currentMonth = new Date().toISOString().slice(0, 7);
        const monthlyTransactions = await prisma.financialTransaction.findMany({
          where: {
            userId: session.user.id,
            transactionType: 'buy',
            transactionDate: {
              gte: new Date(`${currentMonth}-01`),
              lte: new Date(`${currentMonth}-31`)
            }
          },
          select: {
            totalAmount: true
          }
        });

        newCurrentValue = monthlyTransactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
        break;
    }

    // Aggiorna l'obiettivo
    const updatedGoal = await prisma.investmentGoal.update({
      where: {
        id: goalId
      },
      data: {
        currentValue: newCurrentValue,
        status: newCurrentValue >= Number(goal.targetValue) ? 'completed' : 'active',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      goalId,
      previousValue: Number(goal.currentValue),
      newValue: newCurrentValue,
      progress: (newCurrentValue / Number(goal.targetValue)) * 100
    });

  } catch (error) {
    console.error('Errore aggiornamento progresso:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}