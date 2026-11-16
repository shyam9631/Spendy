import { Bell, Flame, Pencil, Plus, RotateCcw, Target, X } from 'lucide-react';
import { useState } from 'react';
import { CategoryIcon } from '../components/CategoryIcon';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useSpendy } from '../context/SpendyContext';
import { CATEGORIES, CURRENT_MONTH, TODAY_DATE } from '../data/seed';
import { Category } from '../types/spendy';
import {
  computeStreak,
  formatINR,
  getBudgetBarFillClass,
  getBudgetBarTone,
  getCategoryTotals,
  getMonthExpenses,
} from '../utils/finance';

export function BudgetScreen() {
  const {
    state,
    setMonthlyBudget,
    setCategoryBudget,
    addSavings,
    updateSettings,
    resetMonth,
  } = useSpendy();

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(state.monthlyBudget));

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryLimitInput, setCategoryLimitInput] = useState('');

  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [savingsInput, setSavingsInput] = useState('250');

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const monthExpenses = getMonthExpenses(state.expenses, CURRENT_MONTH);
  const categoryTotals = getCategoryTotals(monthExpenses);
  const streak = computeStreak(state.expenses, TODAY_DATE);

  const savingsRemaining = Math.max(0, state.savingsGoal.target - state.savingsGoal.saved);
  const savingsPct =
    state.savingsGoal.target > 0
      ? Math.min(100, Math.round((state.savingsGoal.saved / state.savingsGoal.target) * 100))
      : 0;

  const handleOpenBudgetModal = () => {
    setBudgetInput(String(state.monthlyBudget));
    setIsBudgetModalOpen(true);
  };

  const handleSaveMonthlyBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!Number.isFinite(val) || val < 100) return;
    setMonthlyBudget(val);
    setIsBudgetModalOpen(false);
  };

  const handleOpenCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryLimitInput(String(state.categoryBudgets[cat] ?? 0));
  };

  const handleSaveCategoryLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const val = Number(categoryLimitInput);
    if (!Number.isFinite(val) || val < 0) return;
    setCategoryBudget(editingCategory, val);
    setEditingCategory(null);
  };

  const handleSaveSavings = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(savingsInput);
    if (!Number.isFinite(val) || val <= 0) return;
    addSavings(val);
    setIsSavingsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Budget</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Limits, savings goal &amp; preferences</p>
        </div>
        <button
          type="button"
          onClick={() => setIsResetDialogOpen(true)}
          className="min-h-[40px] px-3.5 rounded-full bg-[#18181b] hover:bg-[#201f22] border border-white/10 text-xs font-medium text-zinc-200 inline-flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Reset month
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Monthly Budget, Savings Goal, Streak, Settings */}
        <div className="lg:col-span-5 space-y-4">
          {/* Monthly Budget Card */}
          <section
            aria-label="Monthly budget"
            className="rounded-3xl bg-[#121214] border border-white/10 p-5 flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-xs text-zinc-400">Monthly budget</p>
              <p
                data-testid="budget-monthly-amount"
                className="mt-1 font-mono-tabular text-3xl font-semibold text-white"
              >
                {formatINR(state.monthlyBudget)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">November 2026 limit</p>
            </div>
            <button
              type="button"
              onClick={handleOpenBudgetModal}
              aria-label="Edit monthly budget"
              className="min-w-[44px] min-h-[44px] rounded-2xl bg-[#18181b] hover:bg-[#201f22] border border-white/10 text-zinc-200 hover:text-white flex items-center justify-center transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </section>

          {/* Savings Goal Card */}
          <section
            aria-label="Savings goal"
            className="rounded-3xl bg-[#121214] border border-white/10 p-5 space-y-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-300 flex items-center justify-center">
                  <Target className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Savings goal</p>
                  <h2 className="text-sm font-medium text-white">{state.savingsGoal.title}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSavingsInput('250');
                  setIsSavingsModalOpen(true);
                }}
                className="min-h-[38px] px-3.5 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                Add savings
              </button>
            </div>

            <div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all duration-300"
                  style={{ width: `${savingsPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span data-testid="savings-saved-text" className="font-mono-tabular text-zinc-200">
                  {formatINR(state.savingsGoal.saved)} saved of{' '}
                  {formatINR(state.savingsGoal.target)}
                </span>
                <span data-testid="savings-remaining-text" className="font-mono-tabular text-violet-300 font-medium">
                  {savingsRemaining > 0 ? `${formatINR(savingsRemaining)} to go` : 'Goal reached!'}
                </span>
              </div>
            </div>
          </section>

          {/* Streak Card */}
          <section
            aria-label="Logging streak"
            className="rounded-2xl bg-[#121214] border border-white/10 p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Expense logging streak</p>
                <p data-testid="budget-streak-value" className="font-mono-tabular text-lg font-semibold text-white">
                  {streak} {streak === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
            <span className="text-xs text-zinc-500">Up to today</span>
          </section>

          {/* Settings Toggles Card */}
          <section
            aria-label="Alert settings"
            className="rounded-3xl bg-[#121214] border border-white/10 p-4 space-y-3"
          >
            <div className="flex items-center gap-2 px-1">
              <Bell className="w-4 h-4 text-zinc-400" aria-hidden="true" />
              <h2 className="text-xs font-medium text-zinc-400">Alerts &amp; Reminders</h2>
            </div>

            <div className="flex items-center justify-between gap-3 py-1 px-1">
              <div>
                <p className="text-sm font-medium text-white">Alert me at 80% of budget</p>
                <p className="text-xs text-zinc-500">Show an amber warning banner on Home</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={state.settings.alertAt80}
                aria-label="Alert me at 80% of budget"
                onClick={() => updateSettings({ alertAt80: !state.settings.alertAt80 })}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
                  state.settings.alertAt80
                    ? 'bg-violet-500 border-violet-400'
                    : 'bg-zinc-800 border-white/10'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                    state.settings.alertAt80 ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="border-t border-white/8 pt-3 flex items-center justify-between gap-3 py-1 px-1">
              <div>
                <p className="text-sm font-medium text-white">Daily spending reminder</p>
                <p className="text-xs text-zinc-500">Evening nudge to log today&apos;s spends</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={state.settings.dailyReminder}
                aria-label="Daily spending reminder"
                onClick={() => updateSettings({ dailyReminder: !state.settings.dailyReminder })}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
                  state.settings.dailyReminder
                    ? 'bg-violet-500 border-violet-400'
                    : 'bg-zinc-800 border-white/10'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                    state.settings.dailyReminder ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Category Limits */}
        <section
          aria-label="Category limits"
          className="lg:col-span-7 rounded-3xl bg-[#121214] border border-white/10 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white">Category limits</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Green &lt;75% · Amber 75–99% · Red 100%+
              </p>
            </div>
            <span className="font-mono-tabular text-xs text-zinc-400">
              Total{' '}
              {formatINR(
                CATEGORIES.reduce((s, c) => s + (state.categoryBudgets[c] ?? 0), 0)
              )}
            </span>
          </div>

          <div className="space-y-3">
            {CATEGORIES.map((cat) => {
              const spent = categoryTotals[cat] ?? 0;
              const limit = state.categoryBudgets[cat] ?? 0;
              const tone = getBudgetBarTone(spent, limit);
              const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

              return (
                <div
                  key={cat}
                  className="rounded-2xl bg-[#18181b] border border-white/8 p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryIcon category={cat} className="w-4 h-4 text-zinc-300 shrink-0" />
                      <span className="text-sm font-medium text-white">{cat}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular text-xs text-zinc-300">
                        {formatINR(spent)}{' '}
                        <span className="text-zinc-500">/ {formatINR(limit)}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenCategoryModal(cat)}
                        aria-label={`Edit ${cat} limit`}
                        className="min-w-[36px] min-h-[36px] rounded-xl bg-[#121214] hover:bg-white/10 border border-white/8 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getBudgetBarFillClass(
                        tone
                      )}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Edit Monthly Budget Modal */}
      {isBudgetModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-budget-title"
        >
          <form
            onSubmit={handleSaveMonthlyBudget}
            className="w-full max-w-sm rounded-2xl bg-[#18181b] border border-white/12 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 id="edit-budget-title" className="text-base font-medium text-white">
                Edit monthly budget
              </h3>
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label htmlFor="monthly-budget-input" className="block text-xs text-zinc-400 mb-1.5">
                Budget amount (₹)
              </label>
              <input
                id="monthly-budget-input"
                type="number"
                min={100}
                max={1000000}
                step={50}
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                autoFocus
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#121214] border border-white/15 focus:border-violet-400 focus:outline-none font-mono-tabular text-base text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBudgetModalOpen(false)}
                className="min-h-[42px] px-4 rounded-xl bg-[#121214] border border-white/10 text-sm text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-4 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200"
              >
                Save budget
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Category Limit Modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-cat-title"
        >
          <form
            onSubmit={handleSaveCategoryLimit}
            className="w-full max-w-sm rounded-2xl bg-[#18181b] border border-white/12 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 id="edit-cat-title" className="text-base font-medium text-white">
                Edit {editingCategory} limit
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label htmlFor="category-limit-input" className="block text-xs text-zinc-400 mb-1.5">
                Monthly limit for {editingCategory} (₹)
              </label>
              <input
                id="category-limit-input"
                type="number"
                min={0}
                max={1000000}
                step={50}
                value={categoryLimitInput}
                onChange={(e) => setCategoryLimitInput(e.target.value)}
                autoFocus
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#121214] border border-white/15 focus:border-violet-400 focus:outline-none font-mono-tabular text-base text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="min-h-[42px] px-4 rounded-xl bg-[#121214] border border-white/10 text-sm text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-4 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200"
              >
                Save limit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Savings Modal */}
      {isSavingsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-savings-title"
        >
          <form
            onSubmit={handleSaveSavings}
            className="w-full max-w-sm rounded-2xl bg-[#18181b] border border-white/12 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 id="add-savings-title" className="text-base font-medium text-white">
                Add to {state.savingsGoal.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsSavingsModalOpen(false)}
                aria-label="Close modal"
                className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              {[100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSavingsInput(String(amt))}
                  className="flex-1 min-h-[38px] rounded-xl bg-[#121214] hover:bg-white/10 border border-white/10 font-mono-tabular text-xs text-white"
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="savings-amount-input" className="block text-xs text-zinc-400 mb-1.5">
                Amount to add (₹)
              </label>
              <input
                id="savings-amount-input"
                type="number"
                min={1}
                max={100000}
                value={savingsInput}
                onChange={(e) => setSavingsInput(e.target.value)}
                autoFocus
                className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#121214] border border-white/15 focus:border-violet-400 focus:outline-none font-mono-tabular text-base text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSavingsModalOpen(false)}
                className="min-h-[42px] px-4 rounded-xl bg-[#121214] border border-white/10 text-sm text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[42px] px-4 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200"
              >
                Add ₹{savingsInput || 0}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset Month Confirmation */}
      <ConfirmDialog
        open={isResetDialogOpen}
        title="Reset month?"
        description="This will restore November's sample expenses, ₹6,000 budget, category limits, and savings goal."
        confirmLabel="Reset month"
        onCancel={() => setIsResetDialogOpen(false)}
        onConfirm={() => {
          resetMonth();
          setIsResetDialogOpen(false);
        }}
      />
    </div>
  );
}
