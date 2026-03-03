import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedRole = await AsyncStorage.getItem('role');
        setIsLoggedIn(!!token);
        setUserId(storedUserId);
        setRole(storedRole);
      } catch (error) {
        console.error('Failed to check token:', error);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const login = async (token, userId, role) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', userId.toString());
      await AsyncStorage.setItem('role', role);
      setIsLoggedIn(true);
      setUserId(userId);
      setRole(role);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  };

  const logout = async (navigation) => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('role');
      setIsLoggedIn(false);
      setUserId(null);
      setRole(null);
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Login'}],
        });
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return { isLoggedIn, loading, login, logout, userId, role };
}