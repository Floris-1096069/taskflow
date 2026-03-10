import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { useTagContext } from '../context/TagContext';
import getGlobalStyles from "../styles/globalStyles";

export default function TagManager({ onBack }) {
  const [newTag, setNewTag] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { tags, loading, createTag, deleteTag, fetchTags } = useTagContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  const handleCreateTag = async () => {
    if (!newTag.trim()) {
      setErrorMessage("Tag name cannot be empty.");
      return;
    }
    setErrorMessage('');
    try {
      await createTag(newTag);
      setNewTag("");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create tag. Please try again.");
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await deleteTag(tagId);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to delete tag. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={[globalStyles.title]}>
        Manage Tags
      </Text>
      <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
        Add new tag
      </Text>

      {errorMessage ? (
        <Text style={[globalStyles.errorText, { textAlign: 'center' }]}>
          {errorMessage}
        </Text>
      ) : null}

      <TextInput
        style={globalStyles.input}
        placeholder="New Tag Name"
        value={newTag}
        onChangeText={setNewTag}
      />

      <Pressable
        onPress={handleCreateTag}
        style={[globalStyles.button, { marginBottom: 10 }]}
      >
        <Text style={globalStyles.buttonText}>Add new tag</Text>
      </Pressable>

      {loading ? (
        <Text>Loading tags...</Text>
      ) : (
        <FlatList
          data={tags}
          keyExtractor={(item) => item.tag_id.toString()}
          renderItem={({ item }) => (
            <View style={globalStyles.tagItem}>
              <Text>{item.name}</Text>
              <TouchableOpacity
                style={globalStyles.deleteButton}
                onPress={() => handleDeleteTag(item.tag_id)}
              >
                <Text style={globalStyles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
