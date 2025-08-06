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
    // And only for authenticated endpoints, not public ones
    if (error.response?.status === 401 && 
        window.location.pathname !== '/login' && 
        !error.config.url?.includes('/public/') &&
        !error.config.url?.includes('/snippets/public/')) {
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
  publicSnippets: '/public/snippets', // Updated to use new public endpoints
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

// Create a separate API instance for public endpoints (no authentication)
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Snippet-specific API functions
export const snippetApi = {
  // Get all user snippets
  getUserSnippets: () => api.get(endpoints.snippets),
  
  // Get a specific snippet
  getSnippet: (id: number) => api.get(`${endpoints.snippets}/${id}`),
  
  // Create a new snippet
  createSnippet: (data: any) => api.post(endpoints.snippets, data),
  
  // Update a snippet
  updateSnippet: (id: number, data: any) => api.put(`${endpoints.snippets}/${id}`, data),
  
  // Delete a snippet
  deleteSnippet: (id: number) => api.delete(`${endpoints.snippets}/${id}`),
  
  // Toggle snippet visibility
  toggleSnippetVisibility: (id: number) => api.patch(`${endpoints.snippets}/${id}/toggle-public`),
  
  // Get public snippets (no authentication required)
  getPublicSnippets: () => publicApi.get(endpoints.publicSnippets),
  
  // Get a specific public snippet (no authentication required)
  getPublicSnippet: (id: number) => publicApi.get(`${endpoints.publicSnippets}/${id}`),
}; 