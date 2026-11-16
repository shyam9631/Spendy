import { Download, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExpenseRow } from '../components/ExpenseRow';
import { useSpendy } from '../context/SpendyContext';
import { AVAILABLE_MONTHS, CATEGORIES, TODAY_DATE } from '../data/seed';
import { Category, Expense } from '../types/spendy';
import {
  buildExpensesCsv,
  filterExpenses,
  formatINR,
  groupExpensesByDate,
} from '../utils/finance';

const INITIAL_DAYS_LIMIT = 15;
const LOAD_MORE_STEP = 15;

export function HistoryScreen() {
  const {
    state,
    openEditExpense,
    deleteExpense,
    historyInitialCategory,
    clearHistoryInitialCategory,
  } = useSpendy();

  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [visibleDaysLimit, setVisibleDaysLimit] = useState(INITIAL_DAYS_LIMIT);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  useEffect(() => {
    if (historyInitialCategory !== 'All') {
      setSelectedCategory(historyInitialCategory);
      setSelectedMonth('2026-11');
      clearHistoryInitialCategory();
    }
  }, [historyInitialCategory, clearHistoryInitialCategory]);

  const filtered = useMemo(
    () =>
      filterExpenses(state.expenses, {
        search,
        month: selectedMonth,
        category: selectedCategory,
      }),
    [state.expenses, search, selectedMonth, selectedCategory]
  );

  const grouped = useMemo(
    () => groupExpensesByDate(filtered, TODAY_DATE),
    [filtered]
  );

  const visibleGroups = grouped.slice(0, visibleDaysLimit);
  const hasMoreDays = grouped.length > visibleDaysLimit;
  const filteredTotal = filtered.reduce((sum, e) => sum + e.amount, 0);

  const selectedMonthLabel =
    AVAILABLE_MONTHS.find((m) => m.id === selectedMonth)?.label ?? 'All Months';

  const handleExportCsv = () => {
    const csv = buildExpensesCsv(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `spendy-expenses-${selectedMonth === 'all' ? 'all' : selectedMonth}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedMonth('all');
    setSelectedCategory('All');
    setVisibleDaysLimit(INITIAL_DAYS_LIMIT);
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">History</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Swipe left or tap an entry to edit or delete
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={filtered.length === 0}
          className="min-h-[40px] px-3.5 rounded-full bg-[#18181b] hover:bg-[#201f22] disabled:opacity-40 border border-white/10 text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Export CSV
        </button>
      </header>

      {/* Filtered Summary Card */}
      <section
        aria-label="Filtered spending total"
        className="rounded-2xl bg-[#121214] border border-white/10 p-4 flex items-center justify-between gap-3"
      >
        <div>
          <p className="text-xs text-zinc-400">
            {selectedMonthLabel}
            {selectedCategory !== 'All' ? ` · ${selectedCategory}` : ''}
          </p>
          <p data-testid="history-filtered-total" className="mt-1 font-mono-tabular text-2xl font-semibold text-white">
            {formatINR(filteredTotal)}
          </p>
        </div>
        <span className="font-mono-tabular text-xs text-zinc-400">
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </span>
      </section>

      {/* Search Input */}
      <div className="relative">
        <Search
          className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <label htmlFor="history-search" className="sr-only">
          Search expenses by note or category
        </label>
        <input
          id="history-search"
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleDaysLimit(INITIAL_DAYS_LIMIT);
          }}
          placeholder="Search notes or categories..."
          className="w-full min-h-[44px] pl-10 pr-9 rounded-2xl bg-[#121214] border border-white/10 focus:border-violet-400/60 focus:outline-none text-sm text-white placeholder:text-zinc-500"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Month Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by month">
        {AVAILABLE_MONTHS.map((m) => {
          const active = selectedMonth === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedMonth(m.id);
                setVisibleDaysLimit(INITIAL_DAYS_LIMIT);
              }}
              aria-pressed={active}
              className={`min-h-[36px] px-3.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
                active
                  ? 'bg-violet-500/20 border-violet-400/50 text-white'
                  : 'bg-[#09090b] border-white/8 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
        {(['All', ...CATEGORIES] as const).map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleDaysLimit(INITIAL_DAYS_LIMIT);
              }}
              aria-pressed={active}
              className={`min-h-[36px] px-3.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 border transition-colors ${
                active
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'bg-[#09090b] border-white/8 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grouped Expense List */}
      {visibleGroups.length === 0 ? (
        <div className="rounded-2xl bg-[#121214] border border-white/8 p-8 text-center space-y-3">
          <p className="text-sm font-medium text-zinc-200">No matching expenses</p>
          <p className="text-xs text-zinc-500">
            Try adjusting your search query, month, or category filter.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="min-h-[40px] px-4 rounded-full bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {visibleGroups.map((group) => (
            <section key={group.date} aria-label={group.label} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-medium text-zinc-400">{group.label}</h2>
                <span className="font-mono-tabular text-xs font-semibold text-zinc-300">
                  {formatINR(group.total)}
                </span>
              </div>
              <div className="space-y-2">
                {group.items.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onEdit={openEditExpense}
                    onDeleteRequest={(exp) => setPendingDelete(exp)}
                    enableSwipe
                  />
                ))}
              </div>
            </section>
          ))}

          {hasMoreDays && (
            <div className="pt-1 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleDaysLimit((prev) => prev + LOAD_MORE_STEP)}
                className="min-h-[44px] px-5 rounded-full bg-[#18181b] hover:bg-[#201f22] border border-white/12 text-xs font-medium text-white transition-colors"
              >
                Load earlier days ({grouped.length - visibleDaysLimit} more)
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete expense?"
        description={
          pendingDelete
            ? `Remove "${pendingDelete.note || pendingDelete.category}" (${formatINR(
                pendingDelete.amount
              )}) from ${pendingDelete.date}?`
            : ''
        }
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteExpense(pendingDelete.id);
            setPendingDelete(null);
          }
        }}
      />
    </div>
  );
}
