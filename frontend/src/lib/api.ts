import axios from 'axios';

// API base URL - change this in production
const API_BASE_URL = 'http://localhost:8000';

// Create Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized) - clear token and redirect to login
    // But only if we're not already on the login page to avoid infinite redirects
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  health: '/health',
  signup: '/auth/signup',
  login: '/auth/login',
  me: '/users/me',
  snippets: '/snippets',
  publicSnippets: '/snippets/public',
  tags: '/tags',
} as const;

// Helper function to make API calls
export const apiCall = {
  get: (url: string) => api.get(url),
  post: (url: string, data: any) => api.post(url, data),
  put: (url: string, data: any) => api.put(url, data),
  patch: (url: string, data: any) => api.patch(url, data),
  delete: (url: string) => api.delete(url),
}; 