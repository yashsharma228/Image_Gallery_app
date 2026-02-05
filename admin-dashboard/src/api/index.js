import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true // Send cookies with every request
});

// Handle token expiration / auth failure
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear any local user state if needed, but the cookie is handled by browser
      // Maybe redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (email, password, name) =>
    api.post('/auth/admin/register', { email, password, name }),
  login: (email, password) =>
    api.post('/auth/admin/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  
  checkSession: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Deprecated: No longer synchronous or local
  isAuthenticated: () => {
    // This is now tricky because we can't check cookie existence from JS.
    // We should rely on state management (Context/Redux) or checkSession.
    // For now, return false to force a checkSession call or rely on ProtectedRoute logic
    return false; 
  },
  getToken: () => null,
  getAdmin: () => null
};

// Image endpoints
export const imagesAPI = {
  upload: (formData) =>
    api.post('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    }),
  getAll: (options = {}) => {
    // options: { sort, userId, search, title, description }
    const params = new URLSearchParams();
    if (options.sort) params.append('sort', options.sort);
    if (options.userId) params.append('userId', options.userId);
    if (options.search) params.append('search', options.search);
    if (options.title) params.append('title', options.title);
    if (options.description) params.append('description', options.description);
    const url = '/images?' + params.toString();
    const token = localStorage.getItem('token');
    return api.get(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  },
  getById: (id) => {
    const token = localStorage.getItem('token');
    return api.get(`/images/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  },
  update: (id, data) => {
    const token = localStorage.getItem('token');
    return api.put(`/images/${id}`, data, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  },
  delete: (id) => {
    const token = localStorage.getItem('token');
    return api.delete(`/images/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  },
};

export default api;
