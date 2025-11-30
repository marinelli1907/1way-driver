import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DriverAnalytics, RideHistory, CustomerProfile } from '@/types';

interface AnalyticsStore {
  analytics: DriverAnalytics | null;
  rideHistory: RideHistory[];
  customers: CustomerProfile[];
  
  loadAnalytics: () => Promise<void>;
  updateAnalytics: (data: Partial<DriverAnalytics>) => Promise<void>;
  addRide: (ride: RideHistory) => Promise<void>;
  loadRideHistory: () => Promise<void>;
  loadCustomers: () => Promise<void>;
}

const STORAGE_KEY_ANALYTICS = '@1way/analytics';
const STORAGE_KEY_HISTORY = '@1way/ride_history';
const STORAGE_KEY_CUSTOMERS = '@1way/customers';

const MOCK_ANALYTICS: DriverAnalytics = {
  totalHoursWorked: 156,
  totalMinutesWorked: 9360,
  totalSecondsWorked: 561600,
  totalRides: 248,
  totalTips: 1850.50,
  averageRating: 4.8,
  totalReviews: 185,
  memberSince: '2024-01-15',
  currentMonthEarnings: 3200,
  currentMonthMiles: 845,
  lifetimeEarnings: 28500,
  lifetimeMiles: 8230,
};

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  analytics: null,
  rideHistory: [],
  customers: [],

  loadAnalytics: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_ANALYTICS);
      if (stored) {
        set({ analytics: JSON.parse(stored) });
      } else {
        set({ analytics: MOCK_ANALYTICS });
        await AsyncStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(MOCK_ANALYTICS));
      }
    } catch (e) {
      console.error('Error loading analytics:', e);
      set({ analytics: MOCK_ANALYTICS });
    }
  },

  updateAnalytics: async (data: Partial<DriverAnalytics>) => {
    const { analytics } = get();
    if (!analytics) return;

    const updated = { ...analytics, ...data };
    await AsyncStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(updated));
    set({ analytics: updated });
  },

  addRide: async (ride: RideHistory) => {
    const { rideHistory } = get();
    const updated = [ride, ...rideHistory];
    await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    set({ rideHistory: updated });
  },

  loadRideHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
      if (stored) {
        set({ rideHistory: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Error loading ride history:', e);
    }
  },

  loadCustomers: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_CUSTOMERS);
      if (stored) {
        set({ customers: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Error loading customers:', e);
    }
  },
}));
