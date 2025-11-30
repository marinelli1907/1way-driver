import { create } from 'zustand';
import type { ScheduleEvent, DriverAvailability, DayOffPreference } from '@/types';

interface ScheduleStore {
  events: ScheduleEvent[];
  availability: DriverAvailability[];
  daysOff: DayOffPreference[];
  isLoading: boolean;
  error: string | null;

  fetchSchedule: (startDate?: Date, endDate?: Date) => Promise<void>;
  addEvent: (event: Omit<ScheduleEvent, 'id'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  setAvailability: (availability: DriverAvailability[]) => void;
  addDayOff: (dayOff: Omit<DayOffPreference, 'id'>) => void;
  removeDayOff: (id: string) => void;
  
  isAvailable: (date: Date, hour: number) => boolean;
}

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  events: [],
  availability: [
    {
      id: '1',
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '17:00',
      isRecurring: true,
    },
    {
      id: '2',
      dayOfWeek: 2,
      startTime: '08:00',
      endTime: '17:00',
      isRecurring: true,
    },
    {
      id: '3',
      dayOfWeek: 3,
      startTime: '08:00',
      endTime: '17:00',
      isRecurring: true,
    },
    {
      id: '4',
      dayOfWeek: 4,
      startTime: '08:00',
      endTime: '17:00',
      isRecurring: true,
    },
    {
      id: '5',
      dayOfWeek: 5,
      startTime: '08:00',
      endTime: '17:00',
      isRecurring: true,
    },
  ],
  daysOff: [],
  isLoading: false,
  error: null,

  fetchSchedule: async (startDate, endDate) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addEvent: async (event) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newEvent: ScheduleEvent = {
        ...event,
        id: `event-${Date.now()}`,
      };
      
      set(state => ({
        events: [...state.events, newEvent],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteEvent: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        events: state.events.filter(e => e.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setAvailability: (availability: DriverAvailability[]) => {
    set({ availability });
  },

  addDayOff: (dayOff: Omit<DayOffPreference, 'id'>) => {
    const newDayOff: DayOffPreference = {
      ...dayOff,
      id: `dayoff-${Date.now()}`,
    };
    
    set(state => ({
      daysOff: [...state.daysOff, newDayOff],
    }));
  },

  removeDayOff: (id: string) => {
    set(state => ({
      daysOff: state.daysOff.filter(d => d.id !== id),
    }));
  },

  isAvailable: (date: Date, hour: number) => {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    const dayOff = get().daysOff.find(d => d.date === dateStr);
    if (dayOff) return false;
    
    const availability = get().availability.find(a => a.dayOfWeek === dayOfWeek);
    if (!availability) return false;
    
    const startHour = parseInt(availability.startTime.split(':')[0], 10);
    const endHour = parseInt(availability.endTime.split(':')[0], 10);
    
    return hour >= startHour && hour < endHour;
  },
}));
