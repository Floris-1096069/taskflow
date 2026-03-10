import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useTagContext } from '../context/TagContext';
import getGlobalStyles from "../styles/globalStyles";

const TagSelector = ({ selectedTagIds, onTagsSelected }) => {
  const { tags, loading } = useTagContext();
  const globalStyles = getGlobalStyles();

  const toggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsSelected(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsSelected([...selectedTagIds, tagId]);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" />;
  }

  return (
    <View style={globalStyles.tagPickerContainer}>
      <Text style={globalStyles.subtitle}>Select Tags:</Text>
      <FlatList
        data={tags}
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
    </View>
  );
};

export default TagSelector;
