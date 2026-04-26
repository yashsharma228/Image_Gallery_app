import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../api';

const ProtectedRoute = ({ children }) => {
  const storedToken = authAPI.getToken();
  const storedAdmin = authAPI.getAdmin();
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(storedToken && storedAdmin?.role === 'admin')
  );
  const [isCheckingSession, setIsCheckingSession] = useState(Boolean(storedToken));

  useEffect(() => {
    const checkAuth = async () => {
      if (!storedToken) {
        setIsAuthenticated(false);
        setIsCheckingSession(false);
        return;
      }

      try {
        const session = await authAPI.checkSession();
        setIsAuthenticated(session?.role === 'admin');
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        setIsAuthenticated(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkAuth();
  }, [storedToken]);

  if (isCheckingSession && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
