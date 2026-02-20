import { api } from './api';
import type { Expense, MileageEntry } from '@/types';

export const expensesApi = {
  getExpenses: async (params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }) => {
    const response = await api.get('/driver/expenses', { params });
    return response.data as Expense[];
  },

  createExpense: async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const response = await api.post('/driver/expenses', expense);
    return response.data as Expense;
  },

  updateExpense: async (id: string, expense: Partial<Expense>) => {
    const response = await api.put(`/driver/expenses/${id}`, expense);
    return response.data as Expense;
  },

  deleteExpense: async (id: string) => {
    await api.delete(`/driver/expenses/${id}`);
  },

  getMileage: async (params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get('/driver/mileage', { params });
    return response.data as MileageEntry[];
  },

  createMileageEntry: async (entry: Omit<MileageEntry, 'id' | 'createdAt'>) => {
    const response = await api.post('/driver/mileage', entry);
    return response.data as MileageEntry;
  },

  exportExpenses: async (format: 'csv' | 'pdf', params?: {
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.get(`/driver/expenses/export/${format}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};
