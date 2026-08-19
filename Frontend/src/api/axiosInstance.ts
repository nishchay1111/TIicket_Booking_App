import axios, {type AxiosError, type InternalAxiosRequestConfig} from 'axios'
import axiosRetry from 'axios-retry';
import { showAlert } from '../redux/slice/alert';

/**
 * References the globally configured Redux store instance used for global UI alerts.
 */
let store: any;

/**
 * Injects the localized application Redux store instance to decouple 
 * dispatch capabilities from the early initialization lifecycle of Axios.
 * 
 * @param _store - The configured Redux store module instance.
 */
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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
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

    if (store && error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const errorMessage = data?.error || data?.message || "An unexpected error occurred";

      if (status !== 401) {
        store.dispatch(showAlert({ 
          message: errorMessage, 
          severity: status >= 500 ? 'error' : 'warning' 
        }));
      }
    } else if (store && !error.response) {
      store.dispatch(showAlert({ message: "Network Error: Server is unreachable", severity: 'error' }));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;