import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafetySettings, SafetyState, SafetyStatus } from '@/types/SafetySettings';

const STORAGE_KEY = '@1way/safety_state';

const DEFAULT_SAFETY_SETTINGS: SafetySettings = {
  max_driving_hours_per_day: 11,
  max_on_duty_hours_per_day: 14,
  max_driving_hours_per_7days: 60,
  required_break_minutes_after_hours: 30,
  in_cab_camera_installed: false,
  outward_camera_installed: false,
  fatigue_check_enabled: true,
  allow_ai_to_block_jobs_when_over_hours: true,
};

const DEFAULT_SAFETY_STATE: SafetyState = {
  settings: DEFAULT_SAFETY_SETTINGS,
  today_driving_hours: 0,
  today_on_duty_hours: 0,
  last_break_minutes_ago: 0,
};

export function useSafety() {
  const [safetyState, setSafetyState] = useState<SafetyState>(DEFAULT_SAFETY_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadSafetyState = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SafetyState = JSON.parse(stored);
        setSafetyState(parsed);
      } else {
        setSafetyState(DEFAULT_SAFETY_STATE);
      }
    } catch (error) {
      console.error('Error loading safety state:', error);
      setSafetyState(DEFAULT_SAFETY_STATE);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveSafetyState = useCallback(async (nextState: SafetyState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      setSafetyState(nextState);
    } catch (error) {
      console.error('Error saving safety state:', error);
    }
  }, []);

  const getSafetySettings = useCallback((): SafetySettings => {
    return safetyState.settings;
  }, [safetyState.settings]);

  const updateSafetySettings = useCallback(
    async (partial: Partial<SafetySettings>) => {
      const updated: SafetyState = {
        ...safetyState,
        settings: {
          ...safetyState.settings,
          ...partial,
        },
      };
      await saveSafetyState(updated);
    },
    [safetyState, saveSafetyState]
  );

  const getSafetyStatus = useCallback((): SafetyStatus => {
    const { settings, today_driving_hours, today_on_duty_hours, last_break_minutes_ago } = safetyState;

    const can_accept_more_driving =
      today_driving_hours < settings.max_driving_hours_per_day &&
      today_on_duty_hours < settings.max_on_duty_hours_per_day;

    const needs_break =
      today_driving_hours >= 8 &&
      last_break_minutes_ago >= settings.required_break_minutes_after_hours;

    const cameras_compliant =
      settings.in_cab_camera_installed && settings.outward_camera_installed;

    return {
      can_accept_more_driving,
      needs_break,
      cameras_compliant,
    };
  }, [safetyState]);

  const updateDailyHours = useCallback(
    async (partial: {
      today_driving_hours?: number;
      today_on_duty_hours?: number;
      last_break_minutes_ago?: number;
    }) => {
      const updated: SafetyState = {
        ...safetyState,
        today_driving_hours: partial.today_driving_hours ?? safetyState.today_driving_hours,
        today_on_duty_hours: partial.today_on_duty_hours ?? safetyState.today_on_duty_hours,
        last_break_minutes_ago: partial.last_break_minutes_ago ?? safetyState.last_break_minutes_ago,
      };
      await saveSafetyState(updated);
    },
    [safetyState, saveSafetyState]
  );

  const resetDailyCounters = useCallback(async () => {
    const updated: SafetyState = {
      ...safetyState,
      today_driving_hours: 0,
      today_on_duty_hours: 0,
      last_break_minutes_ago: 0,
    };
    await saveSafetyState(updated);
  }, [safetyState, saveSafetyState]);

  useEffect(() => {
    loadSafetyState();
  }, [loadSafetyState]);

  return {
    safetyState,
    isLoaded,
    loadSafetyState,
    saveSafetyState,
    getSafetySettings,
    updateSafetySettings,
    getSafetyStatus,
    updateDailyHours,
    resetDailyCounters,
  };
}
