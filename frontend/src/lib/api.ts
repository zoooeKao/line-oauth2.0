import axios from 'axios';
import { tokenStore } from './auth';

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      tokenStore.clear();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
