import axios from 'axios';
import api from './api'; // Use the configured api instance with credentials
import { auth } from './firebase';

export const authService = {
  googleLogin: async (idToken) => {
    try {
      console.log('📤 Sending login request to backend...');
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/user/login`);
      
      const response = await api.post(
        '/auth/user/login',
        { idToken }
      );
      
      console.log('✅ Backend response received:', response.data);
      // Store JWT token in localStorage for API calls
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('❌ Login API error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Remove JWT token from localStorage
    localStorage.removeItem('token');
  },

  checkSession: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      return null;
    }
  },
  
  // Deprecated: No longer synchronous or local
  getUser: () => {
    return null; 
  },
};
