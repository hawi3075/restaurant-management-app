import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved login data when the app starts
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);

          console.log('Stored user:', parsedUser);
          console.log('Stored role:', parsedUser?.role);

          // Only restore user if role exists
          if (parsedUser && parsedUser.role) {
            setUser(parsedUser);
          } else {
            // Invalid user data
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.log('Failed to load storage data:', error);

        // Clear corrupted storage
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // Login
  const login = async (token, userData) => {
    try {
      if (!token || !userData) {
        console.log('Login failed: token or user data is missing');
        return false;
      }

      console.log('Logging in user:', userData);
      console.log('User role:', userData.role);

      // Ensure saved user has a role (default to 'customer') so navigator can route correctly
      const userToSave = Object.assign({}, userData, { role: userData.role || 'customer' });

      // Save token
      await AsyncStorage.setItem('token', token);

      // Save user including role
      console.log('Saving user to storage:', JSON.stringify(userToSave, null, 2));
      await AsyncStorage.setItem('user', JSON.stringify(userToSave));

      // Update React state
      // This automatically makes App.js show
      // the correct role-based dashboard
      setUser(userToSave);

      return true;
    } catch (error) {
      console.log('Login saving error:', error);
      return false;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      setUser(null);

      console.log('User logged out successfully');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
