import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const ProtectedRoute = ({ requiredRole }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    userRole: null,
    loading: true
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No token found');
        }

        const response = await axios.get(`${API_BASE_URL}/auth/check-session`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.valid) {
          setAuthState({
            isAuthenticated: true,
            userRole: response.data.user.role,
            loading: false
          });
        } else {
          throw new Error('Session invalid');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setAuthState({
          isAuthenticated: false,
          userRole: null,
          loading: false
        });
      }
    };

    checkAuth();

    // Set up periodic session check (every 5 minutes)
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (authState.loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && authState.userRole !== requiredRole && authState.userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;