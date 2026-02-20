import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '@/config/env';

// Updated key as per requirements
const TOKEN_KEY = '@1way/auth_token';

export const api: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status < 500,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Basic error logging
    console.log('API Error:', error.message);

    if (error.response?.status === 401) {
       // Handle unauthorized - maybe clear token?
       // For now just reject, the UI or Store should handle logout
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
