import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './index.css';

function AppRoutes() {
  const location = useLocation();
  const narrowAuth = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={narrowAuth ? 'flex justify-center pt-6 pb-10' : 'w-full pt-6 pb-10'}>
      <div className={narrowAuth ? 'w-full max-w-[600px]' : 'w-full max-w-7xl mx-auto px-4'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Router>
        <AppRoutes />
      </Router>
    </div>
  );
}

export default App;
