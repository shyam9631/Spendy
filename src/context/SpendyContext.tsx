import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createSeedState, TODAY_DATE } from '../data/seed';
import {
  AppSettings,
  Category,
  Expense,
  QuickAddPreset,
  SpendyState,
  TabId,
} from '../types/spendy';
import { computeBudgetMetrics, formatINR, getCurrentTimeHHMM } from '../utils/finance';

const STORAGE_KEY = 'spendy_ledger_v1';

export interface ToastMessage {
  id: string;
  text: string;
  tone: 'green' | 'neutral';
  onUndo?: () => void;
}

interface SpendyContextValue {
  state: SpendyState;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  historyInitialCategory: Category | 'All';
  openHistoryForCategory: (category: Category) => void;
  clearHistoryInitialCategory: () => void;

  isExpenseSheetOpen: boolean;
  editingExpense: Expense | null;
  openAddExpense: () => void;
  openEditExpense: (expense: Expense) => void;
  closeExpenseSheet: () => void;

  addExpense: (input: Omit<Expense, 'id'>) => void;
  quickAddExpense: (preset: QuickAddPreset) => void;
  updateExpense: (id: string, input: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  setMonthlyBudget: (amount: number) => void;
  setCategoryBudget: (category: Category, amount: number) => void;
  addSavings: (amount: number) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetMonth: () => void;

  toast: ToastMessage | null;
  dismissToast: () => void;
}

const SpendyContext = createContext<SpendyContextValue | null>(null);

function loadInitialState(): SpendyState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as Partial<SpendyState>;
    const fallback = createSeedState();
    if (!parsed || !Array.isArray(parsed.expenses)) {
      return fallback;
    }
    return {
      expenses: parsed.expenses,
      monthlyBudget:
        typeof parsed.monthlyBudget === 'number' && parsed.monthlyBudget > 0
          ? parsed.monthlyBudget
          : fallback.monthlyBudget,
      categoryBudgets: {
        ...fallback.categoryBudgets,
        ...(parsed.categoryBudgets ?? {}),
      },
      savingsGoal: {
        ...fallback.savingsGoal,
        ...(parsed.savingsGoal ?? {}),
      },
      settings: {
        ...fallback.settings,
        ...(parsed.settings ?? {}),
      },
      userProfile: {
        ...fallback.userProfile,
        ...(parsed.userProfile ?? {}),
      },
    };
  } catch {
    return createSeedState();
  }
}

export function SpendyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SpendyState>(() => loadInitialState());
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [historyInitialCategory, setHistoryInitialCategory] = useState<Category | 'All'>('All');
  const [isExpenseSheetOpen, setIsExpenseSheetOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors cleanly
    }
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast((current) => (current?.id === toast.id ? null : current));
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((next: Omit<ToastMessage, 'id'>) => {
    setToast({
      ...next,
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    });
  }, []);

  const openHistoryForCategory = useCallback((category: Category) => {
    setHistoryInitialCategory(category);
    setActiveTab('history');
  }, []);

  const clearHistoryInitialCategory = useCallback(() => {
    setHistoryInitialCategory('All');
  }, []);

  const openAddExpense = useCallback(() => {
    setEditingExpense(null);
    setIsExpenseSheetOpen(true);
  }, []);

  const openEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseSheetOpen(true);
  }, []);

  const closeExpenseSheet = useCallback(() => {
    setIsExpenseSheetOpen(false);
    setEditingExpense(null);
  }, []);

  const addExpense = useCallback(
    (input: Omit<Expense, 'id'>) => {
      const newExpense: Expense = {
        ...input,
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      };

      const beforeMetrics = computeBudgetMetrics(state.expenses, state.monthlyBudget, TODAY_DATE);
      const nextExpenses = [newExpense, ...state.expenses];
      const afterMetrics = computeBudgetMetrics(nextExpenses, state.monthlyBudget, TODAY_DATE);

      setState((prev) => ({
        ...prev,
        expenses: [newExpense, ...prev.expenses],
      }));

      showToast({
        text: `Added. Safe to spend today ${formatINR(beforeMetrics.safeToSpendToday)} -> ${formatINR(
          afterMetrics.safeToSpendToday
        )}`,
        tone: 'green',
        onUndo: () => {
          setState((prev) => ({
            ...prev,
            expenses: prev.expenses.filter((e) => e.id !== newExpense.id),
          }));
        },
      });
    },
    [state.expenses, state.monthlyBudget, showToast]
  );

  const quickAddExpense = useCallback(
    (preset: QuickAddPreset) => {
      const newExpense: Expense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        amount: preset.amount,
        category: preset.category,
        note: preset.note,
        paymentMode: preset.paymentMode,
        date: TODAY_DATE,
        time: getCurrentTimeHHMM(),
      };

      const beforeMetrics = computeBudgetMetrics(state.expenses, state.monthlyBudget, TODAY_DATE);
      const nextExpenses = [newExpense, ...state.expenses];
      const afterMetrics = computeBudgetMetrics(nextExpenses, state.monthlyBudget, TODAY_DATE);

      setState((prev) => ({
        ...prev,
        expenses: [newExpense, ...prev.expenses],
      }));

      showToast({
        text: `Added ${preset.label}. Safe to spend today ${formatINR(
          beforeMetrics.safeToSpendToday
        )} -> ${formatINR(afterMetrics.safeToSpendToday)}`,
        tone: 'green',
        onUndo: () => {
          setState((prev) => ({
            ...prev,
            expenses: prev.expenses.filter((e) => e.id !== newExpense.id),
          }));
        },
      });
    },
    [state.expenses, state.monthlyBudget, showToast]
  );

  const updateExpense = useCallback(
    (id: string, input: Omit<Expense, 'id'>) => {
      const existing = state.expenses.find((e) => e.id === id);
      if (!existing) return;

      const beforeMetrics = computeBudgetMetrics(state.expenses, state.monthlyBudget, TODAY_DATE);
      const nextExpenses = state.expenses.map((e) => (e.id === id ? { ...input, id } : e));
      const afterMetrics = computeBudgetMetrics(nextExpenses, state.monthlyBudget, TODAY_DATE);

      setState((prev) => ({
        ...prev,
        expenses: prev.expenses.map((e) => (e.id === id ? { ...input, id } : e)),
      }));

      showToast({
        text: `Updated. Safe to spend today ${formatINR(
          beforeMetrics.safeToSpendToday
        )} -> ${formatINR(afterMetrics.safeToSpendToday)}`,
        tone: 'green',
        onUndo: () => {
          setState((prev) => ({
            ...prev,
            expenses: prev.expenses.map((e) => (e.id === id ? existing : e)),
          }));
        },
      });
    },
    [state.expenses, state.monthlyBudget, showToast]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      const existing = state.expenses.find((e) => e.id === id);
      if (!existing) return;

      setState((prev) => ({
        ...prev,
        expenses: prev.expenses.filter((e) => e.id !== id),
      }));

      showToast({
        text: `Deleted ${existing.note || existing.category} (${formatINR(existing.amount)})`,
        tone: 'neutral',
        onUndo: () => {
          setState((prev) => {
            if (prev.expenses.some((e) => e.id === existing.id)) return prev;
            return {
              ...prev,
              expenses: [existing, ...prev.expenses],
            };
          });
        },
      });
    },
    [state.expenses, showToast]
  );

  const setMonthlyBudget = useCallback(
    (amount: number) => {
      const clean = Math.max(100, Math.round(amount));
      setState((prev) => ({
        ...prev,
        monthlyBudget: clean,
      }));
      showToast({
        text: `Monthly budget updated to ${formatINR(clean)}`,
        tone: 'green',
      });
    },
    [showToast]
  );

  const setCategoryBudget = useCallback(
    (category: Category, amount: number) => {
      const clean = Math.max(0, Math.round(amount));
      setState((prev) => ({
        ...prev,
        categoryBudgets: {
          ...prev.categoryBudgets,
          [category]: clean,
        },
      }));
      showToast({
        text: `${category} limit set to ${formatINR(clean)}`,
        tone: 'green',
      });
    },
    [showToast]
  );

  const addSavings = useCallback(
    (amount: number) => {
      const clean = Math.max(1, Math.round(amount));
      setState((prev) => ({
        ...prev,
        savingsGoal: {
          ...prev.savingsGoal,
          saved: prev.savingsGoal.saved + clean,
        },
      }));
      showToast({
        text: `Added ${formatINR(clean)} to ${state.savingsGoal.title}`,
        tone: 'green',
      });
    },
    [state.savingsGoal.title, showToast]
  );

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...partial,
      },
    }));
  }, []);

  const resetMonth = useCallback(() => {
    const fresh = createSeedState();
    setState(fresh);
    showToast({
      text: 'Month reset to initial sample ledger',
      tone: 'neutral',
    });
  }, [showToast]);

  const value = useMemo<SpendyContextValue>(
    () => ({
      state,
      activeTab,
      setActiveTab,
      historyInitialCategory,
      openHistoryForCategory,
      clearHistoryInitialCategory,
      isExpenseSheetOpen,
      editingExpense,
      openAddExpense,
      openEditExpense,
      closeExpenseSheet,
      addExpense,
      quickAddExpense,
      updateExpense,
      deleteExpense,
      setMonthlyBudget,
      setCategoryBudget,
      addSavings,
      updateSettings,
      resetMonth,
      toast,
      dismissToast,
    }),
    [
      state,
      activeTab,
      historyInitialCategory,
      openHistoryForCategory,
      clearHistoryInitialCategory,
      isExpenseSheetOpen,
      editingExpense,
      openAddExpense,
      openEditExpense,
      closeExpenseSheet,
      addExpense,
      quickAddExpense,
      updateExpense,
      deleteExpense,
      setMonthlyBudget,
      setCategoryBudget,
      addSavings,
      updateSettings,
      resetMonth,
      toast,
      dismissToast,
    ]
  );

  return <SpendyContext.Provider value={value}>{children}</SpendyContext.Provider>;
}

export function useSpendy(): SpendyContextValue {
  const ctx = useContext(SpendyContext);
  if (!ctx) {
    throw new Error('useSpendy must be used within SpendyProvider');
  }
  return ctx;
}
