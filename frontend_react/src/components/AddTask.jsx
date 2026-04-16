import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Picker, Pressable, Modal, useColorScheme, ActivityIndicator } from 'react-native';

import getGlobalStyles from "../styles/globalStyles";
import { useAuthContext } from "../context/AuthContext";
import TagSelector from "./TagSelector";
import UserPicker from "./UserPicker";
import { Config } from '../config';

const AddTask = ({ visible, onClose, onTaskCreated }) => {
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 1,
    status_id: 1,
    delegated_to: null,
    tag_ids: [],
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { fetchWithAuth, getRole } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  const role = getRole();
  const isAuthorized = String(role) === '1' || String(role) === '2';

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);

      try {
        const response = await fetchWithAuth(`${Config.API_BASE_URL}/user/all`);
        const data = await response.json();
        setUsers(data);

      } catch (error) {
        console.error('Error fetching users:', error);

      } finally {
        setLoadingUsers(false);
      }
    };
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  const handleCreateTask = async () => {
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/api/task/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) throw new Error('Failed to create task');
      const createdTask = await response.json();
      onTaskCreated(createdTask);
      setNewTask({
        name: '',
        description: '',
        priority: 1,
        status_id: 1,
        delegated_to: null,
        tag_ids: [],
      });
      onClose();

    } catch (error) {
      console.error('Error creating task:', error);
      alert(error.message);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>

      <View style={globalStyles.modalContainer}>
        <View style={globalStyles.container}>
          <Text style={globalStyles.title}>Create New Task</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Task Name"
              value={newTask.name}
              onChangeText={(text) => setNewTask({...newTask, name: text})}
            />

            <TextInput
              style={globalStyles.input}
              placeholder="Description"
              value={newTask.description}
              onChangeText={(text) => setNewTask({...newTask, description: text})}
            />

            <Picker
              selectedValue={newTask.priority}
              onValueChange={(itemValue) => setNewTask({...newTask, priority: itemValue})}>

              <Picker.Item label="Low" value={1} />
              <Picker.Item label="Medium" value={2} />
              <Picker.Item label="High" value={3} />
            </Picker>

          {isAuthorized ? (
              loadingUsers ? (
                <ActivityIndicator size="small" />
              ) : (
                <UserPicker
                  users={users}
                  onUserSelect={(userId) => setNewTask({ ...newTask, delegated_to: userId })}
                  selectedUserId={newTask.delegated_to}
                />
              )
            ) : null}

          <TagSelector
            selectedTagIds={newTask.tag_ids}
            onTagsSelected={(tagIds) => setNewTask({...newTask, tag_ids: tagIds})}
          />

          <Pressable
            style={globalStyles.button}
            onPress={handleCreateTask}>

            <Text style={globalStyles.buttonText}>Create Task</Text>

          </Pressable>
          <Pressable
            style={globalStyles.button}
            onPress={onClose}
          >
            <Text style={globalStyles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default AddTask;
