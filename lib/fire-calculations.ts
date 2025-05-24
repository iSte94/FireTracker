// Utilities per calcoli FIRE avanzati

export interface FireType {
  name: string
  description: string
  multiplier: number
}

export const FIRE_TYPES: Record<string, FireType> = {
  traditional: {
    name: "Traditional FIRE",
    description: "Indipendenza finanziaria completa",
    multiplier: 25
  },
  coast: {
    name: "Coast FIRE",
    description: "Smetti di risparmiare e lascia crescere gli investimenti",
    multiplier: 25
  },
  barista: {
    name: "Barista FIRE",
    description: "Lavoro part-time + investimenti",
    multiplier: 12.5
  },
  fat: {
    name: "Fat FIRE",
    description: "Indipendenza finanziaria con stile di vita elevato",
    multiplier: 33.33
  }
}

export interface SwrScenario {
  rate: number
  multiplier: number
  risk: "Molto Conservativo" | "Conservativo" | "Moderato" | "Aggressivo" | "Molto Aggressivo"
  description: string
}

export const SWR_SCENARIOS: SwrScenario[] = [
  {
    rate: 2.5,
    multiplier: 40,
    risk: "Molto Conservativo",
    description: "Massima sicurezza, adatto per pensionamenti molto lunghi"
  },
  {
    rate: 3.0,
    multiplier: 33.33,
    risk: "Conservativo",
    description: "Alta sicurezza, raccomandato per pensionamenti precoci"
  },
  {
    rate: 3.5,
    multiplier: 28.57,
    risk: "Moderato",
    description: "Buon equilibrio tra sicurezza e capitale necessario"
  },
  {
    rate: 4.0,
    multiplier: 25,
    risk: "Aggressivo",
    description: "Regola del 4%, standard per pensionamenti tradizionali"
  },
  {
    rate: 4.5,
    multiplier: 22.22,
    risk: "Molto Aggressivo",
    description: "Rischio elevato, richiede flessibilità nelle spese"
  }
]

// Calcola l'impatto di una spesa futura sul FIRE number
export function calculateFutureExpenseImpact(
  currentFireNumber: number,
  expenseAmount: number,
  yearsUntilExpense: number,
  expectedReturn: number = 0.07,
  inflationRate: number = 0.02
): {
  adjustedFireNumber: number
  additionalCapitalNeeded: number
  delayInYears: number
  presentValue: number
} {
  // Calcola il valore presente della spesa futura
  const realReturn = (1 + expectedReturn) / (1 + inflationRate) - 1
  const presentValue = expenseAmount / Math.pow(1 + realReturn, yearsUntilExpense)
  
  // Il capitale aggiuntivo necessario è il valore presente
  const additionalCapitalNeeded = presentValue
  
  // Nuovo FIRE number
  const adjustedFireNumber = currentFireNumber + additionalCapitalNeeded
  
  // Calcola il ritardo in anni (approssimativo)
  // Assumendo un tasso di risparmio costante
  const delayInYears = additionalCapitalNeeded / (currentFireNumber * 0.04) // Assumendo risparmio annuo del 4% del FIRE number
  
  return {
    adjustedFireNumber,
    additionalCapitalNeeded,
    delayInYears,
    presentValue
  }
}

// Calcola il FIRE number per diversi SWR
export function calculateFireNumberBySwr(
  annualExpenses: number,
  swr: number
): number {
  return annualExpenses * (100 / swr)
}

// Calcola il tempo per raggiungere il FIRE
export function calculateTimeToFire(
  currentSavings: number,
  annualSavings: number,
  fireNumber: number,
  expectedReturn: number = 0.07,
  inflationRate: number = 0.02
): {
  years: number
  monthlyProgress: Array<{ month: number; value: number; percentage: number }>
} {
  const realReturn = (1 + expectedReturn) / (1 + inflationRate) - 1
  const monthlyReturn = Math.pow(1 + realReturn, 1/12) - 1
  const monthlySavings = annualSavings / 12
  
  let currentValue = currentSavings
  let months = 0
  const monthlyProgress = []
  
  while (currentValue < fireNumber && months < 600) { // Max 50 anni
    currentValue = currentValue * (1 + monthlyReturn) + monthlySavings
    months++
    
    if (months % 12 === 0 || currentValue >= fireNumber) {
      monthlyProgress.push({
        month: months,
        value: currentValue,
        percentage: (currentValue / fireNumber) * 100
      })
    }
  }
  
  return {
    years: months / 12,
    monthlyProgress
  }
}

// Calcola Coast FIRE
export function calculateCoastFire(
  targetFireNumber: number,
  yearsUntilRetirement: number,
  expectedReturn: number = 0.07,
  inflationRate: number = 0.02
): number {
  const realReturn = (1 + expectedReturn) / (1 + inflationRate) - 1
  return targetFireNumber / Math.pow(1 + realReturn, yearsUntilRetirement)
}

// Calcola Barista FIRE
export function calculateBaristaFire(
  annualExpenses: number,
  partTimeIncome: number,
  swr: number = 4
): {
  fireNumber: number
  expensesCoveredByInvestments: number
  expensesCoveredByWork: number
} {
  const expensesCoveredByWork = Math.min(partTimeIncome, annualExpenses)
  const expensesCoveredByInvestments = annualExpenses - expensesCoveredByWork
  const fireNumber = calculateFireNumberBySwr(expensesCoveredByInvestments, swr)
  
  return {
    fireNumber,
    expensesCoveredByInvestments,
    expensesCoveredByWork
  }
}

// Calcola scenari multipli (ottimistico, realistico, pessimistico)
export interface Scenario {
  name: string
  expectedReturn: number
  inflationRate: number
  savingsGrowthRate: number
}

export const SCENARIOS: Scenario[] = [
  {
    name: "Pessimistico",
    expectedReturn: 0.05,
    inflationRate: 0.03,
    savingsGrowthRate: 0
  },
  {
    name: "Realistico",
    expectedReturn: 0.07,
    inflationRate: 0.02,
    savingsGrowthRate: 0.02
  },
  {
    name: "Ottimistico",
    expectedReturn: 0.09,
    inflationRate: 0.015,
    savingsGrowthRate: 0.04
  }
]

export function calculateMultipleScenarios(
  currentSavings: number,
  annualSavings: number,
  fireNumber: number,
  scenarios: Scenario[] = SCENARIOS
): Array<{
  scenario: Scenario
  timeToFire: ReturnType<typeof calculateTimeToFire>
}> {
  return scenarios.map(scenario => {
    // Calcola i risparmi annuali aggiustati per la crescita
    const adjustedAnnualSavings = annualSavings * (1 + scenario.savingsGrowthRate)
    
    return {
      scenario,
      timeToFire: calculateTimeToFire(
        currentSavings,
        adjustedAnnualSavings,
        fireNumber,
        scenario.expectedReturn,
        scenario.inflationRate
      )
    }
  })
}

// Calcola le milestone del percorso FIRE
export function calculateMilestones(
  currentProgress: number,
  fireNumber: number
): Array<{
  percentage: number
  amount: number
  label: string
  reached: boolean
}> {
  const milestones = [
    { percentage: 10, label: "Primo 10%" },
    { percentage: 25, label: "Un Quarto" },
    { percentage: 50, label: "Metà Strada" },
    { percentage: 75, label: "Tre Quarti" },
    { percentage: 90, label: "Ultimo 10%" },
    { percentage: 100, label: "FIRE!" }
  ]
  
  return milestones.map(milestone => ({
    ...milestone,
    amount: fireNumber * (milestone.percentage / 100),
    reached: currentProgress >= fireNumber * (milestone.percentage / 100)
  }))
}

// Formatta numeri in valuta
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Formatta percentuali
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Formatta anni
export function formatYears(years: number): string {
  if (years < 1) {
    const months = Math.round(years * 12)
    return `${months} ${months === 1 ? 'mese' : 'mesi'}`
  }
  const wholeYears = Math.floor(years)
  const months = Math.round((years - wholeYears) * 12)
  
  if (months === 0) {
    return `${wholeYears} ${wholeYears === 1 ? 'anno' : 'anni'}`
  }
  
  return `${wholeYears} ${wholeYears === 1 ? 'anno' : 'anni'} e ${months} ${months === 1 ? 'mese' : 'mesi'}`
}