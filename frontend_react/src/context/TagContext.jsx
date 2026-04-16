import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuthContext } from './AuthContext';
import { Config } from '../config';

const TagContext = createContext();

export const TagProvider = ({ children }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchWithAuth } = useAuthContext();

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/api/task/tags`);
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <TagContext.Provider value={{ tags, loading, fetchTags }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => useContext(TagContext);