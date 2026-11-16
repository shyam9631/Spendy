import { CheckCircle2, RotateCcw, X } from 'lucide-react';
import { useSpendy } from '../context/SpendyContext';

export function ToastBanner() {
  const { toast, dismissToast } = useSpendy();

  if (!toast) return null;

  const isGreen = toast.tone === 'green';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg pointer-events-auto"
    >
      <div
        className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border shadow-2xl backdrop-blur-md ${
          isGreen
            ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
            : 'bg-[#18181b]/95 border-white/15 text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2
            className={`w-4 h-4 shrink-0 ${isGreen ? 'text-emerald-400' : 'text-violet-400'}`}
            aria-hidden="true"
          />
          <p className="text-sm font-medium leading-snug">{toast.text}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {toast.onUndo && (
            <button
              type="button"
              onClick={() => {
                toast.onUndo?.();
                dismissToast();
              }}
              className="min-h-[36px] px-3 rounded-full bg-white/12 hover:bg-white/20 text-xs font-medium text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Undo
            </button>
          )}
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
