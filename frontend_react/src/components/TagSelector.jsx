import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { useAuthContext } from "../context/AuthContext";
import getGlobalStyles from "../styles/globalStyles";

const TagSelector = ({ selectedTagIds, onTagsSelected }) => {
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchWithAuth } = useAuthContext();
  const globalStyles = getGlobalStyles();

  useEffect(() => {
    const fetchAllTags = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth('http://172.20.10.2:5000/api/task/tags');
        const data = await response.json();
        setAllTags(data);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTags();
  }, []);

  const toggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsSelected(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsSelected([...selectedTagIds, tagId]);
    }
  };

  return (
    <View style={globalStyles.tagPickerContainer}>
      <Text style={globalStyles.subtitle}>Select Tags:</Text>
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <FlatList
          data={allTags}
          keyExtractor={(item) => item.tag_id.toString()}
          renderItem={({ item }) => (
            <Pressable
              key={item.tag_id}
              style={[
                globalStyles.tagItem,
                selectedTagIds.includes(item.tag_id) && globalStyles.selectedTagItem,
              ]}
              onPress={() => toggleTag(item.tag_id)}
            >
              <Text>{item.name}</Text>
            </Pressable>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default TagSelector;
