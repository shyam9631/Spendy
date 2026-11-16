export type Category = 'Food' | 'Travel' | 'Study' | 'Fun' | 'Recharge' | 'Others';

export type PaymentMode = 'UPI' | 'Cash' | 'Card';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  note: string;
  paymentMode: PaymentMode;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export type CategoryBudgets = Record<Category, number>;

export interface SavingsGoal {
  title: string;
  target: number;
  saved: number;
}

export interface AppSettings {
  alertAt80: boolean;
  dailyReminder: boolean;
}

export interface UserProfile {
  name: string;
  subtitle: string;
}

export interface SpendyState {
  expenses: Expense[];
  monthlyBudget: number;
  categoryBudgets: CategoryBudgets;
  savingsGoal: SavingsGoal;
  settings: AppSettings;
  userProfile: UserProfile;
}

export type TabId = 'home' | 'history' | 'insights' | 'budget';

export interface QuickAddPreset {
  id: string;
  label: string;
  amount: number;
  category: Category;
  paymentMode: PaymentMode;
  note: string;
}
