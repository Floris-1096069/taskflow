import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import { useTagContext } from '../context/TagContext';
import getGlobalStyles from "../styles/globalStyles";

const TagSelector = ({ selectedTagIds, onTagsSelected }) => {
  const { tags, loading } = useTagContext();
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  const toggleTag = (tagId) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsSelected(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsSelected([...selectedTagIds, tagId]);
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={globalStyles.tagPickerContainer}>
      <Text style={globalStyles.subtitle}>Search Tags:</Text>
      <TextInput
        placeholder="Search tags..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={globalStyles.input}
      />
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View style={[globalStyles.tagListWrapper, { maxHeight: 120 }]}>
          <FlatList
            data={filteredTags}
            keyExtractor={(item) => item.tag_id.toString()}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  globalStyles.tagItem,
                  selectedTagIds.includes(item.tag_id) && globalStyles.selectedTagItem,
                ]}
                onPress={() => toggleTag(item.tag_id)}
              >
                <Text>{item.name}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={globalStyles.tagItem}>No tags found</Text>
            }
          />
        </View>
      )}
    </View>
  );
};

export default TagSelector;
