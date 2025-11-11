import axios from 'axios';
import performanceMonitor from '../utils/performanceMonitor';

// In development, use Vite proxy (no baseURL needed)
// In production, use the API URL from environment variables
const apiUrl = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000')
  : ''; // Empty string for development to use Vite proxy

// Set default base URL for all axios requests
axios.defaults.baseURL = apiUrl;

// Debug logging
console.log('Axios configuration:', {
  isDevelopment: !import.meta.env.PROD,
  baseURL: apiUrl,
  environment: import.meta.env.MODE
});

// Add request interceptor to include auth token and credentials
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.withCredentials = true;

    // Add request start time for performance monitoring
    config.metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    performanceMonitor.logError('REQUEST_ERROR', 'Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors and track performance
axios.interceptors.response.use(
  (response) => {
    // Track successful API call performance
    if (response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      const endpoint = response.config.url.replace(response.config.baseURL, '');
      performanceMonitor.trackApiCall(endpoint, response.config.method.toUpperCase(), duration, true);
    }
    return response;
  },
  (error) => {
    // Track failed API call performance
    if (error.config?.metadata) {
      const duration = Date.now() - error.config.metadata.startTime;
      const endpoint = error.config.url.replace(error.config.baseURL, '');
      performanceMonitor.trackApiCall(endpoint, error.config.method.toUpperCase(), duration, false);
    }

    // Log error for monitoring
    performanceMonitor.logError('API_ERROR', `${error.response?.status || 'Network'} error`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    // Enhanced error logging
    console.error('API Error Details:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;