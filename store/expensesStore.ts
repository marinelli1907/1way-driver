import { create } from 'zustand';
import type { Expense, MileageEntry } from '@/types';
import { startOfMonth, endOfMonth } from 'date-fns';
import { mockExpenses, mockMileageEntries } from '@/mocks/expenses';

interface ExpensesStore {
  expenses: Expense[];
  mileageEntries: MileageEntry[];
  customCategories: string[];
  isLoading: boolean;
  error: string | null;

  fetchExpenses: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchMileage: (startDate?: Date, endDate?: Date) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  addMileageEntry: (entry: Omit<MileageEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCustomCategory: (category: string) => void;
  loadCustomCategories: () => void;
  
  getTotalExpenses: (month?: Date) => number;
  getTotalMileage: (month?: Date) => number;
  getExpensesByCategory: (category: string, month?: Date) => number;
}

export const useExpensesStore = create<ExpensesStore>((set, get) => ({
  expenses: [],
  mileageEntries: [],
  customCategories: [],
  isLoading: false,
  error: null,

  fetchExpenses: async (startDate, endDate) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let expenses = [...mockExpenses];
      
      if (startDate || endDate) {
        expenses = expenses.filter(e => {
          const date = new Date(e.date);
          if (startDate && date < startDate) return false;
          if (endDate && date > endDate) return false;
          return true;
        });
      }
      
      set({ expenses, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMileage: async (startDate, endDate) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let mileageEntries = [...mockMileageEntries];
      
      if (startDate || endDate) {
        mileageEntries = mileageEntries.filter(m => {
          const date = new Date(m.date);
          if (startDate && date < startDate) return false;
          if (endDate && date > endDate) return false;
          return true;
        });
      }
      
      set({ mileageEntries, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addExpense: async (expense) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newExpense: Expense = {
        ...expense,
        id: `exp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        expenses: [newExpense, ...state.expenses],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addMileageEntry: async (entry) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newEntry: MileageEntry = {
        ...entry,
        id: `mile-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        mileageEntries: [newEntry, ...state.mileageEntries],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        expenses: state.expenses.filter(e => e.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  getTotalExpenses: (month = new Date()) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return get().expenses
      .filter(e => {
        const date = new Date(e.date);
        return date >= start && date <= end;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  },

  getTotalMileage: (month = new Date()) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return get().mileageEntries
      .filter(m => {
        const date = new Date(m.date);
        return date >= start && date <= end;
      })
      .reduce((sum, m) => sum + m.distance, 0);
  },

  getExpensesByCategory: (category: string, month = new Date()) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return get().expenses
      .filter(e => {
        const date = new Date(e.date);
        return e.category === category && date >= start && date <= end;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  },

  addCustomCategory: (category: string) => {
    const customCategories = get().customCategories;
    if (!customCategories.includes(category)) {
      const newCategories = [...customCategories, category];
      set({ customCategories: newCategories });
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('customExpenseCategories', JSON.stringify(newCategories));
        }
      } catch (error) {
        console.error('Failed to save custom categories:', error);
      }
    }
  },

  loadCustomCategories: () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('customExpenseCategories');
        if (stored) {
          set({ customCategories: JSON.parse(stored) });
        }
      }
    } catch (error) {
      console.error('Failed to load custom categories:', error);
    }
  },
}));
