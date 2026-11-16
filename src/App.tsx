import { AddExpenseSheet } from './components/AddExpenseSheet';
import { BottomNav } from './components/BottomNav';
import { ToastBanner } from './components/ToastBanner';
import { SpendyProvider, useSpendy } from './context/SpendyContext';
import { BudgetScreen } from './screens/BudgetScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { HomeScreen } from './screens/HomeScreen';
import { InsightsScreen } from './screens/InsightsScreen';

function SpendyShell() {
  const { activeTab } = useSpendy();

  return (
    <div className="min-h-dvh bg-[#000000] text-[#e5e1e4]">
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pt-5 pb-28">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'insights' && <InsightsScreen />}
        {activeTab === 'budget' && <BudgetScreen />}
      </main>

      <ToastBanner />
      <BottomNav />
      <AddExpenseSheet />
    </div>
  );
}

export default function App() {
  return (
    <SpendyProvider>
      <SpendyShell />
    </SpendyProvider>
  );
}
