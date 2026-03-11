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
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/tags`);
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (name) => {
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (response.ok) {
        const data = await response.json();
        setTags([...tags, data]);
        return data;
      } else {
        throw new Error("Failed to create tag");
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
      throw error;
    }
  };

  const deleteTag = async (tagId) => {
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/tags/${tagId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTags(tags.filter(tag => tag.tag_id !== tagId));
      } else {
        throw new Error("Failed to delete tag");
      }
    } catch (error) {
      console.error("Failed to delete tag:", error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <TagContext.Provider value={{ tags, loading, fetchTags, createTag, deleteTag }}>
      {children}
    </TagContext.Provider>
  );
};

export const useTagContext = () => useContext(TagContext);