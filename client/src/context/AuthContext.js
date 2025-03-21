import React, { createContext, useState, useContext, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/users/register', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
      }
      
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/users/login', userData);
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
      }
      
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid credentials');
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.get('/api/users/logout');
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still remove token and user even if API call fails
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Check if user is logged in
  const checkUserLoggedIn = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Set auth token header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const res = await axios.get('/api/users/me');
      
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check error:', err);
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        checkUserLoggedIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 