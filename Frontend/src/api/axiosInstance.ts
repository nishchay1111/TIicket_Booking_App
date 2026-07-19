import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { showAlert } from '../redux/slice/alert'; // Adjust path to your alert slice

// Variable to hold the Redux store instance
let store: any;

// Function to inject the store from store.ts
export const injectStore = (_store: any) => {
  store = _store;
};

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, 
});

axiosRetry(axiosInstance, { 
  retries: 3, 
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => axiosRetry.isNetworkError(error) || error.response?.status === 500
});

// --- Request Interceptor: Attach auth-token automatically ---
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers['auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor: Refresh Token & Global Alerts ---
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. Handle Soft Timeout (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Corrected port to 5001 to match your system
        const response = await axios.post('http://localhost:3001/api/auth/refresh-token', {}, { withCredentials: true });
        const { authtoken } = response.data;

        localStorage.setItem('token', authtoken);

        if (originalRequest.headers) {
          originalRequest.headers['auth-token'] = authtoken;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 2. Global Error Alerting (If store is injected)
    if (store && error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const errorMessage = data?.error || data?.message || "An unexpected error occurred";

      // We skip 401 because we handle it silently above
      if (status !== 401) {
        store.dispatch(showAlert({ 
          message: errorMessage, 
          severity: status >= 500 ? 'error' : 'warning' 
        }));
      }
    } else if (store && !error.response) {
      // Handle Network Errors (Server down)
      store.dispatch(showAlert({ message: "Network Error: Server is unreachable", severity: 'error' }));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;