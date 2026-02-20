import { create } from 'zustand';
import type { Job } from '@/types';
import { mockJobs, mockAvailableJobs, generateRandomJob } from '@/mocks/jobs';
import { scheduleNewJobNotification } from '@/lib/notifications';
import { useAutomationStore } from './automationStore';

interface JobsStore {
  availableJobs: Job[];
  myJobs: Job[];
  currentJob: Job | null;
  isLoading: boolean;
  error: string | null;

  fetchAvailableJobs: (params?: {
    maxDistance?: number;
    minPayout?: number;
  }) => Promise<void>;
  fetchMyJobs: (status?: string) => Promise<void>;
  acceptJob: (id: string) => Promise<void>;
  startTrip: (id: string) => Promise<void>;
  completeTrip: (id: string, data: { actualDistance?: number; actualDuration?: number }) => Promise<void>;
  cancelJob: (id: string, reason: string) => Promise<void>;
  setCurrentJob: (job: Job | null) => void;
  simulateNewJob: () => Promise<void>;
}

export const useJobsStore = create<JobsStore>((set, get) => ({
  availableJobs: [],
  myJobs: [],
  currentJob: null,
  isLoading: false,
  error: null,

  fetchAvailableJobs: async (params) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let jobs = [...mockAvailableJobs];
      
      if (params?.maxDistance) {
        jobs = jobs.filter(j => j.distance <= params.maxDistance!);
      }
      if (params?.minPayout) {
        jobs = jobs.filter(j => j.driverShare >= params.minPayout!);
      }
      
      const previousJobs = get().availableJobs;
      const newJobs = jobs.filter(job => !previousJobs.find(pj => pj.id === job.id));
      
      for (const job of newJobs) {
        await scheduleNewJobNotification({
          id: job.id,
          pickupAddress: job.pickupLocation.address,
          payout: job.driverShare,
          distance: job.distance,
        });
        
        const automationState = useAutomationStore.getState();
        const { uno, preferences } = automationState;
        
        if (uno && preferences.enabled && (preferences.autoAccept || preferences.autoBid)) {
          const decision = uno.evaluateJob(job);
          console.log(`[Uno] Evaluated job ${job.id}:`, decision);
          
          if (decision.action === 'accept' && preferences.autoAccept) {
            console.log(`[Uno] Auto-accepting job ${job.id}`);
            setTimeout(() => {
              get().acceptJob(job.id).catch(console.error);
            }, 1000);
          } else if (decision.action === 'bid' && preferences.autoBid) {
            console.log(`[Uno] Auto-bidding on job ${job.id} with amount ${decision.bidAmount}`);
          }
        }
      }
      
      set({ availableJobs: jobs, isLoading: false });
    } catch (error: any) {
      console.error('Fetch available jobs error:', error);
      set({ error: error?.message || 'Failed to fetch jobs', isLoading: false });
    }
  },

  fetchMyJobs: async (status) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let jobs = [...mockJobs];
      
      if (status) {
        jobs = jobs.filter(j => j.status === status);
      }
      
      console.log('Fetched jobs successfully:', jobs.length);
      set({ myJobs: jobs, isLoading: false });
    } catch (error: any) {
      console.error('Fetch my jobs error:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        full: error,
      });
      set({ 
        error: error?.message || error?.details || 'Failed to fetch your jobs', 
        isLoading: false, 
        myJobs: [] 
      });
    }
  },

  acceptJob: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const jobToAccept = get().availableJobs.find(j => j.id === id);
      if (!jobToAccept) throw new Error('Job not found');
      
      const acceptedJob: Job = {
        ...jobToAccept,
        status: 'assigned',
        acceptedAt: new Date().toISOString(),
      };
      
      const myJobs = [...get().myJobs, acceptedJob];
      const availableJobs = get().availableJobs.filter(j => j.id !== id);
      set({ myJobs, availableJobs, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  startTrip: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const job = get().myJobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      
      const updatedJob: Job = { ...job, status: 'en-route' };
      const myJobs = get().myJobs.map(j => j.id === id ? updatedJob : j);
      set({ myJobs, currentJob: updatedJob, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  completeTrip: async (id: string, data) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const job = get().myJobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      
      const updatedJob: Job = {
        ...job,
        status: 'completed',
        completedAt: new Date().toISOString(),
        distance: data.actualDistance || job.distance,
        duration: data.actualDuration || job.duration,
      };
      
      const myJobs = get().myJobs.map(j => j.id === id ? updatedJob : j);
      set({ myJobs, currentJob: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  cancelJob: async (id: string, reason: string) => {
    try {
      set({ isLoading: true, error: null });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const job = get().myJobs.find(j => j.id === id);
      if (!job) throw new Error('Job not found');
      
      const updatedJob: Job = { ...job, status: 'cancelled' };
      const myJobs = get().myJobs.map(j => j.id === id ? updatedJob : j);
      set({ myJobs, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setCurrentJob: (job: Job | null) => {
    set({ currentJob: job });
  },

  simulateNewJob: async () => {
    const newJob = generateRandomJob();
    
    await scheduleNewJobNotification({
      id: newJob.id,
      pickupAddress: newJob.pickupLocation.address,
      payout: newJob.driverShare,
      distance: newJob.distance,
    });
    
    const automationState = useAutomationStore.getState();
    const { uno, preferences } = automationState;
    
    if (uno && preferences.enabled && (preferences.autoAccept || preferences.autoBid)) {
      const decision = uno.evaluateJob(newJob);
      console.log(`[Uno] Evaluated new job ${newJob.id}:`, decision);
      console.log(`[Uno] Reasons:`, decision.reasons);
      
      if (decision.action === 'accept' && preferences.autoAccept) {
        console.log(`[Uno] ✅ Auto-accepting job ${newJob.id}`);
        set((state) => ({
          availableJobs: [...state.availableJobs, newJob],
        }));
        setTimeout(() => {
          get().acceptJob(newJob.id).catch(console.error);
        }, 1500);
        return;
      } else if (decision.action === 'bid' && preferences.autoBid) {
        console.log(`[Uno] 💰 Auto-bidding on job ${newJob.id} with amount ${decision.bidAmount}`);
      } else {
        console.log(`[Uno] ❌ Declining job ${newJob.id}`);
      }
    }
    
    set((state) => ({
      availableJobs: [...state.availableJobs, newJob],
    }));
  },
}));
