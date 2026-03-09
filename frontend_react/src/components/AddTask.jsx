import React, { useState } from 'react';
import { View, Text, TextInput, Picker, Pressable, Modal, useColorScheme } from 'react-native';
import getGlobalStyles from "../styles/globalStyles";
import { useAuthContext } from "../context/AuthContext";

const AddTask = ({ visible, onClose, onTaskCreated }) => {
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    priority: 1,
    status_id: 1,
    delegated_to: null,
  });
  const { fetchWithAuth } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  const handleCreateTask = async () => {
    try {
      const response = await fetchWithAuth('http://172.20.10.2:5000/api/task/create', {
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
      onRequestClose={onClose}
    >
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
            onValueChange={(itemValue) => setNewTask({...newTask, priority: itemValue})}
          >
            <Picker.Item label="Low" value={1} />
            <Picker.Item label="Medium" value={2} />
            <Picker.Item label="High" value={3} />
          </Picker>
          <Picker
            selectedValue={newTask.status_id}
            onValueChange={(itemValue) => setNewTask({...newTask, status_id: itemValue})}
          >
            <Picker.Item label="Todo" value={1} />
            <Picker.Item label="In Progress" value={2} />
            <Picker.Item label="Done" value={3} />
          </Picker>
          <TextInput
            style={globalStyles.input}
            placeholder="Assigned To (User ID)"
            value={newTask.delegated_to}
            onChangeText={(text) => setNewTask({...newTask, delegated_to: text})}
            keyboardType="numeric"
          />
          <Pressable
            style={globalStyles.button}
            onPress={handleCreateTask}
          >
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
