import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [user_id, setUserId] = useState(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          setToken(token);
          setIsLoggedIn(true);
          try {
            const decodedToken = jwtDecode(token);
            setUsername(decodedToken.username || decodedToken.sub);
            setUserId(decodedToken.user_id || decodedToken.sub);
          } catch (error) {
            console.error('Failed to decode token:', error);

            await AsyncStorage.removeItem('token');
            setToken(null);
            setIsLoggedIn(false);
          }
        }
      } catch (error) {
        console.error('Failed to check token:', error);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  const getRole = () => {
    if (!token) return null;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.role;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    const currentToken = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }
    return fetch(url, { ...options, headers });
  };

  const login = async (newToken) => {
    try {
      await AsyncStorage.setItem('token', newToken);
      setToken(newToken);
      setIsLoggedIn(true);
      try {
        const decodedToken = jwtDecode(newToken);
        setUsername(decodedToken.username || decodedToken.sub);
        setUserId(decodedToken.user_id || decodedToken.sub);
      } catch (error) {
        console.error('Failed to decode token:', error);
        // Clear invalid token
        await AsyncStorage.removeItem('token');
        setToken(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  };

  const logout = async (navigation) => {
    try {
      const response = await fetchWithAuth('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed on the server');
      }

      await AsyncStorage.removeItem('token');
      setToken(null);
      setIsLoggedIn(false);
      setUsername(null);
      setUserId(null);

      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      console.error('Failed to logout:', error);
      await AsyncStorage.removeItem('token');
      setToken(null);
      setIsLoggedIn(false);
      setUsername(null);
      setUserId(null);

      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }
  };

  const authValue = {
    isLoggedIn,
    loading,
    token,
    username,
    user_id,
    getRole,
    login,
    logout,
    fetchWithAuth,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};
