import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stored user & token when app starts
    const loadStorageData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        
        if (token && storedUser) {
          setUser(JSON.parse(storedUser)); // <-- This populates the user state with the role!
        }
      } catch (error) {
        console.log('Failed to load storage data', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // CRITICAL: This login function must update state so App.js instantly reacts!
  const login = async (token, userData) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData); // <-- Updates React state, telling App.js to switch navigation stacks
    } catch (error) {
      console.log('Login saving error:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null); // <-- Clears state on logout
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};