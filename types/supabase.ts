export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      investment_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          goal_type: string
          target_value: number
          current_value: number
          target_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          goal_type: string
          target_value: number
          current_value?: number
          target_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          goal_type?: string
          target_value?: number
          current_value?: number
          target_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_allocations: {
        Row: {
          id: string
          goal_id: string
          asset_class: string
          target_percentage: number
          current_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          asset_class: string
          target_percentage: number
          current_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          asset_class?: string
          target_percentage?: number
          current_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      financial_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          asset_type: string
          asset_name: string
          ticker_symbol: string | null
          quantity: number | null
          price_per_unit: number | null
          total_amount: number
          transaction_date: string
          currency: string
          fees: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: string
          asset_type: string
          asset_name: string
          ticker_symbol?: string | null
          quantity?: number | null
          price_per_unit?: number | null
          total_amount: number
          transaction_date: string
          currency?: string
          fees?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: string
          asset_type?: string
          asset_name?: string
          ticker_symbol?: string | null
          quantity?: number | null
          price_per_unit?: number | null
          total_amount?: number
          transaction_date?: string
          currency?: string
          fees?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_holdings: {
        Row: {
          id: string
          user_id: string
          asset_type: string
          asset_name: string
          ticker_symbol: string | null
          total_quantity: number
          average_cost: number
          total_cost: number
          current_price: number | null
          current_value: number | null
          unrealized_gain_loss: number | null
          percentage_of_portfolio: number | null
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_type: string
          asset_name: string
          ticker_symbol?: string | null
          total_quantity: number
          average_cost: number
          total_cost: number
          current_price?: number | null
          current_value?: number | null
          unrealized_gain_loss?: number | null
          percentage_of_portfolio?: number | null
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_type?: string
          asset_name?: string
          ticker_symbol?: string | null
          total_quantity?: number
          average_cost?: number
          total_cost?: number
          current_price?: number | null
          current_value?: number | null
          unrealized_gain_loss?: number | null
          percentage_of_portfolio?: number | null
          last_updated?: string
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          monthly_expenses: number | null
          annual_expenses: number | null
          current_age: number | null
          retirement_age: number | null
          swr_rate: number | null
          expected_return: number | null
          inflation_rate: number | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          monthly_expenses?: number | null
          annual_expenses?: number | null
          current_age?: number | null
          retirement_age?: number | null
          swr_rate?: number | null
          expected_return?: number | null
          inflation_rate?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          monthly_expenses?: number | null
          annual_expenses?: number | null
          current_age?: number | null
          retirement_age?: number | null
          swr_rate?: number | null
          expected_return?: number | null
          inflation_rate?: number | null
        }
      }
      net_worth: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          amount: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          amount: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          amount?: number
          notes?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          created_at: string
          user_id: string
          category: string
          amount: number
          date: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          category: string
          amount: number
          date: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          category?: string
          amount?: number
          date?: string
          notes?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          type: string
          target_amount: number
          current_amount: number
          target_date: string | null
          notes: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          type: string
          target_amount: number
          current_amount: number
          target_date?: string | null
          notes?: string | null
          status: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          type?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          notes?: string | null
          status?: string
        }
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          date: string
          description: string
          amount: number
          category: string
          type: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          date: string
          description: string
          amount: number
          category: string
          type: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          date?: string
          description?: string
          amount?: number
          category?: string
          type?: string
          notes?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
