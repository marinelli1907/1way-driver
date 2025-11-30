import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PunchInSession } from '@/types';

interface PunchInStore {
  currentSession: PunchInSession | null;
  isPunchedIn: boolean;
  sessions: PunchInSession[];
  
  punchIn: (startOdometer: number) => Promise<void>;
  punchOut: (endOdometer: number) => Promise<void>;
  loadCurrentSession: () => Promise<void>;
  loadSessions: () => Promise<void>;
}

const STORAGE_KEY_CURRENT = '@1way/current_session';
const STORAGE_KEY_SESSIONS = '@1way/sessions';

export const usePunchInStore = create<PunchInStore>((set, get) => ({
  currentSession: null,
  isPunchedIn: false,
  sessions: [],

  punchIn: async (startOdometer: number) => {
    const session: PunchInSession = {
      id: Date.now().toString(),
      driverId: 'current_driver',
      startTime: new Date().toISOString(),
      startOdometer,
      isPunchedIn: true,
    };

    await AsyncStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(session));
    set({ currentSession: session, isPunchedIn: true });
  },

  punchOut: async (endOdometer: number) => {
    const { currentSession, sessions } = get();
    if (!currentSession) return;

    const endTime = new Date().toISOString();
    const totalDuration = new Date(endTime).getTime() - new Date(currentSession.startTime).getTime();
    const totalMiles = endOdometer - currentSession.startOdometer;

    const completedSession: PunchInSession = {
      ...currentSession,
      endTime,
      endOdometer,
      totalMiles,
      totalDuration,
      isPunchedIn: false,
    };

    const updatedSessions = [completedSession, ...sessions];
    await AsyncStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));
    await AsyncStorage.removeItem(STORAGE_KEY_CURRENT);

    set({ 
      currentSession: null, 
      isPunchedIn: false,
      sessions: updatedSessions 
    });
  },

  loadCurrentSession: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_CURRENT);
      if (stored) {
        const session = JSON.parse(stored);
        set({ currentSession: session, isPunchedIn: true });
      }
    } catch (e) {
      console.error('Error loading current session:', e);
    }
  },

  loadSessions: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_SESSIONS);
      if (stored) {
        const sessions = JSON.parse(stored);
        set({ sessions });
      }
    } catch (e) {
      console.error('Error loading sessions:', e);
    }
  },
}));
