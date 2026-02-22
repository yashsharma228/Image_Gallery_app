import axios from 'axios';

// Ensure baseURL ends with /api, fallback to localhost for local development
const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
  return url.replace(/\/$/, '') + (url.includes('/api') ? '' : '/api');
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests that need it
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const imageAPI = {
  getAll: (options = {}) => {
    // options: { sort, userId, search, title, description }
    const params = new URLSearchParams();
    if (options.sort) params.append('sort', options.sort);
    if (options.userId) params.append('userId', options.userId);
    if (options.search) params.append('search', options.search);
    if (options.title) params.append('title', options.title);
    if (options.description) params.append('description', options.description);
    const url = '/images?' + params.toString();
    return api.get(url);
  },
  getById: (id) => api.get(`/images/${id}`),
  likeImage: (imageId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return api.post(
      `/likes/${imageId}/like`,
      {},
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
  },
  unlikeImage: (imageId) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return api.delete(
      `/likes/${imageId}/like`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
  },
  getLikedImages: (sort = 'newest') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return api.get(
      `/likes?sort=${sort}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
  },
};

export default api;
