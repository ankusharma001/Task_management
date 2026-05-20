import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, getProfile as apiGetProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if token exists on load and fetch profile
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          
          // Re-verify and sync with backend
          const res = await apiGetProfile();
          if (res.success) {
            setUser(res.user || res.profile || res);
            localStorage.setItem('user', JSON.stringify(res.user || res.profile || res));
          }
        } catch (error) {
          console.error("Token verification failed", error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await apiLogin(credentials);
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        const userObj = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        };
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid email or password'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await apiRegister(userData);
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        const userObj = {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role
        };
        localStorage.setItem('user', JSON.stringify(userObj));
        setUser(userObj);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 
                 error.response?.data?.errors?.map(e => e.message).join(', ') ||
                 'Registration failed. Email might be in use.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
