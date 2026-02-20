import type { Expense, MileageEntry } from '@/types';

export const mockExpenses: Expense[] = [
  {
    id: 'exp-1',
    amount: 45.50,
    category: 'fuel',
    date: new Date().toISOString(),
    notes: 'Gas station on Market St',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    amount: 25.00,
    category: 'car_wash',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Full service car wash',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'exp-3',
    amount: 89.99,
    category: 'maintenance',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Oil change and filter replacement',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'exp-4',
    amount: 12.00,
    category: 'parking',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Downtown parking while waiting for ride',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'exp-5',
    amount: 52.00,
    category: 'fuel',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Chevron station',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockMileageEntries: MileageEntry[] = [
  {
    id: 'mile-1',
    jobId: 'job-1',
    distance: 3.2,
    date: new Date().toISOString(),
    purpose: 'Passenger trip to Moscone Center',
    isJobRelated: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mile-2',
    jobId: 'job-2',
    distance: 14.5,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Airport run',
    isJobRelated: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mile-3',
    distance: 8.5,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Driving to service area',
    isJobRelated: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mile-4',
    jobId: 'job-3',
    distance: 8.7,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Ferry Building to Golden Gate Bridge',
    isJobRelated: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
