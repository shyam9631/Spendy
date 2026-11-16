import {
  AlertTriangle,
  ArrowRight,
  Coffee,
  CupSoda,
  Plus,
  CarFront,
  UtensilsCrossed,
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { ExpenseRow } from '../components/ExpenseRow';
import { useSpendy } from '../context/SpendyContext';
import {
  CATEGORIES,
  CURRENT_MONTH,
  QUICK_ADD_PRESETS,
  TODAY_DATE,
} from '../data/seed';
import { QuickAddPreset } from '../types/spendy';
import {
  computeBudgetMetrics,
  formatINR,
  getBudgetBarFillClass,
  getBudgetBarTone,
  getCategoryTotals,
  getMonthExpenses,
  sortExpensesNewestFirst,
} from '../utils/finance';

function getPresetIcon(id: string) {
  switch (id) {
    case 'preset-chai':
      return <CupSoda className="w-4 h-4 text-amber-300" aria-hidden="true" />;
    case 'preset-coffee':
      return <Coffee className="w-4 h-4 text-violet-300" aria-hidden="true" />;
    case 'preset-auto':
      return <CarFront className="w-4 h-4 text-cyan-300" aria-hidden="true" />;
    case 'preset-lunch':
    default:
      return <UtensilsCrossed className="w-4 h-4 text-emerald-300" aria-hidden="true" />;
  }
}

export function HomeScreen() {
  const {
    state,
    setActiveTab,
    openAddExpense,
    openEditExpense,
    quickAddExpense,
    openHistoryForCategory,
  } = useSpendy();

  const metrics = computeBudgetMetrics(state.expenses, state.monthlyBudget, TODAY_DATE);
  const monthExpenses = getMonthExpenses(state.expenses, CURRENT_MONTH);
  const categoryTotals = getCategoryTotals(monthExpenses);
  const todayExpenses = sortExpensesNewestFirst(
    state.expenses.filter((e) => e.date === TODAY_DATE)
  );

  const monthProgressPct = Math.min(100, Math.max(0, metrics.budgetUsedPercent));
  const monthBarTone = getBudgetBarTone(metrics.spentThisMonth, state.monthlyBudget);

  const handleQuickAdd = (preset: QuickAddPreset) => {
    quickAddExpense(preset);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <header className="flex items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Spendy</h1>
          <p className="text-xs text-zinc-500 font-mono-tabular mt-0.5">Mon, 16 Nov 2026</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500">{state.userProfile.subtitle}</p>
          <p className="text-xs font-medium text-zinc-300">{state.userProfile.name}</p>
        </div>
      </header>

      {/* 80% Budget Alert Banner */}
      {state.settings.alertAt80 && metrics.isAt80Alert && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-2xl bg-amber-500/12 border border-amber-400/35 px-4 py-3 text-amber-200"
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <p className="text-xs leading-relaxed">
            <span className="font-semibold">80% budget alert:</span> You&apos;ve spent{' '}
            <span className="font-mono-tabular font-semibold">{formatINR(metrics.spentThisMonth)}</span>{' '}
            ({metrics.budgetUsedPercent}%) of your{' '}
            <span className="font-mono-tabular">{formatINR(state.monthlyBudget)}</span> monthly limit.
          </p>
        </div>
      )}

      {/* Responsive Desktop Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Hero + Today Card + Quick Add */}
        <div className="lg:col-span-6 space-y-4">
          {/* Hero Safe-to-Spend Card */}
          <section
            aria-label="Monthly budget summary"
            className="rounded-3xl bg-[#121214] border border-white/10 p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-zinc-400">Safe to spend today</p>
                <p
                  data-testid="safe-to-spend-value"
                  className="mt-1 font-mono-tabular text-4xl font-semibold tracking-tight text-white"
                >
                  {formatINR(Math.max(0, metrics.safeToSpendToday))}
                </p>
              </div>
              <span className="font-mono-tabular text-xs font-medium text-zinc-400">
                {metrics.budgetUsedPercent}% used
              </span>
            </div>

            {/* Monthly Progress Bar */}
            <div>
              <div className="h-2 w-full rounded-full bg-zinc-800/90 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getBudgetBarFillClass(
                    monthBarTone
                  )}`}
                  style={{ width: `${monthProgressPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono-tabular">
                  {formatINR(metrics.spentThisMonth)} spent
                </span>
                <span className="font-mono-tabular">
                  {formatINR(state.monthlyBudget)} budget
                </span>
              </div>
            </div>

            {/* Both Pills */}
            <div className="flex items-center gap-2.5 flex-wrap pt-0.5">
              <div className="rounded-full bg-[#18181b] border border-white/10 px-3.5 py-1.5 text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <span className="text-zinc-400">Left</span>
                <span
                  data-testid="month-left-value"
                  className={`font-mono-tabular font-semibold ${
                    metrics.left < 0 ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {formatINR(metrics.left)}
                </span>
              </div>
              <div className="rounded-full bg-[#18181b] border border-white/10 px-3.5 py-1.5 text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                <span data-testid="days-left-value" className="font-mono-tabular font-semibold text-white">
                  {metrics.daysLeft}
                </span>
                <span className="text-zinc-400">days left</span>
              </div>
            </div>
          </section>

          {/* Today Spend & Limit Status Card */}
          <section
            aria-label="Today's spending status"
            className="rounded-2xl bg-[#121214] border border-white/8 px-4 py-3.5 flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-xs text-zinc-400">Spent today</p>
              <p data-testid="spent-today-value" className="font-mono-tabular text-xl font-semibold text-white mt-0.5">
                {formatINR(metrics.spentToday)}
              </p>
            </div>
            <div
              data-testid="today-limit-tag"
              className={`rounded-full px-3 py-1.5 text-xs font-medium font-mono-tabular border ${
                metrics.isUnderTodayLimit
                  ? 'bg-emerald-500/12 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/12 border-rose-500/30 text-rose-300'
              }`}
            >
              {metrics.isUnderTodayLimit
                ? `${formatINR(metrics.todayLimitDelta)} under limit`
                : `${formatINR(Math.abs(metrics.todayLimitDelta))} over limit`}
            </div>
          </section>

          {/* Quick-Add Tiles */}
          <section aria-label="Quick add expenses">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-medium text-zinc-400">Quick add</h2>
              <span className="text-[11px] text-zinc-500">Tap to log now</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5">
              {QUICK_ADD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleQuickAdd(preset)}
                  className="min-h-[54px] rounded-2xl bg-[#121214] hover:bg-[#18181b] active:scale-[0.98] border border-white/8 hover:border-white/20 px-3.5 py-2.5 flex items-center justify-between gap-2 transition-all text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#18181b] border border-white/8 flex items-center justify-center shrink-0">
                      {getPresetIcon(preset.id)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{preset.label}</p>
                      <p className="text-[11px] text-zinc-500">{preset.category}</p>
                    </div>
                  </div>
                  <span className="font-mono-tabular text-xs font-semibold text-zinc-200 shrink-0">
                    ₹{preset.amount}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Category Strip + Today List */}
        <div className="lg:col-span-6 space-y-5">
          {/* Category Strip */}
          <section aria-label="Category budgets">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-medium text-zinc-400">Categories this month</h2>
              <button
                type="button"
                onClick={() => setActiveTab('budget')}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                Limits
              </button>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {CATEGORIES.map((cat) => {
                const spent = categoryTotals[cat] ?? 0;
                const limit = state.categoryBudgets[cat] ?? 0;
                const tone = getBudgetBarTone(spent, limit);
                const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => openHistoryForCategory(cat)}
                    className="min-w-[126px] sm:min-w-0 rounded-2xl bg-[#121214] hover:bg-[#18181b] border border-white/8 hover:border-white/20 p-3 text-left transition-colors shrink-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-zinc-200 truncate">{cat}</span>
                      <CategoryIcon category={cat} className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    </div>
                    <p className="mt-2 font-mono-tabular text-sm font-semibold text-white">
                      {formatINR(spent)}
                    </p>
                    <p className="text-[11px] font-mono-tabular text-zinc-500">
                      of {formatINR(limit)}
                    </p>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getBudgetBarFillClass(tone)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Today's Expenses */}
          <section aria-label="Today's expenses">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-sm font-medium text-white">Today</h2>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className="min-h-[36px] px-2 -mr-2 inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                See all
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {todayExpenses.length === 0 ? (
              <div className="rounded-2xl bg-[#121214] border border-white/8 p-6 text-center space-y-3">
                <p className="text-sm font-medium text-zinc-200">No expenses logged today</p>
                <p className="text-xs text-zinc-500">
                  Use Quick add above or log a custom expense to keep your streak alive.
                </p>
                <button
                  type="button"
                  onClick={openAddExpense}
                  className="min-h-[44px] px-4 rounded-full bg-white text-black text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Add your first expense
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayExpenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onEdit={openEditExpense}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
