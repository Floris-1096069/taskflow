import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert, TouchableOpacity, Pressable } from 'react-native';
import { useAuthContext } from "../context/AuthContext";
import { useColorScheme } from 'react-native';
import getGlobalStyles from "../styles/globalStyles";

export default function TagManager({ onBack }) {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const { fetchWithAuth } = useAuthContext();
    const colorScheme = useColorScheme();
    const globalStyles = getGlobalStyles(colorScheme);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetchWithAuth('http://172.20.10.2:5000/api/task/tags');
                const data = await response.json();
                setTags(data);
            } catch (error) {
                console.error("Failed to get tags", error);
                Alert.alert("Failed to fetch tags, try again later");
            }
        };
        fetchTags();
    }, []);

    const createTag = async () => {
        if (!newTag.trim()) {
        setErrorMessage("Tag name cannot be empty.");
        return;
    }
    setErrorMessage('');

        try {
            const response = await fetchWithAuth('http://172.20.10.2:5000/api/task/tags', {
                method: 'POST',
                body: JSON.stringify({ name: newTag }),
            });
            if (response.ok) {
                setNewTag("");
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

    const deleteTag = async (tagId) => {
        try {
            const response = await fetchWithAuth(`http://172.20.10.2:5000/api/task/tags/${tagId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setTags(tags.filter(tag => tag.tag_id !== tagId));
            } else {
                const errorData = await response.json();
                Alert.alert("Error", errorData.error || "Failed to delete tag.");
            }
        } catch (error) {
            console.error("Failed to delete tag:", error);
            Alert.alert("Error", "Failed to delete tag. Please try again.");
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
                onPress={createTag}
                style={[globalStyles.button, { marginBottom: 10 }]}
            >
                <Text style={globalStyles.buttonText}>Add new tag</Text>
            </Pressable>

            <FlatList
                data={tags}
                keyExtractor={(item) => item.tag_id.toString()}
                renderItem={({ item }) => (

            <View style={globalStyles.tagItem}>

                <Text>{item.name}</Text>

                <TouchableOpacity
                    style={globalStyles.deleteButton}
                    onPress={() => deleteTag(item.tag_id)}
                >

                    <Text style={globalStyles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
                )}
            />
        </View>
    );
}