import { api } from './api';
import type { Job } from '@/types';

export const jobsApi = {
  getAvailableJobs: async (params?: {
    maxDistance?: number;
    minPayout?: number;
    startTime?: string;
    endTime?: string;
  }) => {
    const response = await api.get('/jobs/available', { params });
    return response.data as Job[];
  },

  getMyJobs: async (status?: string) => {
    const response = await api.get('/jobs/my', { params: { status } });
    return response.data as Job[];
  },

  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data as Job;
  },

  acceptJob: async (id: string) => {
    const response = await api.post(`/jobs/${id}/accept`);
    return response.data as Job;
  },

  placeBid: async (id: string, amount: number) => {
    const response = await api.post(`/jobs/${id}/bid`, { amount });
    return response.data;
  },

  startTrip: async (id: string) => {
    const response = await api.post(`/jobs/${id}/start`);
    return response.data as Job;
  },

  pickupPassenger: async (id: string) => {
    const response = await api.post(`/jobs/${id}/pickup`);
    return response.data as Job;
  },

  completeTrip: async (id: string, data: { actualDistance?: number; actualDuration?: number }) => {
    const response = await api.post(`/jobs/${id}/complete`, data);
    return response.data as Job;
  },

  cancelJob: async (id: string, reason: string) => {
    const response = await api.post(`/jobs/${id}/cancel`, { reason });
    return response.data as Job;
  },
};
