import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  DriverPreferences,
  DriverPreferenceState,
  PreferenceProfileType,
  StrategyMode,
} from '@/types';

export function generateAiSuggestedPreferences(
  personal: DriverPreferences,
  inputs: {
    today_goal_earnings: number;
    today_available_hours: number;
    strategy_mode: StrategyMode;
  }
): DriverPreferences {
  const { today_goal_earnings, today_available_hours, strategy_mode } = inputs;

  const targetHourlyRate = today_goal_earnings / today_available_hours;

  const strategyMultipliers: Record<StrategyMode, { minRate: number; minPayout: number; maxPickup: number }> = {
    aggressive: { minRate: 1.3, minPayout: 0.8, maxPickup: 8 },
    balanced: { minRate: 1.0, minPayout: 1.0, maxPickup: 5 },
    conservative: { minRate: 0.8, minPayout: 1.2, maxPickup: 3 },
  };

  const multiplier = strategyMultipliers[strategy_mode];

  return {
    ...personal,
    strategy_mode,
    min_dollars_per_mile: Math.max(1.0, personal.min_dollars_per_mile * multiplier.minRate),
    min_trip_payout: Math.max(6.0, personal.min_trip_payout * multiplier.minPayout),
    max_unpaid_pickup_distance_miles: Math.min(10, personal.max_unpaid_pickup_distance_miles * (multiplier.maxPickup / 5)),
    target_hourly_rate: targetHourlyRate,
    max_daily_hours: today_available_hours,
  };
}

const STORAGE_KEY = '@1way/driver_preferences_state';

const DEFAULT_PERSONAL_PREFERENCES: DriverPreferences = {
  strategy_mode: 'balanced' as StrategyMode,
  min_dollars_per_mile: 1.5,
  min_trip_payout: 8.0,
  max_unpaid_pickup_distance_miles: 5.0,
  target_hourly_rate: 25.0,
  available_time_blocks: [
    { day: 'Monday', start: '08:00', end: '18:00' },
    { day: 'Tuesday', start: '08:00', end: '18:00' },
    { day: 'Wednesday', start: '08:00', end: '18:00' },
    { day: 'Thursday', start: '08:00', end: '18:00' },
    { day: 'Friday', start: '08:00', end: '18:00' },
  ],
  max_daily_hours: 10,
  max_continuous_hours_before_break: 4,
  buffer_minutes_between_rides: 5,
  preferred_end_time: '18:00',
  home_base_zip: '',
  preferred_zones: [],
  avoid_zones: [],
  max_dropoff_distance_from_home_miles: 30,
  favorite_ride_length: 'mixed',
  allow_late_night: false,
  late_night_start: '22:00',
  late_night_end: '05:00',
  burnout_protection_enabled: true,
  stick_to_plan_vs_flex: 50,
};

const DEFAULT_STATE: DriverPreferenceState = {
  personal: DEFAULT_PERSONAL_PREFERENCES,
  ai_today: undefined,
  active_profile: 'personal' as PreferenceProfileType,
  ai_assist_enabled_today: false,
  last_ai_plan_date: undefined,
};

export function useDriverPreferences() {
  const [state, setState] = useState<DriverPreferenceState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadPreferencesState = useCallback(async (): Promise<DriverPreferenceState> => {
    try {
      console.log('[useDriverPreferences] Loading preferences from AsyncStorage...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DriverPreferenceState;
        console.log('[useDriverPreferences] Loaded preferences:', parsed.active_profile);
        setState(parsed);
        return parsed;
      }
      console.log('[useDriverPreferences] No stored preferences, using defaults');
      setState(DEFAULT_STATE);
      return DEFAULT_STATE;
    } catch (error) {
      console.error('[useDriverPreferences] Error loading preferences:', error);
      setState(DEFAULT_STATE);
      return DEFAULT_STATE;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePreferencesState = useCallback(
    async (newState: DriverPreferenceState): Promise<void> => {
      try {
        console.log('[useDriverPreferences] Saving preferences state...');
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        setState(newState);
        console.log('[useDriverPreferences] Preferences saved successfully');
      } catch (error) {
        console.error('[useDriverPreferences] Error saving preferences:', error);
        throw error;
      }
    },
    []
  );

  const getActivePreferences = useCallback((): DriverPreferences => {
    if (state.active_profile === 'ai_today' && state.ai_today) {
      return state.ai_today;
    }
    return state.personal;
  }, [state]);

  const setActiveProfile = useCallback(
    async (profileType: PreferenceProfileType): Promise<void> => {
      console.log('[useDriverPreferences] Setting active profile to:', profileType);
      const newState: DriverPreferenceState = {
        ...state,
        active_profile: profileType,
      };
      await savePreferencesState(newState);
    },
    [state, savePreferencesState]
  );

  const setAiAssistEnabledToday = useCallback(
    async (enabled: boolean): Promise<void> => {
      console.log('[useDriverPreferences] Setting AI assist enabled to:', enabled);
      const today = new Date().toISOString().split('T')[0];
      const newState: DriverPreferenceState = {
        ...state,
        ai_assist_enabled_today: enabled,
        last_ai_plan_date: today,
      };
      await savePreferencesState(newState);
    },
    [state, savePreferencesState]
  );

  const updatePersonalPreferences = useCallback(
    async (updates: Partial<DriverPreferences>): Promise<void> => {
      console.log('[useDriverPreferences] Updating personal preferences:', Object.keys(updates));
      const newState: DriverPreferenceState = {
        ...state,
        personal: {
          ...state.personal,
          ...updates,
        },
      };
      await savePreferencesState(newState);
    },
    [state, savePreferencesState]
  );

  const updateAiTodayPreferences = useCallback(
    async (updates: Partial<DriverPreferences>): Promise<void> => {
      console.log('[useDriverPreferences] Updating AI today preferences:', Object.keys(updates));
      const currentAiPrefs = state.ai_today || { ...state.personal };
      const newState: DriverPreferenceState = {
        ...state,
        ai_today: {
          ...currentAiPrefs,
          ...updates,
        },
      };
      await savePreferencesState(newState);
    },
    [state, savePreferencesState]
  );

  const resetPersonalToDefaults = useCallback(async (): Promise<void> => {
    console.log('[useDriverPreferences] Resetting personal preferences to defaults');
    const newState: DriverPreferenceState = {
      ...state,
      personal: DEFAULT_PERSONAL_PREFERENCES,
    };
    await savePreferencesState(newState);
  }, [state, savePreferencesState]);

  const clearAiTodayProfile = useCallback(async (): Promise<void> => {
    console.log('[useDriverPreferences] Clearing AI today profile');
    const newState: DriverPreferenceState = {
      ...state,
      ai_today: undefined,
      active_profile: 'personal' as PreferenceProfileType,
      ai_assist_enabled_today: false,
    };
    await savePreferencesState(newState);
  }, [state, savePreferencesState]);

  useEffect(() => {
    loadPreferencesState();
  }, [loadPreferencesState]);

  return {
    state,
    isLoading,
    loadPreferencesState,
    savePreferencesState,
    getActivePreferences,
    setActiveProfile,
    setAiAssistEnabledToday,
    updatePersonalPreferences,
    updateAiTodayPreferences,
    resetPersonalToDefaults,
    clearAiTodayProfile,
  };
}
