import axios, { type AxiosInstance } from 'axios';
import Constants from 'expo-constants';

const baseURL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:3000';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptors get wired up in api/interceptors.ts and invoked from AppProviders.
