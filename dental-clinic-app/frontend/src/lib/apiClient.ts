import axios, { type AxiosError } from 'axios';

export const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: { message?: string } }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Request failed';
    return Promise.reject(new ApiError(message, error.response?.status));
  }
);

/** Builds an `Authorization` header object for call sites that still pass an explicit token. */
export function authHeader(token?: string | null) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
