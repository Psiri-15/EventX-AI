import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for centralized error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors ? error.response.data.errors.join(', ') : null) ||
      error.message ||
      'An unexpected error occurred';

    // Handle 401 Unauthorized (session expired)
    if (error.response?.status === 401) {
      if (localStorage.getItem('eventx_token')) {
        localStorage.removeItem('eventx_token');
        localStorage.removeItem('eventx_user');
        window.dispatchEvent(new Event('eventx_auth_expired'));
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
