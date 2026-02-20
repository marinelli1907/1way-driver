import { setAuthToken, clearAuthToken } from './api';
import type { LoginCredentials, RegisterData } from '@/types';

const MOCK_USER = {
  id: 1,
  name: 'Demo Driver',
  email: 'driver@1way.com',
  phone: '+1 (555) 123-4567',
  role: 'driver' as const,
  availableForJobs: true,
  car: {
    make: 'Tesla',
    model: 'Model 3',
    year: '2023',
    color: 'Pearl White',
    licensePlate: 'ABC1234',
  },
};

const MOCK_TOKEN = 'mock-jwt-token-' + Date.now();

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await setAuthToken(MOCK_TOKEN);
    return { token: MOCK_TOKEN, user: MOCK_USER };
  },

  register: async (data: RegisterData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser = {
      ...MOCK_USER,
      name: data.name,
      email: data.email,
      phone: data.phone || MOCK_USER.phone,
    };
    await setAuthToken(MOCK_TOKEN);
    return { token: MOCK_TOKEN, user: newUser };
  },

  logout: async () => {
    await clearAuthToken();
  },

  me: async () => {
    return MOCK_USER;
  },

  forgotPassword: async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  resetPassword: async (token: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};
