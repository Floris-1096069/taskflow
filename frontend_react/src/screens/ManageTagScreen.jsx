import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Pressable, useColorScheme } from 'react-native';
import {useAuthContext} from "../context/AuthContext";

import getGlobalStyles from '../styles/globalStyles';
import Header from '../components/Header';


export default function ManageTagScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const { fetchWithAuth } = useAuthContext();


  useEffect(() => {
    const fetchTags = async () => {
      const response = await fetchWithAuth('http://172.20.10.2:5000/api/task/tags');
      const data = await response.json();
      setTags(data);
    };
    fetchTags();
  }, []);

  const createTag = async () => {
    try {
      const response = await fetchWithAuth('http://172.20.10.2:5000/api/task/tags', {
        method: 'POST',
        body: JSON.stringify({ name: newTagName }),
      });
      if (response.ok) {
        setNewTagName('');
        const data = await response.json();
        setTags([...tags, data]);
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to create tag.");
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
      Alert.alert("Error", "Failed to create tag. Please try again.");
    }
  };

  return (
    <View style={[globalStyles.webContainer]}>
      <Header title="Manage Tags" navigation={navigation} />
      <View style={globalStyles.container}>
        <TextInput
          style={globalStyles.input}
          placeholder="New Tag Name"
          value={newTagName}
          onChangeText={setNewTagName}
        />
        <Button title="Add Tag" onPress={createTag} />
        <FlatList
          data={tags}
          keyExtractor={(item) => item.tag_id.toString()}
          renderItem={({ item }) => (
            <View style={globalStyles.tagItem}>
              <Text>{item.name}</Text>
            </View>
          )}
        />
        <Button
          title="Back to Task List"
          onPress={() => navigation.navigate('TaskList')}
        />
      </View>
    </View>
  );
}