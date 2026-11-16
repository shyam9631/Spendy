import { Delete, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSpendy } from '../context/SpendyContext';
import { CATEGORIES, MAX_EXPENSE_AMOUNT, PAYMENT_MODES, TODAY_DATE } from '../data/seed';
import { Category, PaymentMode } from '../types/spendy';
import { formatINR, getCurrentTimeHHMM } from '../utils/finance';
import { CategoryIcon, getCategoryIconStyle } from './CategoryIcon';

const QUICK_ADD_CHIPS = [10, 20, 50, 100];
const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'] as const;

export function AddExpenseSheet() {
  const {
    isExpenseSheetOpen,
    editingExpense,
    closeExpenseSheet,
    addExpense,
    updateExpense,
  } = useSpendy();

  const [amountStr, setAmountStr] = useState<string>('0');
  const [category, setCategory] = useState<Category | null>('Food');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(TODAY_DATE);
  const [time, setTime] = useState<string>(getCurrentTimeHHMM());
  const [capWarning, setCapWarning] = useState<boolean>(false);

  useEffect(() => {
    if (!isExpenseSheetOpen) return;
    if (editingExpense) {
      setAmountStr(String(editingExpense.amount));
      setCategory(editingExpense.category);
      setPaymentMode(editingExpense.paymentMode);
      setNote(editingExpense.note);
      setDate(editingExpense.date);
      setTime(editingExpense.time);
    } else {
      setAmountStr('0');
      setCategory(null);
      setPaymentMode('UPI');
      setNote('');
      setDate(TODAY_DATE);
      setTime(getCurrentTimeHHMM());
    }
    setCapWarning(false);
  }, [isExpenseSheetOpen, editingExpense]);

  if (!isExpenseSheetOpen) return null;

  const parsedAmount = Number(amountStr) || 0;
  const canSave = parsedAmount > 0 && parsedAmount <= MAX_EXPENSE_AMOUNT && category !== null;

  const applyNewAmountString = (nextStr: string) => {
    const val = Number(nextStr);
    if (Number.isNaN(val)) return;
    if (val > MAX_EXPENSE_AMOUNT) {
      setAmountStr(String(MAX_EXPENSE_AMOUNT));
      setCapWarning(true);
      return;
    }
    setCapWarning(false);
    setAmountStr(nextStr);
  };

  const handleKeyPress = (key: (typeof KEYPAD_KEYS)[number]) => {
    if (key === 'backspace') {
      setCapWarning(false);
      if (amountStr.length <= 1) {
        setAmountStr('0');
      } else {
        setAmountStr(amountStr.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      if (amountStr.includes('.')) return;
      setAmountStr(`${amountStr}.`);
      return;
    }

    // Digit 0-9
    if (amountStr.includes('.')) {
      const [, decimals] = amountStr.split('.');
      if (decimals.length >= 2) return;
      applyNewAmountString(`${amountStr}${key}`);
      return;
    }

    const next = amountStr === '0' ? key : `${amountStr}${key}`;
    applyNewAmountString(next);
  };

  const handleQuickChip = (delta: number) => {
    const nextVal = Math.round((parsedAmount + delta) * 100) / 100;
    if (nextVal > MAX_EXPENSE_AMOUNT) {
      setAmountStr(String(MAX_EXPENSE_AMOUNT));
      setCapWarning(true);
    } else {
      setCapWarning(false);
      setAmountStr(String(nextVal));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || !category) return;

    const payload = {
      amount: Math.round(parsedAmount * 100) / 100,
      category,
      note: note.trim() || category,
      paymentMode,
      date: date || TODAY_DATE,
      time: time || getCurrentTimeHHMM(),
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }
    closeExpenseSheet();
  };

  const formattedDisplay =
    amountStr.endsWith('.')
      ? `${formatINR(Number(amountStr.slice(0, -1)) || 0).replace('₹', '')}.`
      : amountStr.includes('.')
      ? amountStr
      : formatINR(parsedAmount).replace('₹', '');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-sheet-title"
    >
      <div className="w-full max-w-md max-h-[94dvh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-[#18181b] border border-white/12 shadow-2xl">
        {/* Grab handle & Header */}
        <div className="shrink-0 bg-[#18181b] px-5 pt-2.5 pb-2 border-b border-white/8">
          <div className="w-10 h-1 rounded-full bg-zinc-700 mx-auto mb-2 sm:hidden" />
          <div className="flex items-center justify-between">
            <h2 id="expense-sheet-title" className="text-base font-medium text-white">
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <button
              type="button"
              onClick={closeExpenseSheet}
              aria-label="Close expense sheet"
              className="min-w-[40px] min-h-[40px] -mr-2 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
          <div className="px-5 pt-3 pb-3 space-y-3">
            {/* Numeric Hero Display (no native input) */}
            <div className="text-center py-1">
              <div className="inline-flex items-baseline justify-center gap-1.5">
                <span className="font-mono-tabular text-2xl font-medium text-zinc-500">₹</span>
                <span
                  data-testid="expense-amount-display"
                  className={`font-mono-tabular text-4xl font-medium tracking-tight ${
                    parsedAmount > 0 ? 'text-white' : 'text-zinc-500'
                  }`}
                >
                  {formattedDisplay}
                </span>
              </div>
              {capWarning && (
                <p className="mt-1 text-xs text-amber-400">
                  Maximum expense amount is {formatINR(MAX_EXPENSE_AMOUNT)}
                </p>
              )}

              {/* Quick amount chips */}
              <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
                {QUICK_ADD_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleQuickChip(chip)}
                    className="min-h-[34px] px-3 rounded-full bg-[#121214] border border-white/10 hover:border-white/25 text-xs font-mono-tabular font-medium text-zinc-200 hover:text-white transition-colors"
                  >
                    +₹{chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <span className="block text-xs font-medium text-zinc-400 mb-1.5">
                Category {!category && <span className="text-violet-400">(Select one)</span>}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const selected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      aria-pressed={selected}
                      className={`min-h-[40px] px-2 py-1.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        selected
                          ? 'bg-violet-500/20 border-violet-400/60 text-white'
                          : 'bg-[#121214] border-white/8 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${getCategoryIconStyle(
                          cat
                        )}`}
                      >
                        <CategoryIcon category={cat} className="w-3 h-3" />
                      </span>
                      <span className="truncate">{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Mode + Note + Date/Time */}
            <div className="grid grid-cols-1 gap-2.5">
              <div>
                <span className="block text-xs font-medium text-zinc-400 mb-1">Payment Mode</span>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#121214] border border-white/8">
                  {PAYMENT_MODES.map((mode) => {
                    const active = paymentMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPaymentMode(mode)}
                        aria-pressed={active}
                        className={`min-h-[34px] rounded-lg text-xs font-medium transition-colors ${
                          active
                            ? 'bg-white text-black'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="expense-note" className="block text-xs font-medium text-zinc-400 mb-1">
                  Note
                </label>
                <input
                  id="expense-note"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What did you spend on?"
                  maxLength={60}
                  className="w-full min-h-[40px] px-3 rounded-xl bg-[#121214] border border-white/10 focus:border-violet-400/60 focus:outline-none text-sm text-white placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="expense-date" className="block text-xs font-medium text-zinc-400 mb-1">
                    Date
                  </label>
                  <input
                    id="expense-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#121214] border border-white/10 focus:border-violet-400/60 focus:outline-none text-xs font-mono-tabular text-white"
                  />
                </div>
                <div>
                  <label htmlFor="expense-time" className="block text-xs font-medium text-zinc-400 mb-1">
                    Time
                  </label>
                  <input
                    id="expense-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full min-h-[40px] px-3 rounded-xl bg-[#121214] border border-white/10 focus:border-violet-400/60 focus:outline-none text-xs font-mono-tabular text-white"
                  />
                </div>
              </div>
            </div>

            {/* Custom On-Screen Keypad */}
            <div
              className="grid grid-cols-3 gap-1.5 pt-0.5"
              role="group"
              aria-label="Expense amount keypad"
            >
              {KEYPAD_KEYS.map((key) => {
                const isBackspace = key === 'backspace';
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyPress(key)}
                    aria-label={isBackspace ? 'Backspace' : `Digit ${key}`}
                    className="min-h-[44px] rounded-xl bg-[#121214] hover:bg-[#201f22] active:bg-[#2a2a2c] border border-white/8 text-base font-mono-tabular font-medium text-white flex items-center justify-center transition-colors select-none"
                  >
                    {isBackspace ? <Delete className="w-4 h-4 text-zinc-300" /> : key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sticky Primary Submit CTA */}
          <div className="sticky bottom-0 shrink-0 bg-[#18181b]/95 backdrop-blur-md px-5 pt-2.5 pb-4 border-t border-white/8">
            <button
              type="submit"
              disabled={!canSave}
              className={`w-full min-h-[46px] rounded-2xl text-sm font-semibold transition-all ${
                canSave
                  ? 'bg-white text-black hover:bg-zinc-200 active:scale-[0.99]'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
