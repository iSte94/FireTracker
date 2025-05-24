// Investment Types
export type GoalType = 
  | 'monthly_investment'
  | 'portfolio_allocation'
  | 'annual_return'
  | 'target_portfolio_value'
  | 'retirement_income'
  | 'emergency_fund'
  | 'custom';

export type GoalStatus = 'active' | 'completed' | 'paused';

export type AssetClass = 
  | 'stocks'
  | 'bonds'
  | 'crypto'
  | 'etf'
  | 'funds'
  | 'cash'
  | 'real_estate'
  | 'commodities'
  | 'other';

export type AssetType = 
  | 'stock'
  | 'etf'
  | 'fund'
  | 'bond'
  | 'crypto'
  | 'cash'
  | 'real_estate'
  | 'commodity'
  | 'other';

export type TransactionType = 
  | 'buy'
  | 'sell'
  | 'dividend'
  | 'interest'
  | 'deposit'
  | 'withdrawal'
  | 'fee'
  | 'tax';

export interface InvestmentGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: GoalType;
  target_value: number;
  current_value: number;
  target_date?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  allocations?: PortfolioAllocation[];
}

export interface PortfolioAllocation {
  id: string;
  goal_id: string;
  asset_class: AssetClass;
  target_percentage: number;
  current_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  asset_type: AssetType;
  name: string;
  ticker?: string;
  quantity?: number;
  price?: number;
  total: number;
  date: string;
  currency: string;
  fees: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioHolding {
  id: string;
  user_id: string;
  asset_type: AssetType;
  name: string;
  ticker?: string;
  total_quantity: number;
  average_cost: number;
  total_cost: number;
  current_price?: number;
  current_value?: number;
  unrealized_gain_loss?: number;
  percentage_of_portfolio?: number;
  last_updated: string;
}

// Helper types for forms and UI
export interface GoalFormData {
  title: string;
  description?: string;
  goal_type: GoalType;
  target_value: number;
  target_date?: string;
  allocations?: AllocationFormData[];
}

export interface AllocationFormData {
  asset_class: AssetClass;
  target_percentage: number;
}

export interface TransactionFormData {
  transaction_type: TransactionType;
  asset_type: AssetType;
  name: string;
  ticker?: string;
  quantity?: number;
  price?: number;
  total: number;
  date: string;
  currency: string;
  fees?: number;
  notes?: string;
}

// Chart data types
export interface PortfolioCompositionData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface GoalProgressData {
  date: string;
  value: number;
  target: number;
}

export interface AllocationComparisonData {
  asset_class: AssetClass;
  target: number;
  current: number;
  difference: number;
}

// Color mapping for asset classes
export const ASSET_CLASS_COLORS: Record<AssetClass, string> = {
  stocks: '#3b82f6', // blue
  bonds: '#10b981', // green
  crypto: '#8b5cf6', // violet
  etf: '#f59e0b', // amber
  funds: '#06b6d4', // cyan
  cash: '#6b7280', // gray
  real_estate: '#dc2626', // red
  commodities: '#f97316', // orange
  other: '#6366f1', // indigo
};

// Goal type icons and labels
export const GOAL_TYPE_CONFIG: Record<GoalType, { label: string; icon: string; description: string }> = {
  monthly_investment: {
    label: 'Investimento Mensile',
    icon: 'CalendarDays',
    description: 'Obiettivo di investimento mensile costante'
  },
  portfolio_allocation: {
    label: 'Allocazione Portfolio',
    icon: 'PieChart',
    description: 'Distribuzione target degli asset'
  },
  annual_return: {
    label: 'Rendimento Annuale',
    icon: 'TrendingUp',
    description: 'Obiettivo di rendimento annuale'
  },
  target_portfolio_value: {
    label: 'Valore Portfolio Target',
    icon: 'Target',
    description: 'Valore totale del portfolio da raggiungere'
  },
  retirement_income: {
    label: 'Rendita Pensionistica',
    icon: 'Wallet',
    description: 'Rendita mensile per la pensione'
  },
  emergency_fund: {
    label: 'Fondo Emergenza',
    icon: 'Shield',
    description: 'Fondo di emergenza in mesi di spese'
  },
  custom: {
    label: 'Personalizzato',
    icon: 'Settings',
    description: 'Obiettivo personalizzato'
  }
};