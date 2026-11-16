import { Pencil, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Expense } from '../types/spendy';
import { formatINR } from '../utils/finance';
import { CategoryIcon, getCategoryIconStyle } from './CategoryIcon';

interface ExpenseRowProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDeleteRequest?: (expense: Expense) => void;
  enableSwipe?: boolean;
}

export function ExpenseRow({
  expense,
  onEdit,
  onDeleteRequest,
  enableSwipe = false,
}: ExpenseRowProps) {
  const [swipedOpen, setSwipedOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe) return;
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipe || startXRef.current === null) return;
    const dx = e.touches[0].clientX - startXRef.current;
    if (dx < 0) {
      setDragOffset(Math.max(-128, dx));
    } else if (swipedOpen) {
      setDragOffset(Math.min(0, -128 + dx));
    }
  };

  const handleTouchEnd = () => {
    if (!enableSwipe || startXRef.current === null) return;
    startXRef.current = null;
    if (dragOffset < -48) {
      setSwipedOpen(true);
    } else {
      setSwipedOpen(false);
    }
    setDragOffset(0);
  };

  const translateX = dragOffset !== 0 ? dragOffset : swipedOpen ? -128 : 0;
  const actionsVisible = swipedOpen || dragOffset < 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#121214] border border-white/8">
      {/* Revealed Swipe Actions */}
      {enableSwipe && onDeleteRequest && (
        <div
          aria-hidden={!actionsVisible}
          className={`absolute inset-y-0 right-0 flex items-stretch w-[128px] ${
            actionsVisible ? 'visible' : 'invisible pointer-events-none'
          }`}
        >
          <button
            type="button"
            tabIndex={actionsVisible ? 0 : -1}
            onClick={() => {
              setSwipedOpen(false);
              onEdit(expense);
            }}
            aria-label={`Edit ${expense.note || expense.category}`}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            tabIndex={actionsVisible ? 0 : -1}
            onClick={() => {
              setSwipedOpen(false);
              onDeleteRequest(expense);
            }}
            aria-label={`Delete ${expense.note || expense.category}`}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Delete
          </button>
        </div>
      )}

      {/* Foreground Row Content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={enableSwipe ? { transform: `translateX(${translateX}px)` } : undefined}
        className="relative z-10 flex items-center justify-between gap-3 px-3.5 py-3 bg-[#121214] transition-transform duration-150 ease-out"
      >
        <button
          type="button"
          aria-label={`${expense.note || expense.category}, ${expense.category}, ${formatINR(expense.amount)}`}
          onClick={() => {
            if (swipedOpen) {
              setSwipedOpen(false);
            } else {
              onEdit(expense);
            }
          }}
          className="flex items-center gap-3 min-w-0 flex-1 text-left focus:outline-none group"
        >
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${getCategoryIconStyle(
              expense.category
            )}`}
          >
            <CategoryIcon category={expense.category} className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
              {expense.note || expense.category}
            </p>
            <p className="text-xs text-zinc-500 truncate mt-0.5">
              <span>{expense.category}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono-tabular">{expense.time}</span>
              <span aria-hidden="true"> · </span>
              <span>{expense.paymentMode}</span>
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono-tabular text-[15px] font-medium text-white">
            {formatINR(expense.amount)}
          </span>
          {enableSwipe && onDeleteRequest && (
            <button
              type="button"
              onClick={() => setSwipedOpen((prev) => !prev)}
              aria-label={`Actions for ${expense.note || expense.category}`}
              aria-expanded={swipedOpen}
              className="min-w-[36px] min-h-[36px] rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
              title="Swipe left or tap for Edit / Delete"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
