import axios from 'axios';
import Cookies from 'js-cookie';

// Set the base URL for all API requests
const API_BASE_URL = import.meta.env.VITE_API_URL;

axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    
    if (token) {
      // Ensure proper Bearer token format
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log for debugging (remove in production)
      if (config.url.includes('/articles/id/') || config.url.includes('/articles/')) {
        console.log('Request with auth:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
        });
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log API errors for easier debugging
    if (error.response && error.config?.url) {
      console.error(`API Error [${error.response.status}]:`, {
        url: error.config.url,
        method: error.config.method,
        status: error.response.status,
        message: error.response.data?.message || 'Unknown error'
      });
    }
    
    if (error.response?.status === 401) {
      // Only redirect to login if it's not already a login request
      // and we're not already on the login page
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      const isLoginPage = window.location.pathname === '/login';
      
      // Don't redirect if we're editing an article (let the component handle it)
      const isEditArticlePage = window.location.pathname.includes('/author/articles/edit/');
      
      if (!isLoginRequest && !isLoginPage && !isEditArticlePage) {
        console.warn('Authentication required - redirecting to login');
        // Token expired or invalid - redirect to login
        Cookies.remove('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => axios.post('/api/auth/login', credentials),
    register: (userData) => axios.post('/api/auth/register', userData),
    me: () => axios.get('/api/auth/me'),
    updateProfile: (userData) => axios.put('/api/auth/profile', userData),
  },

  // Articles endpoints
  articles: {
    getAll: (params = {}) => axios.get('/api/articles', { params }),
    getBySlug: (slug) => axios.get(`/api/articles/${slug}`),
    getById: (id) => axios.get(`/api/articles/id/${id}`),
    create: (articleData) => axios.post('/api/articles', articleData),
    update: (id, articleData) => axios.put(`/api/articles/${id}`, articleData),
    delete: (id) => axios.delete(`/api/articles/${id}`),
    publish: (id) => axios.patch(`/api/articles/${id}/publish`),
    unpublish: (id) => axios.patch(`/api/articles/${id}/unpublish`),
  },

  // Users endpoints (admin only)
  users: {
    getAll: (params = {}) => axios.get('/api/users', { params }),
    getById: (id) => axios.get(`/api/users/${id}`),
    update: (id, userData) => axios.put(`/api/users/${id}`, userData),
    delete: (id) => axios.delete(`/api/users/${id}`),
  },

  // Upload endpoints
  upload: {
    image: (formData) => axios.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  },

  // Categories endpoints
  categories: {
    getAll: () => axios.get('/api/categories'),
    create: (categoryData) => axios.post('/api/categories', categoryData),
    update: (id, categoryData) => axios.put(`/api/categories/${id}`, categoryData),
    delete: (id) => axios.delete(`/api/categories/${id}`),
  },
};

export default api;
