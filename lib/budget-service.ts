import { BudgetPeriod, BudgetStatus, BudgetAlertType } from "@prisma/client";

// --- Interfacce Comuni (Idealmente da un file types centralizzato) ---

export interface BudgetOverviewItem {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
  status: "safe" | "warning" | "danger";
}

export interface CategorySpending {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyIncome {
  totalIncome: number;
}

export interface MonthlyExpenses {
  totalExpenses: number;
}

export interface SavingsRate {
  savingsRate: number;
}

export interface Budget {
  id: string;
  created_at: Date;
  updated_at: Date;
  user_id: string; // userId negli endpoint, user_id qui per coerenza con budget-client originale
  category: string;
  amount: number;
  period: BudgetPeriod;
  start_date: Date;
  end_date?: Date | null;
  is_recurring: boolean;
  notes?: string | null;
  alert_threshold: number;
  shared_with: string[];
  goal_id?: string | null;
  status: BudgetStatus | null;
}

export interface CreateBudgetInput {
  category: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string; // ISO Date string
  end_date?: string; // ISO Date string
  is_recurring: boolean;
  notes?: string;
  alert_threshold: number;
  shared_with: string[];
  status: BudgetStatus;
  goal_id?: string;
}

export interface UpdateBudgetInput {
  category?: string;
  amount?: number;
  period?: BudgetPeriod;
  start_date?: string; // ISO Date string
  end_date?: string; // ISO Date string
  is_recurring?: boolean;
  notes?: string;
  alert_threshold?: number;
  shared_with?: string[];
  status?: BudgetStatus;
  goal_id?: string;
}

export interface BudgetAnalyticsData {
  month: string;
  [category: string]: number | string; // Categorie dinamiche più il mese
}

export interface BudgetAlert {
  id: string;
  created_at: Date;
  budget_id: string;
  user_id: string;
  alert_type: BudgetAlertType;
  percentage_used?: number | null;
  message?: string | null;
  is_read: boolean;
}

export interface CreateBudgetAlertInput {
  budget_id: string;
  alert_type: BudgetAlertType;
  message: string;
  percentage_used?: number;
}

// --- Funzioni del Servizio ---

/**
 * Gestore generico per le risposte fetch.
 * @param response La risposta fetch.
 * @param errorMessage Messaggio di errore personalizzato per il fallimento della richiesta.
 * @returns I dati JSON se la richiesta ha successo.
 * @throws Error se la richiesta fallisce.
 */
async function handleApiResponse<T>(response: Response, errorMessage: string): Promise<T> {
  if (!response.ok) {
    let errorDetails = '';
    try {
      const errorData = await response.json();
      errorDetails = errorData.error || JSON.stringify(errorData);
    } catch (e) {
      errorDetails = response.statusText;
    }
    console.error(`${errorMessage}. Status: ${response.status}. Details: ${errorDetails}`);
    throw new Error(`${errorMessage}. Status: ${response.status}.`);
  }
  return response.json() as Promise<T>;
}


// --- Budget Overview ---
export async function fetchBudgetOverview(): Promise<BudgetOverviewItem[]> {
  try {
    const response = await fetch('/api/budget/overview');
    return await handleApiResponse<BudgetOverviewItem[]>(response, 'Impossibile recuperare la panoramica del budget');
  } catch (error) {
    console.error("Errore in fetchBudgetOverview:", error);
    // Potresti voler rilanciare l'errore o restituire un valore di default/vuoto
    // a seconda di come vuoi che il chiamante gestisca l'errore.
    // Per ora, rilancio per far gestire al chiamante.
    throw error;
  }
}

// --- Category Spending ---
export async function fetchCategorySpending(): Promise<CategorySpending[]> {
  try {
    const response = await fetch('/api/budget/category-spending');
    return await handleApiResponse<CategorySpending[]>(response, 'Impossibile recuperare la spesa per categoria');
  } catch (error) {
    console.error("Errore in fetchCategorySpending:", error);
    throw error;
  }
}

// --- Monthly Income ---
export async function fetchMonthlyIncome(): Promise<MonthlyIncome> {
  try {
    const response = await fetch('/api/budget/monthly-income');
    return await handleApiResponse<MonthlyIncome>(response, 'Impossibile recuperare le entrate mensili');
  } catch (error) {
    console.error("Errore in fetchMonthlyIncome:", error);
    throw error;
  }
}

// --- Monthly Expenses ---
export async function fetchMonthlyExpenses(): Promise<MonthlyExpenses> {
  try {
    const response = await fetch('/api/budget/monthly-expenses');
    return await handleApiResponse<MonthlyExpenses>(response, 'Impossibile recuperare le spese mensili');
  } catch (error) {
    console.error("Errore in fetchMonthlyExpenses:", error);
    throw error;
  }
}

// --- Savings Rate ---
export async function fetchSavingsRate(): Promise<SavingsRate> {
  try {
    const response = await fetch('/api/budget/savings-rate');
    return await handleApiResponse<SavingsRate>(response, 'Impossibile recuperare il tasso di risparmio');
  } catch (error) {
    console.error("Errore in fetchSavingsRate:", error);
    throw error;
  }
}

// --- Budgets (CRUD) ---
export async function fetchBudgets(): Promise<Budget[]> {
  try {
    const response = await fetch('/api/budget');
    return await handleApiResponse<Budget[]>(response, 'Impossibile recuperare i budget');
  } catch (error) {
    console.error("Errore in fetchBudgets:", error);
    throw error;
  }
}

export async function createBudget(budgetData: CreateBudgetInput): Promise<Budget> {
  try {
    const response = await fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData),
    });
    return await handleApiResponse<Budget>(response, 'Impossibile creare il budget');
  } catch (error) {
    console.error("Errore in createBudget:", error);
    throw error;
  }
}

export async function updateBudget(budgetId: string, budgetData: UpdateBudgetInput): Promise<Budget> {
  try {
    const response = await fetch(`/api/budget/${budgetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budgetData),
    });
    return await handleApiResponse<Budget>(response, "Impossibile aggiornare il budget");
  } catch (error) {
    console.error("Errore in updateBudget:", error);
    throw error;
  }
}

export async function deleteBudget(budgetId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`/api/budget/${budgetId}`, {
      method: 'DELETE',
    });
    return await handleApiResponse<{ message: string }>(response, "Impossibile eliminare il budget");
  } catch (error) {
    console.error("Errore in deleteBudget:", error);
    throw error;
  }
}

// --- Budget Analytics ---
export async function fetchBudgetAnalytics(period: 'month' | 'quarter' | 'year'): Promise<BudgetAnalyticsData[]> {
  try {
    const response = await fetch(`/api/budget/analytics?period=${period}`);
    return await handleApiResponse<BudgetAnalyticsData[]>(response, "Impossibile recuperare i dati analitici del budget");
  } catch (error) {
    console.error("Errore in fetchBudgetAnalytics:", error);
    throw error;
  }
}

// --- Budget Alerts ---
export async function fetchBudgetAlerts(): Promise<BudgetAlert[]> {
  try {
    const response = await fetch('/api/budget-alerts');
    return await handleApiResponse<BudgetAlert[]>(response, "Impossibile recuperare gli alert del budget");
  } catch (error) {
    console.error("Errore in fetchBudgetAlerts:", error);
    throw error;
  }
}

export async function createBudgetAlert(alertData: CreateBudgetAlertInput): Promise<BudgetAlert> {
  try {
    const response = await fetch('/api/budget-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData),
    });
    return await handleApiResponse<BudgetAlert>(response, "Impossibile creare l'alert del budget");
  } catch (error) {
    console.error("Errore in createBudgetAlert:", error);
    throw error;
  }
}

export async function markBudgetAlertAsRead(alertId: string): Promise<BudgetAlert> {
  try {
    const response = await fetch(`/api/budget-alerts/${alertId}/read`, {
      method: 'PUT',
    });
    return await handleApiResponse<BudgetAlert>(response, "Impossibile segnare l'alert come letto");
  } catch (error) {
    console.error("Errore in markBudgetAlertAsRead:", error);
    throw error;
  }
}