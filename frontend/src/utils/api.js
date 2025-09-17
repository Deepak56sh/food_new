// utils/api.js
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://food-new-85k1.onrender.com/api';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://food-new-85k1.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Functions
export const apiService = {
  // Content APIs
  getContent: () => api.get('/content'),
  createContent: (data) => api.post('/content', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateContent: (id, data) => api.put(`/content/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteContent: (id) => api.delete(`/content/${id}`),

  // Gallery APIs
  getGallery: () => api.get('/gallery'),
  getGalleryAdmin: () => api.get('/gallery/admin'),
  createGalleryItem: (data) => api.post('/gallery', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateGalleryItem: (id, data) => api.put(`/gallery/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteGalleryItem: (id) => api.delete(`/gallery/${id}`),

  // Contact APIs
  submitContact: (data) => api.post('/contact', data),
  getContacts: () => api.get('/contact'),
  markContactRead: (id) => api.put(`/contact/${id}/read`),
  deleteContact: (id) => api.delete(`/contact/${id}`),

  // Auth APIs
  login: (credentials) => api.post('/auth/login', credentials),
};

// Helper functions
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${BACKEND_URL}${imagePath}`;
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export default api;