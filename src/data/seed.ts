import { Category, QuickAddPreset, SpendyState } from '../types/spendy';

export const TODAY_DATE = '2026-11-16';
export const CURRENT_MONTH = '2026-11';
export const MAX_EXPENSE_AMOUNT = 100000;

export const CATEGORIES: Category[] = [
  'Food',
  'Travel',
  'Study',
  'Fun',
  'Recharge',
  'Others',
];

export const PAYMENT_MODES = ['UPI', 'Cash', 'Card'] as const;

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#8b5cf6',     // violet
  Travel: '#06b6d4',   // cyan
  Study: '#10b981',    // emerald
  Fun: '#ec4899',      // pink
  Recharge: '#f59e0b', // amber
  Others: '#71717a',   // zinc
};

export const QUICK_ADD_PRESETS: QuickAddPreset[] = [
  {
    id: 'preset-chai',
    label: 'Chai',
    amount: 10,
    category: 'Food',
    paymentMode: 'UPI',
    note: 'Chai',
  },
  {
    id: 'preset-coffee',
    label: 'Coffee',
    amount: 15,
    category: 'Food',
    paymentMode: 'UPI',
    note: 'Coffee',
  },
  {
    id: 'preset-auto',
    label: 'Auto',
    amount: 50,
    category: 'Travel',
    paymentMode: 'Cash',
    note: 'Auto ride',
  },
  {
    id: 'preset-lunch',
    label: 'Lunch',
    amount: 70,
    category: 'Food',
    paymentMode: 'UPI',
    note: 'Lunch',
  },
];

export const AVAILABLE_MONTHS = [
  { id: 'all', label: 'All' },
  { id: '2026-11', label: 'Nov 2026' },
  { id: '2026-10', label: 'Oct 2026' },
  { id: '2026-09', label: 'Sep 2026' },
] as const;

export function createSeedState(): SpendyState {
  return {
    monthlyBudget: 6000,
    categoryBudgets: {
      Food: 1900,
      Travel: 1100,
      Study: 900,
      Fun: 800,
      Recharge: 300,
      Others: 1000,
    },
    savingsGoal: {
      title: 'New headphones',
      target: 2500,
      saved: 1150,
    },
    settings: {
      alertAt80: true,
      dailyReminder: false,
    },
    userProfile: {
      name: 'Aarav',
      subtitle: 'November Ledger',
    },
    expenses: [
      // Mon 16 Nov 2026 (Today) — Total ₹120
      {
        id: 'exp-nov16-3',
        amount: 40,
        category: 'Food',
        note: 'Canteen Poha',
        paymentMode: 'UPI',
        date: '2026-11-16',
        time: '13:20',
      },
      {
        id: 'exp-nov16-2',
        amount: 50,
        category: 'Travel',
        note: 'Auto to Campus',
        paymentMode: 'Cash',
        date: '2026-11-16',
        time: '10:15',
      },
      {
        id: 'exp-nov16-1',
        amount: 30,
        category: 'Food',
        note: 'Morning Chai & Samosa',
        paymentMode: 'UPI',
        date: '2026-11-16',
        time: '08:30',
      },

      // Sun 15 Nov 2026 — Total ₹180
      {
        id: 'exp-nov15-1',
        amount: 180,
        category: 'Food',
        note: 'Sunday Biryani',
        paymentMode: 'UPI',
        date: '2026-11-15',
        time: '19:40',
      },

      // Sat 14 Nov 2026 (Highest in last 7 days) — Total ₹450
      {
        id: 'exp-nov14-2',
        amount: 150,
        category: 'Food',
        note: 'Cafe Cold Coffee & Fries',
        paymentMode: 'UPI',
        date: '2026-11-14',
        time: '20:30',
      },
      {
        id: 'exp-nov14-1',
        amount: 300,
        category: 'Fun',
        note: 'Movie Ticket & Popcorn',
        paymentMode: 'Card',
        date: '2026-11-14',
        time: '16:00',
      },

      // Fri 13 Nov 2026 — Total ₹120
      {
        id: 'exp-nov13-2',
        amount: 50,
        category: 'Travel',
        note: 'Metro Card Top-up',
        paymentMode: 'UPI',
        date: '2026-11-13',
        time: '18:10',
      },
      {
        id: 'exp-nov13-1',
        amount: 70,
        category: 'Food',
        note: 'Veg Thali Lunch',
        paymentMode: 'UPI',
        date: '2026-11-13',
        time: '12:45',
      },

      // Thu 12 Nov 2026 — Total ₹340
      {
        id: 'exp-nov12-2',
        amount: 150,
        category: 'Food',
        note: 'Dosa & Filter Coffee',
        paymentMode: 'UPI',
        date: '2026-11-12',
        time: '14:00',
      },
      {
        id: 'exp-nov12-1',
        amount: 190,
        category: 'Study',
        note: 'Lab Printouts & Spiral Bind',
        paymentMode: 'Cash',
        date: '2026-11-12',
        time: '11:00',
      },

      // Wed 11 Nov 2026 — Total ₹160
      {
        id: 'exp-nov11-2',
        amount: 60,
        category: 'Food',
        note: 'Evening Momos',
        paymentMode: 'Cash',
        date: '2026-11-11',
        time: '17:15',
      },
      {
        id: 'exp-nov11-1',
        amount: 100,
        category: 'Travel',
        note: 'Bus Pass Weekly',
        paymentMode: 'UPI',
        date: '2026-11-11',
        time: '09:30',
      },

      // Tue 10 Nov 2026 — Total ₹210
      {
        id: 'exp-nov10-2',
        amount: 100,
        category: 'Study',
        note: 'A4 Sheets & Gel Pens',
        paymentMode: 'Cash',
        date: '2026-11-10',
        time: '15:30',
      },
      {
        id: 'exp-nov10-1',
        amount: 110,
        category: 'Food',
        note: 'Rajma Chawal Bowl',
        paymentMode: 'UPI',
        date: '2026-11-10',
        time: '13:10',
      },

      // Mon 9 Nov 2026 — Total ₹200
      {
        id: 'exp-nov09-2',
        amount: 80,
        category: 'Travel',
        note: 'Cab Share',
        paymentMode: 'UPI',
        date: '2026-11-09',
        time: '21:15',
      },
      {
        id: 'exp-nov09-1',
        amount: 120,
        category: 'Food',
        note: 'Paneer Roll & Juice',
        paymentMode: 'UPI',
        date: '2026-11-09',
        time: '13:40',
      },

      // Sun 8 Nov 2026 — Total ₹210
      {
        id: 'exp-nov08-2',
        amount: 90,
        category: 'Food',
        note: 'Ice Cream & Snacks',
        paymentMode: 'Cash',
        date: '2026-11-08',
        time: '20:00',
      },
      {
        id: 'exp-nov08-1',
        amount: 120,
        category: 'Fun',
        note: 'Bowling with Friends',
        paymentMode: 'UPI',
        date: '2026-11-08',
        time: '17:30',
      },

      // Sat 7 Nov 2026 — Total ₹250
      {
        id: 'exp-nov07-1',
        amount: 250,
        category: 'Study',
        note: 'Python Reference Book',
        paymentMode: 'Card',
        date: '2026-11-07',
        time: '15:20',
      },

      // Fri 6 Nov 2026 — Total ₹250
      {
        id: 'exp-nov06-2',
        amount: 110,
        category: 'Travel',
        note: 'Metro Trips',
        paymentMode: 'UPI',
        date: '2026-11-06',
        time: '18:45',
      },
      {
        id: 'exp-nov06-1',
        amount: 140,
        category: 'Food',
        note: 'Canteen Lunch & Chai',
        paymentMode: 'UPI',
        date: '2026-11-06',
        time: '13:05',
      },

      // Thu 5 Nov 2026 — Total ₹250
      {
        id: 'exp-nov05-1',
        amount: 250,
        category: 'Recharge',
        note: 'Jio Monthly 5G Pack',
        paymentMode: 'UPI',
        date: '2026-11-05',
        time: '10:00',
      },

      // Wed 4 Nov 2026 — Total ₹210
      {
        id: 'exp-nov04-2',
        amount: 50,
        category: 'Others',
        note: 'Laundry Detergent',
        paymentMode: 'Cash',
        date: '2026-11-04',
        time: '19:10',
      },
      {
        id: 'exp-nov04-1',
        amount: 160,
        category: 'Food',
        note: 'South Indian Breakfast',
        paymentMode: 'UPI',
        date: '2026-11-04',
        time: '09:15',
      },

      // Tue 3 Nov 2026 — Total ₹210
      {
        id: 'exp-nov03-2',
        amount: 80,
        category: 'Food',
        note: 'Maggi & Iced Tea',
        paymentMode: 'UPI',
        date: '2026-11-03',
        time: '16:50',
      },
      {
        id: 'exp-nov03-1',
        amount: 130,
        category: 'Travel',
        note: 'Auto & Campus Shuttle',
        paymentMode: 'Cash',
        date: '2026-11-03',
        time: '08:50',
      },

      // Mon 2 Nov 2026 — Total ₹160
      {
        id: 'exp-nov02-2',
        amount: 60,
        category: 'Others',
        note: 'USB Cable Clip & Tape',
        paymentMode: 'Cash',
        date: '2026-11-02',
        time: '17:40',
      },
      {
        id: 'exp-nov02-1',
        amount: 100,
        category: 'Food',
        note: 'Grilled Sandwich & Shake',
        paymentMode: 'UPI',
        date: '2026-11-02',
        time: '13:15',
      },

      // Sun 1 Nov 2026 — Total ₹100
      {
        id: 'exp-nov01-1',
        amount: 100,
        category: 'Travel',
        note: 'Local Train Ticket',
        paymentMode: 'UPI',
        date: '2026-11-01',
        time: '11:30',
      },

      // October 2026 historical entries
      {
        id: 'exp-oct29-1',
        amount: 240,
        category: 'Food',
        note: 'Hostel Treat Pizza',
        paymentMode: 'UPI',
        date: '2026-10-29',
        time: '20:15',
      },
      {
        id: 'exp-oct24-1',
        amount: 380,
        category: 'Study',
        note: 'Exam Guide & Highlighters',
        paymentMode: 'Card',
        date: '2026-10-24',
        time: '14:20',
      },
      {
        id: 'exp-oct18-1',
        amount: 299,
        category: 'Recharge',
        note: 'Wi-Fi Hostel Plan',
        paymentMode: 'UPI',
        date: '2026-10-18',
        time: '11:05',
      },
      {
        id: 'exp-oct12-1',
        amount: 190,
        category: 'Fun',
        note: 'Indie Concert Entry',
        paymentMode: 'UPI',
        date: '2026-10-12',
        time: '19:30',
      },

      // September 2026 historical entries
      {
        id: 'exp-sep27-1',
        amount: 320,
        category: 'Food',
        note: 'South Mess Extras',
        paymentMode: 'UPI',
        date: '2026-09-27',
        time: '13:30',
      },
      {
        id: 'exp-sep19-1',
        amount: 180,
        category: 'Travel',
        note: 'Bus Return Ticket',
        paymentMode: 'Cash',
        date: '2026-09-19',
        time: '08:15',
      },
      {
        id: 'exp-sep08-1',
        amount: 220,
        category: 'Others',
        note: 'Desk Lamp Bulb & Extension',
        paymentMode: 'Card',
        date: '2026-09-08',
        time: '16:40',
      },
    ],
  };
}
