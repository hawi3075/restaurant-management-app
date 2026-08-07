import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stored user and token when app starts up
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load storage auth', error);
      } finally {
        setLoading(false);
      }
    };
    loadStoredAuth();
  }, []);

  // Updated login function to accept token and user data directly from LoginScreen
  const login = async (jwtToken, userData) => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('token', jwtToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.error('Login state save error:', error);
      return { success: false, message: 'Failed to save authentication state' };
    }
  };

  // Legacy support if you call login with just email & password from somewhere else
  const loginWithCredentials = async (email, password) => {
    try {
      setLoading(true);
      const response = await API.post('/auth/login', { email, password });
      const { token: jwtToken, user: userData } = response.data;
      
      await AsyncStorage.setItem('token', jwtToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(jwtToken);
      setUser(userData);
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithCredentials, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};