import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeedState, CURRENT_MONTH, TODAY_DATE } from '../data/seed';
import {
  buildExpensesCsv,
  computeBudgetMetrics,
  computeStreak,
  filterExpenses,
  formatINR,
  getBudgetBarTone,
  getCategoryTotals,
  getLast7DaysSeries,
  getMonthExpenses,
  groupExpensesByDate,
} from './finance';

test('formatINR uses Indian digit grouping', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(184), '₹184');
  assert.equal(formatINR(2580), '₹2,580');
  assert.equal(formatINR(14820), '₹14,820');
  assert.equal(formatINR(100000), '₹1,00,000');
  assert.equal(formatINR(-250), '-₹250');
  assert.equal(formatINR(1250.5), '₹1,250.50');
});

test('seed data November totals match exact specification', () => {
  const seed = createSeedState();
  const novExpenses = getMonthExpenses(seed.expenses, CURRENT_MONTH);
  const metrics = computeBudgetMetrics(seed.expenses, seed.monthlyBudget, TODAY_DATE);
  const catTotals = getCategoryTotals(novExpenses);

  assert.equal(seed.monthlyBudget, 6000);
  assert.equal(metrics.spentThisMonth, 3420);
  assert.equal(metrics.left, 2580);
  assert.equal(metrics.daysLeft, 14);
  assert.equal(metrics.safeToSpendToday, 184); // floor(2580 / 14)
  assert.equal(metrics.spentToday, 120);
  assert.equal(metrics.todayLimitDelta, 64);
  assert.equal(metrics.isUnderTodayLimit, true);
  assert.equal(metrics.dailyAverage, 214); // Math.round(3420 / 16)
  assert.equal(metrics.isAt80Alert, false);

  assert.deepEqual(catTotals, {
    Food: 1480,
    Travel: 620,
    Study: 540,
    Fun: 420,
    Recharge: 250,
    Others: 110,
  });
});

test('last 7 days series matches seed daily totals and flags highest and today', () => {
  const seed = createSeedState();
  const series = getLast7DaysSeries(seed.expenses, TODAY_DATE);

  assert.equal(series.length, 7);
  assert.deepEqual(
    series.map((d) => ({ date: d.date, total: d.total })),
    [
      { date: '2026-11-10', total: 210 },
      { date: '2026-11-11', total: 160 },
      { date: '2026-11-12', total: 340 },
      { date: '2026-11-13', total: 120 },
      { date: '2026-11-14', total: 450 },
      { date: '2026-11-15', total: 180 },
      { date: '2026-11-16', total: 120 },
    ]
  );

  const highest = series.find((d) => d.isHighest);
  const today = series.find((d) => d.isToday);
  assert.equal(highest?.date, '2026-11-14');
  assert.equal(today?.date, '2026-11-16');
});

test('computeStreak counts consecutive days up to today', () => {
  const seed = createSeedState();
  assert.equal(computeStreak(seed.expenses, TODAY_DATE), 16);

  const withoutNov14 = seed.expenses.filter((e) => e.date !== '2026-11-14');
  assert.equal(computeStreak(withoutNov14, TODAY_DATE), 2); // Nov 16 and Nov 15

  const withoutToday = seed.expenses.filter((e) => e.date !== TODAY_DATE);
  assert.equal(computeStreak(withoutToday, TODAY_DATE), 0);
});

test('getBudgetBarTone enforces <75% green, 75-99% amber, >=100% red', () => {
  assert.equal(getBudgetBarTone(0, 1000), 'green');
  assert.equal(getBudgetBarTone(749, 1000), 'green');
  assert.equal(getBudgetBarTone(750, 1000), 'amber');
  assert.equal(getBudgetBarTone(999, 1000), 'amber');
  assert.equal(getBudgetBarTone(1000, 1000), 'red');
  assert.equal(getBudgetBarTone(1250, 1000), 'red');
});

test('80% alert and over-limit calculation respond to additional spend', () => {
  const seed = createSeedState();
  const extraExpenses = [
    ...seed.expenses,
    {
      id: 'extra-1',
      amount: 1400,
      category: 'Study' as const,
      note: 'Course fee',
      paymentMode: 'UPI' as const,
      date: TODAY_DATE,
      time: '15:00',
    },
  ];
  const metrics = computeBudgetMetrics(extraExpenses, 6000, TODAY_DATE);
  assert.equal(metrics.spentThisMonth, 4820);
  assert.equal(metrics.isAt80Alert, true); // 4820 >= 4800
  assert.equal(metrics.left, 1180);
  assert.equal(metrics.safeToSpendToday, 84); // floor(1180 / 14)
  assert.equal(metrics.spentToday, 1520);
  assert.equal(metrics.isUnderTodayLimit, false);
  assert.equal(metrics.todayLimitDelta, 84 - 1520);
});

test('filterExpenses combines search, month, and category filters', () => {
  const seed = createSeedState();
  const res = filterExpenses(seed.expenses, {
    search: 'biryani',
    month: '2026-11',
    category: 'Food',
  });
  assert.equal(res.length, 1);
  assert.equal(res[0].id, 'exp-nov15-1');

  const octOnly = filterExpenses(seed.expenses, {
    search: '',
    month: '2026-10',
    category: 'All',
  });
  assert.equal(octOnly.length, 4);
});

test('groupExpensesByDate sorts newest first and computes day totals', () => {
  const seed = createSeedState();
  const groups = groupExpensesByDate(seed.expenses, TODAY_DATE);
  assert.equal(groups[0].date, '2026-11-16');
  assert.equal(groups[0].total, 120);
  assert.equal(groups.length, 23); // 16 in Nov + 4 in Oct + 3 in Sep
});

test('buildExpensesCsv outputs valid CSV with escaped commas/quotes', () => {
  const csv = buildExpensesCsv([
    {
      id: '1',
      date: '2026-11-16',
      time: '12:00',
      category: 'Food',
      note: 'Chai, "Special" Bun',
      paymentMode: 'UPI',
      amount: 45,
    },
  ]);
  assert.equal(
    csv,
    'Date,Time,Category,Note,Payment Mode,Amount\n2026-11-16,12:00,Food,"Chai, ""Special"" Bun",UPI,45'
  );
});
