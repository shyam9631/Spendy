import { CATEGORIES, TODAY_DATE } from '../data/seed';
import { Category, Expense } from '../types/spendy';

/**
 * Format a numeric value in INR with Indian digit grouping (e.g. ₹2,580, ₹14,820, ₹1,00,000).
 */
export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const rounded = Math.round(abs * 100) / 100;
  const hasDecimals = rounded % 1 !== 0;

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(rounded);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

export function getYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7);
}

export function getDaysInMonth(yearMonth: string): number {
  const [yearStr, monthStr] = yearMonth.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr); // 1-based
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getDayOfMonth(dateStr: string): number {
  return Number(dateStr.slice(8, 10));
}

export function getDaysLeftInMonth(todayStr: string = TODAY_DATE): number {
  const totalDays = getDaysInMonth(getYearMonth(todayStr));
  const currentDay = getDayOfMonth(todayStr);
  return Math.max(0, totalDays - currentDay);
}

export function getDaysElapsedInMonth(todayStr: string = TODAY_DATE): number {
  return Math.max(1, getDayOfMonth(todayStr));
}

export function addDaysToDateStr(dateStr: string, deltaDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + deltaDays));
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getMonthExpenses(expenses: Expense[], yearMonth: string): Expense[] {
  return expenses.filter((e) => getYearMonth(e.date) === yearMonth);
}

export function getExpensesInRange(expenses: Expense[], startDate: string, endDate: string): Expense[] {
  return expenses.filter((e) => e.date >= startDate && e.date <= endDate);
}

export interface BudgetMetrics {
  spentThisMonth: number;
  left: number;
  daysLeft: number;
  safeToSpendToday: number;
  spentToday: number;
  todayLimitDelta: number; // Safe to spend today - Spent today (>=0 means under limit)
  isUnderTodayLimit: boolean;
  dailyAverage: number;
  budgetUsedPercent: number;
  isAt80Alert: boolean;
}

export function computeBudgetMetrics(
  expenses: Expense[],
  monthlyBudget: number,
  todayStr: string = TODAY_DATE
): BudgetMetrics {
  const monthKey = getYearMonth(todayStr);
  const monthExpenses = getMonthExpenses(expenses, monthKey);
  const spentThisMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const left = monthlyBudget - spentThisMonth;
  const daysLeft = getDaysLeftInMonth(todayStr);

  const safeToSpendToday =
    daysLeft > 0 ? Math.floor(left / daysLeft) : Math.floor(left);

  const spentToday = expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const todayLimitDelta = safeToSpendToday - spentToday;
  const isUnderTodayLimit = todayLimitDelta >= 0;

  const daysElapsed = getDaysElapsedInMonth(todayStr);
  const dailyAverage = Math.round(spentThisMonth / daysElapsed);

  const budgetUsedPercent =
    monthlyBudget > 0 ? Math.round((spentThisMonth / monthlyBudget) * 100) : 0;
  const isAt80Alert = monthlyBudget > 0 && spentThisMonth >= monthlyBudget * 0.8;

  return {
    spentThisMonth,
    left,
    daysLeft,
    safeToSpendToday,
    spentToday,
    todayLimitDelta,
    isUnderTodayLimit,
    dailyAverage,
    budgetUsedPercent,
    isAt80Alert,
  };
}

/**
 * Consecutive days up to todayStr with at least one expense.
 */
export function computeStreak(expenses: Expense[], todayStr: string = TODAY_DATE): number {
  const activeDates = new Set(expenses.map((e) => e.date));
  let streak = 0;
  let cursor = todayStr;

  while (activeDates.has(cursor)) {
    streak += 1;
    cursor = addDaysToDateStr(cursor, -1);
  }

  return streak;
}

export type BudgetBarTone = 'green' | 'amber' | 'red';

export function getBudgetBarTone(spent: number, limit: number): BudgetBarTone {
  if (limit <= 0) {
    return spent > 0 ? 'red' : 'green';
  }
  const pct = (spent / limit) * 100;
  if (pct >= 100) return 'red';
  if (pct >= 75) return 'amber';
  return 'green';
}

export function getBudgetBarFillClass(tone: BudgetBarTone): string {
  switch (tone) {
    case 'red':
      return 'bg-rose-500';
    case 'amber':
      return 'bg-amber-400';
    case 'green':
    default:
      return 'bg-emerald-500';
  }
}

export function getBudgetToneTextClass(tone: BudgetBarTone): string {
  switch (tone) {
    case 'red':
      return 'text-rose-400';
    case 'amber':
      return 'text-amber-400';
    case 'green':
    default:
      return 'text-emerald-400';
  }
}

export function getCategoryTotals(expenses: Expense[]): Record<Category, number> {
  const totals: Record<Category, number> = {
    Food: 0,
    Travel: 0,
    Study: 0,
    Fun: 0,
    Recharge: 0,
    Others: 0,
  };

  for (const exp of expenses) {
    if (exp.category in totals) {
      totals[exp.category] += exp.amount;
    } else {
      totals.Others += exp.amount;
    }
  }

  return totals;
}

export interface DayBarPoint {
  date: string;
  dayShort: string;
  dateShort: string;
  total: number;
  isToday: boolean;
  isHighest: boolean;
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateHeader(dateStr: string, todayStr: string = TODAY_DATE): string {
  if (dateStr === todayStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const wd = WEEKDAY_SHORT[dt.getUTCDay()];
    return `Today · ${wd}, ${d} ${MONTH_SHORT[m - 1]}`;
  }
  const yesterdayStr = addDaysToDateStr(todayStr, -1);
  if (dateStr === yesterdayStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const wd = WEEKDAY_SHORT[dt.getUTCDay()];
    return `Yesterday · ${wd}, ${d} ${MONTH_SHORT[m - 1]}`;
  }
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const wd = WEEKDAY_SHORT[dt.getUTCDay()];
  return `${wd}, ${d} ${MONTH_SHORT[m - 1]} ${y}`;
}

export function formatShortDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  return `${d} ${MONTH_SHORT[m - 1]}`;
}

export function getLast7DaysSeries(
  expenses: Expense[],
  todayStr: string = TODAY_DATE
): DayBarPoint[] {
  const dailyTotals = new Map<string, number>();
  for (const exp of expenses) {
    dailyTotals.set(exp.date, (dailyTotals.get(exp.date) ?? 0) + exp.amount);
  }

  const points: DayBarPoint[] = [];
  for (let offset = -6; offset <= 0; offset += 1) {
    const date = addDaysToDateStr(todayStr, offset);
    const [y, m, d] = date.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    points.push({
      date,
      dayShort: WEEKDAY_SHORT[dt.getUTCDay()],
      dateShort: `${d} ${MONTH_SHORT[m - 1]}`,
      total: dailyTotals.get(date) ?? 0,
      isToday: date === todayStr,
      isHighest: false,
    });
  }

  let maxTotal = 0;
  for (const pt of points) {
    if (pt.total > maxTotal) maxTotal = pt.total;
  }

  if (maxTotal > 0) {
    let marked = false;
    for (const pt of points) {
      if (pt.total === maxTotal && !marked) {
        pt.isHighest = true;
        marked = true;
      }
    }
  }

  return points;
}

export function getBiggestExpense(expenses: Expense[]): Expense | null {
  if (expenses.length === 0) return null;
  let best = expenses[0];
  for (const exp of expenses) {
    if (
      exp.amount > best.amount ||
      (exp.amount === best.amount && `${exp.date}T${exp.time}` > `${best.date}T${best.time}`)
    ) {
      best = exp;
    }
  }
  return best;
}

export interface ExpenseDateGroup {
  date: string;
  label: string;
  total: number;
  items: Expense[];
}

export function sortExpensesNewestFirst(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    const keyA = `${a.date} ${a.time}`;
    const keyB = `${b.date} ${b.time}`;
    if (keyA !== keyB) return keyB.localeCompare(keyA);
    return b.id.localeCompare(a.id);
  });
}

export function groupExpensesByDate(
  expenses: Expense[],
  todayStr: string = TODAY_DATE
): ExpenseDateGroup[] {
  const sorted = sortExpensesNewestFirst(expenses);
  const map = new Map<string, Expense[]>();

  for (const exp of sorted) {
    const list = map.get(exp.date);
    if (list) {
      list.push(exp);
    } else {
      map.set(exp.date, [exp]);
    }
  }

  const groups: ExpenseDateGroup[] = [];
  for (const [date, items] of map.entries()) {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    groups.push({
      date,
      label: formatDateHeader(date, todayStr),
      total,
      items,
    });
  }

  return groups;
}

export interface ExpenseFilterParams {
  search: string;
  month: string; // 'all' or 'YYYY-MM'
  category: Category | 'All';
}

export function filterExpenses(expenses: Expense[], params: ExpenseFilterParams): Expense[] {
  const query = params.search.trim().toLowerCase();

  return expenses.filter((exp) => {
    if (params.month !== 'all' && getYearMonth(exp.date) !== params.month) {
      return false;
    }
    if (params.category !== 'All' && exp.category !== params.category) {
      return false;
    }
    if (query) {
      const noteMatch = exp.note.toLowerCase().includes(query);
      const catMatch = exp.category.toLowerCase().includes(query);
      const modeMatch = exp.paymentMode.toLowerCase().includes(query);
      if (!noteMatch && !catMatch && !modeMatch) {
        return false;
      }
    }
    return true;
  });
}

function escapeCsvCell(value: string | number): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExpensesCsv(expenses: Expense[]): string {
  const header = ['Date', 'Time', 'Category', 'Note', 'Payment Mode', 'Amount'].join(',');
  const sorted = sortExpensesNewestFirst(expenses);
  const rows = sorted.map((exp) =>
    [
      escapeCsvCell(exp.date),
      escapeCsvCell(exp.time),
      escapeCsvCell(exp.category),
      escapeCsvCell(exp.note),
      escapeCsvCell(exp.paymentMode),
      escapeCsvCell(exp.amount),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

export function getCurrentTimeHHMM(now: Date = new Date()): string {
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export { CATEGORIES };
