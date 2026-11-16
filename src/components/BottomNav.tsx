import { BarChart3, Clock, Home, Plus, Wallet } from 'lucide-react';
import { useSpendy } from '../context/SpendyContext';
import { TabId } from '../types/spendy';

export function BottomNav() {
  const { activeTab, setActiveTab, openAddExpense } = useSpendy();

  const renderTab = (id: TabId, label: string, Icon: typeof Home) => {
    const isActive = activeTab === id;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(id)}
        aria-current={isActive ? 'page' : undefined}
        className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 rounded-2xl transition-colors ${
          isActive
            ? 'text-violet-400'
            : 'text-zinc-500 hover:text-zinc-200'
        }`}
      >
        <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
        <span className="mt-1 text-[11px] font-medium tracking-tight leading-none">{label}</span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-md"
    >
      <div className="grid grid-cols-5 items-center h-[64px] px-2 rounded-full bg-[#09090b]/90 backdrop-blur-md border border-white/10 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.9)]">
        <div className="flex justify-center">{renderTab('home', 'Home', Home)}</div>
        <div className="flex justify-center">{renderTab('history', 'History', Clock)}</div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={openAddExpense}
            aria-label="Add expense"
            className="w-12 h-12 rounded-full bg-violet-500 hover:bg-violet-400 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-violet-500/25 border border-violet-300/30 transition-all"
          >
            <Plus className="w-6 h-6" strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>

        <div className="flex justify-center">{renderTab('insights', 'Insights', BarChart3)}</div>
        <div className="flex justify-center">{renderTab('budget', 'Budget', Wallet)}</div>
      </div>
    </nav>
  );
}
