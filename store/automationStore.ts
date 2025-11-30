import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AutomationPreferences, Job } from '@/types';
import { UnoBot } from '@/lib/unoBot';
import type { UnoDecision } from '@/lib/unoBot';

interface AutomationStore {
  preferences: AutomationPreferences;
  uno: UnoBot | null;
  updatePreferences: (preferences: Partial<AutomationPreferences>) => void;
  toggleZone: (zoneId: string) => void;
  evaluateJob: (job: Job) => {
    shouldAccept: boolean;
    reasons: string[];
  };
  evaluateJobWithUno: (job: Job) => UnoDecision;
  autoProcessJobs: (jobs: Job[]) => Promise<Job[]>;
}

export const useAutomationStore = create<AutomationStore>()(
  persist(
    (set, get) => {
      const initialPreferences: AutomationPreferences = {
        enabled: false,
        minPayout: 15,
        maxPayout: 200,
        maxDistance: 30,
        preferredTimeWindows: [
          {
            startHour: 6,
            endHour: 22,
            days: [1, 2, 3, 4, 5],
          },
        ],
        maxDailyHours: 10,
        preferredTripTypes: [],
        autoBid: false,
        autoAccept: false,
        daysOff: [],
        workingHours: [
          {
            id: '1',
            dayOfWeek: 1,
            startTime: '08:00',
            endTime: '18:00',
            isRecurring: true,
          },
          {
            id: '2',
            dayOfWeek: 2,
            startTime: '08:00',
            endTime: '18:00',
            isRecurring: true,
          },
          {
            id: '3',
            dayOfWeek: 3,
            startTime: '08:00',
            endTime: '18:00',
            isRecurring: true,
          },
          {
            id: '4',
            dayOfWeek: 4,
            startTime: '08:00',
            endTime: '18:00',
            isRecurring: true,
          },
          {
            id: '5',
            dayOfWeek: 5,
            startTime: '08:00',
            endTime: '18:00',
            isRecurring: true,
          },
        ],
        zones: [
          {
            id: 'zone-downtown',
            name: 'Downtown',
            description: 'City center and financial district',
            color: '#3b82f6',
            enabled: true,
          },
          {
            id: 'zone-airport',
            name: 'Airport',
            description: 'Airport pickups and dropoffs',
            color: '#10b981',
            enabled: true,
          },
          {
            id: 'zone-suburbs',
            name: 'Suburbs',
            description: 'Residential areas outside city center',
            color: '#f59e0b',
            enabled: true,
          },
          {
            id: 'zone-coastal',
            name: 'Coastal',
            description: 'Beach and waterfront areas',
            color: '#06b6d4',
            enabled: false,
          },
        ],
      };

      return {
        preferences: initialPreferences,
        uno: new UnoBot(initialPreferences),

        updatePreferences: (newPreferences) => {
          set((state) => {
            const updatedPreferences = {
              ...state.preferences,
              ...newPreferences,
            };
            state.uno?.updatePreferences(updatedPreferences);
            return {
              preferences: updatedPreferences,
            };
          });
        },

        toggleZone: (zoneId: string) => {
          set((state) => {
            const updatedZones = state.preferences.zones.map(zone =>
              zone.id === zoneId ? { ...zone, enabled: !zone.enabled } : zone
            );
            const updatedPreferences = {
              ...state.preferences,
              zones: updatedZones,
            };
            state.uno?.updatePreferences(updatedPreferences);
            return {
              preferences: updatedPreferences,
            };
          });
        },

        evaluateJobWithUno: (job: Job) => {
          const { uno } = get();
          if (!uno) {
            return {
              action: 'decline' as const,
              confidence: 0,
              reasons: ['Uno bot not initialized'],
            };
          }
          return uno.evaluateJob(job);
        },

        evaluateJob: (job: Job) => {
          const { preferences } = get();
          const reasons: string[] = [];
          let shouldAccept = true;

          if (!preferences.enabled) {
            return { shouldAccept: false, reasons: ['Automation is disabled'] };
          }

          if (job.driverShare < preferences.minPayout) {
            shouldAccept = false;
            reasons.push(`Payout ($${job.driverShare}) is below minimum ($${preferences.minPayout})`);
          }

          if (preferences.maxPayout && job.driverShare > preferences.maxPayout) {
            shouldAccept = false;
            reasons.push(`Payout ($${job.driverShare}) exceeds maximum ($${preferences.maxPayout})`);
          }

          if (job.distance > preferences.maxDistance) {
            shouldAccept = false;
            reasons.push(`Distance (${job.distance}mi) exceeds maximum (${preferences.maxDistance}mi)`);
          }

          const pickupDate = new Date(job.pickupTime);
          const pickupHour = pickupDate.getHours();
          const pickupDay = pickupDate.getDay();
          const pickupDateStr = pickupDate.toISOString().split('T')[0];

          const dayOff = preferences.daysOff.find(d => d.date === pickupDateStr);
          if (dayOff) {
            shouldAccept = false;
            reasons.push(`You have a day off scheduled${dayOff.reason ? `: ${dayOff.reason}` : ''}`);
          }

          const workingHours = preferences.workingHours.find(w => w.dayOfWeek === pickupDay);
          if (!workingHours) {
            shouldAccept = false;
            reasons.push('You are not scheduled to work on this day');
          } else {
            const startHour = parseInt(workingHours.startTime.split(':')[0], 10);
            const endHour = parseInt(workingHours.endTime.split(':')[0], 10);

            if (pickupHour < startHour || pickupHour >= endHour) {
              shouldAccept = false;
              reasons.push(`Pickup time is outside your working hours (${workingHours.startTime} - ${workingHours.endTime})`);
            }
          }

          const matchingWindow = preferences.preferredTimeWindows.find(window =>
            window.days.includes(pickupDay) &&
            pickupHour >= window.startHour &&
            pickupHour < window.endHour
          );

          if (!matchingWindow && preferences.preferredTimeWindows.length > 0) {
            reasons.push('Outside preferred time windows');
          }

          if (shouldAccept) {
            reasons.push('Meets all criteria');
            reasons.push(`Payout: $${job.driverShare.toFixed(2)}`);
            reasons.push(`Distance: ${job.distance}mi`);
          }

          return { shouldAccept, reasons };
        },

        autoProcessJobs: async (jobs: Job[]) => {
          const { preferences, evaluateJob } = get();
          const acceptedJobs: Job[] = [];

          if (!preferences.autoAccept) {
            return acceptedJobs;
          }

          for (const job of jobs) {
            const { shouldAccept } = evaluateJob(job);
            if (shouldAccept) {
              acceptedJobs.push(job);
              console.log(`[AI Automation] Auto-accepting job ${job.id}`);
            }
          }

          return acceptedJobs;
        },
      };
    },
    {
      name: 'automation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
