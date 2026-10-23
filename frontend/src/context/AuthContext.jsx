import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('eventx_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('eventx_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('eventx_token', token);
    } else {
      localStorage.removeItem('eventx_token');
    }
  }, [token]);

  // Sync user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('eventx_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eventx_user');
    }
  }, [user]);

  // Verify current user on boot
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          // Token is invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();

    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('eventx_auth_expired', handleExpired);
    return () => window.removeEventListener('eventx_auth_expired', handleExpired);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const updateProfile = async (fields) => {
    const res = await api.put('/auth/profile', fields);
    if (res.data.success && res.data.user) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.data.message || 'Profile update failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('eventx_token');
    localStorage.removeItem('eventx_user');
  };

  const isRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        role: user?.role || 'guest',
        isRole,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
