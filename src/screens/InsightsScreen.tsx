import { Flame, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CategoryIcon } from '../components/CategoryIcon';
import { useSpendy } from '../context/SpendyContext';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  CURRENT_MONTH,
  TODAY_DATE,
} from '../data/seed';
import { Category } from '../types/spendy';
import {
  addDaysToDateStr,
  formatINR,
  formatShortDate,
  getBiggestExpense,
  getBudgetBarFillClass,
  getBudgetBarTone,
  getCategoryTotals,
  getDaysElapsedInMonth,
  getExpensesInRange,
  getLast7DaysSeries,
  getMonthExpenses,
} from '../utils/finance';

type InsightRange = 'week' | 'month';

export function InsightsScreen() {
  const { state } = useSpendy();
  const [range, setRange] = useState<InsightRange>('month');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const weekStart = addDaysToDateStr(TODAY_DATE, -6);

  const periodExpenses = useMemo(() => {
    if (range === 'week') {
      return getExpensesInRange(state.expenses, weekStart, TODAY_DATE);
    }
    return getMonthExpenses(state.expenses, CURRENT_MONTH);
  }, [state.expenses, range, weekStart]);

  const totalSpent = useMemo(
    () => periodExpenses.reduce((sum, e) => sum + e.amount, 0),
    [periodExpenses]
  );

  const divisorDays = range === 'week' ? 7 : getDaysElapsedInMonth(TODAY_DATE);
  const dailyAverage = Math.round(totalSpent / divisorDays);
  const biggestSpend = useMemo(() => getBiggestExpense(periodExpenses), [periodExpenses]);

  const categoryTotals = useMemo(() => getCategoryTotals(periodExpenses), [periodExpenses]);
  const monthCategoryTotals = useMemo(
    () => getCategoryTotals(getMonthExpenses(state.expenses, CURRENT_MONTH)),
    [state.expenses]
  );

  const last7Days = useMemo(
    () => getLast7DaysSeries(state.expenses, TODAY_DATE),
    [state.expenses]
  );
  const maxDaySpend = Math.max(1, ...last7Days.map((d) => d.total));

  // Build SVG Donut arcs
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const donutSegments = useMemo(() => {
    if (totalSpent <= 0) return [];
    let offset = 0;
    return CATEGORIES.filter((cat) => categoryTotals[cat] > 0).map((cat) => {
      const value = categoryTotals[cat];
      const fraction = value / totalSpent;
      const dashLength = fraction * circumference;
      const segment = {
        category: cat,
        value,
        percent: Math.round(fraction * 100),
        color: CATEGORY_COLORS[cat],
        dashArray: `${dashLength} ${circumference - dashLength}`,
        dashOffset: -offset,
      };
      offset += dashLength;
      return segment;
    });
  }, [categoryTotals, totalSpent, circumference]);

  const focusedSegment = activeCategory
    ? donutSegments.find((s) => s.category === activeCategory)
    : null;

  return (
    <div className="space-y-5">
      {/* Header + Week | Month Toggle */}
      <header className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Insights</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {range === 'week' ? '10 Nov – 16 Nov 2026' : 'November 2026'}
          </p>
        </div>

        <div
          role="group"
          aria-label="Insights date range"
          className="inline-flex p-1 rounded-full bg-[#121214] border border-white/10"
        >
          <button
            type="button"
            onClick={() => setRange('week')}
            aria-pressed={range === 'week'}
            className={`min-h-[34px] px-3.5 rounded-full text-xs font-medium transition-colors ${
              range === 'week'
                ? 'bg-violet-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={() => setRange('month')}
            aria-pressed={range === 'month'}
            className={`min-h-[34px] px-3.5 rounded-full text-xs font-medium transition-colors ${
              range === 'month'
                ? 'bg-violet-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Month
          </button>
        </div>
      </header>

      {/* KPI Row: Daily Average & Biggest Spend */}
      <div className="grid grid-cols-2 gap-3">
        <section className="rounded-2xl bg-[#121214] border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">Daily average</p>
            <TrendingUp className="w-4 h-4 text-violet-400" aria-hidden="true" />
          </div>
          <p data-testid="insights-daily-avg" className="mt-2 font-mono-tabular text-2xl font-semibold text-white">
            {formatINR(dailyAverage)}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500">
            Across {divisorDays} {divisorDays === 1 ? 'day' : 'days'}
          </p>
        </section>

        <section className="rounded-2xl bg-[#121214] border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-400">Biggest spend</p>
            <Flame className="w-4 h-4 text-pink-400" aria-hidden="true" />
          </div>
          <p data-testid="insights-biggest-spend" className="mt-2 font-mono-tabular text-2xl font-semibold text-white">
            {biggestSpend ? formatINR(biggestSpend.amount) : '₹0'}
          </p>
          <p className="mt-1 text-[11px] text-zinc-500 truncate">
            {biggestSpend
              ? `${biggestSpend.note || biggestSpend.category} · ${formatShortDate(biggestSpend.date)}`
              : 'No expenses in range'}
          </p>
        </section>
      </div>

      {/* Main Analytics Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Last 7 Days Bar Chart */}
        <section
          aria-label="Last 7 days spending chart"
          className="lg:col-span-6 rounded-3xl bg-[#121214] border border-white/10 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-white">Last 7 days</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Daily spend cadence</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Highest
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Today
              </span>
            </div>
          </div>

          <div className="h-48 grid grid-cols-7 gap-2 items-end pt-6">
            {last7Days.map((day) => {
              const heightPct = day.total > 0 ? Math.max(10, Math.round((day.total / maxDaySpend) * 100)) : 4;
              let barColor = 'bg-zinc-700';
              if (day.isHighest) {
                barColor = 'bg-pink-500';
              } else if (day.isToday) {
                barColor = 'bg-violet-500';
              }

              return (
                <div key={day.date} className="h-full flex flex-col items-center justify-end gap-1.5">
                  <div className="h-5 flex items-end justify-center">
                    {day.isHighest ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-medium leading-none whitespace-nowrap">
                        Highest
                      </span>
                    ) : day.isToday ? (
                      <span className="text-[10px] font-medium text-violet-300 leading-none">
                        Today
                      </span>
                    ) : null}
                  </div>

                  <span className="font-mono-tabular text-[10px] text-zinc-400">
                    ₹{day.total}
                  </span>

                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      data-testid={`bar-${day.date}`}
                      data-highest={day.isHighest ? 'true' : 'false'}
                      data-today={day.isToday ? 'true' : 'false'}
                      className={`w-full max-w-[30px] rounded-t-lg transition-all duration-300 ${barColor}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${day.dateShort}: ${formatINR(day.total)}`}
                    />
                  </div>

                  <div className="text-center leading-tight">
                    <p
                      className={`text-[11px] font-medium ${
                        day.isToday
                          ? 'text-violet-300'
                          : day.isHighest
                          ? 'text-pink-300'
                          : 'text-zinc-400'
                      }`}
                    >
                      {day.dayShort}
                    </p>
                    <p className="font-mono-tabular text-[10px] text-zinc-500">
                      {day.date.slice(8)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Donut Chart + Category Breakdown */}
        <section
          aria-label="Category spending breakdown"
          className="lg:col-span-6 rounded-3xl bg-[#121214] border border-white/10 p-5 space-y-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-white">Category split</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {range === 'week' ? '7-day distribution' : 'Monthly budget usage'}
              </p>
            </div>
            <span className="font-mono-tabular text-xs font-medium text-zinc-300">
              {formatINR(totalSpent)}
            </span>
          </div>

          {/* Donut + Legend */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 144 144" className="w-full h-full -rotate-90" aria-hidden="true">
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="16"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.category}
                    cx="72"
                    cy="72"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={activeCategory === seg.category ? '20' : '16'}
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    className="transition-all duration-200 cursor-pointer"
                    onClick={() =>
                      setActiveCategory((prev) =>
                        prev === seg.category ? null : seg.category
                      )
                    }
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                <span className="text-[11px] text-zinc-400">
                  {focusedSegment ? focusedSegment.category : 'Total'}
                </span>
                <span className="font-mono-tabular text-base font-semibold text-white">
                  {formatINR(focusedSegment ? focusedSegment.value : totalSpent)}
                </span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
              {CATEGORIES.map((cat) => {
                const val = categoryTotals[cat];
                const pct = totalSpent > 0 ? Math.round((val / totalSpent) * 100) : 0;
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory((prev) => (prev === cat ? null : cat))}
                    className={`flex items-center justify-between gap-2 px-2 py-1 rounded-lg text-left transition-colors ${
                      isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="text-xs text-zinc-300 truncate">{cat}</span>
                    </span>
                    <span className="font-mono-tabular text-xs text-zinc-400 shrink-0">
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Progress Bars */}
          <div className="space-y-3 pt-1 border-t border-white/8">
            {CATEGORIES.map((cat) => {
              const spent = categoryTotals[cat];
              const monthSpent = monthCategoryTotals[cat];
              const limit = state.categoryBudgets[cat] ?? 0;
              const compareAmount = range === 'month' ? spent : monthSpent;
              const tone = getBudgetBarTone(compareAmount, limit);
              const barPct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-zinc-200 font-medium">
                      <CategoryIcon category={cat} className="w-3.5 h-3.5 text-zinc-400" />
                      {cat}
                    </span>
                    <span className="font-mono-tabular text-zinc-300">
                      {formatINR(spent)}{' '}
                      <span className="text-zinc-500">/ {formatINR(limit)}</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getBudgetBarFillClass(
                        tone
                      )}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
