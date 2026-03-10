import React, { useState } from 'react';
import { View, Text, TextInput, Picker, Pressable, Modal, useColorScheme, Alert } from 'react-native';
import getGlobalStyles from "../styles/globalStyles";
import { useAuthContext } from "../context/AuthContext";
import TagSelector from "./TagSelector";

const ManageTask = ({ task, onUpdate, onDelete }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { fetchWithAuth } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  if (!task) {
    return <Text>Task not found</Text>;
  }

  const handleTagsSelected = (selectedTagIds) => {
    setEditedTask({ ...editedTask, tag_ids: Array.isArray(selectedTagIds) ? selectedTagIds : [] });
  };

  const handleUpdateTask = async () => {
    setIsUpdating(true);
    try {
      const { tags, task_id, ...taskData } = editedTask;
      console.log("Sending tag_ids:", taskData.tag_ids);
      const response = await fetchWithAuth(`http://172.20.10.2:5000/api/task/update/${editedTask.task_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      onUpdate(updatedTask);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`http://172.20.10.2:5000/api/task/delete/${task.task_id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      onDelete(task.task_id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View>
      <Pressable
        style={globalStyles.button}
        onPress={() => {
          setEditedTask({
            ...task,
            tag_ids: Array.isArray(task.tag_ids) ? task.tag_ids : [],
          });
          setModalVisible(true);
        }}
      >
        <Text style={globalStyles.buttonText}>Manage</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={globalStyles.modalContainer}>
          <View style={globalStyles.modalContent}>
            <Text style={globalStyles.modalTitle}>Edit Task</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Task Name"
              value={editedTask.name}
              onChangeText={(text) => setEditedTask({ ...editedTask, name: text })}
            />
            <TextInput
              style={globalStyles.input}
              placeholder="Description"
              value={editedTask.description}
              onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
            />
            <Picker
              selectedValue={editedTask.priority}
              onValueChange={(itemValue) => setEditedTask({ ...editedTask, priority: itemValue })}
            >
              <Picker.Item label="Low" value={1} />
              <Picker.Item label="Medium" value={2} />
              <Picker.Item label="High" value={3} />
            </Picker>

            {/* Status Picker */}
            <Picker
              selectedValue={editedTask.status_id}
              onValueChange={(itemValue) => setEditedTask({ ...editedTask, status_id: itemValue })}
            >
              <Picker.Item label="Todo" value={1} />
              <Picker.Item label="In Progress" value={2} />
              <Picker.Item label="Done" value={3} />
            </Picker>

            <TagSelector
              selectedTagIds={editedTask.tag_ids || []}
              onTagsSelected={handleTagsSelected}
            />

            <View style={globalStyles.modalButtonContainer}>
              {!showDeleteConfirm ? (
                <>
                  <Pressable
                    style={globalStyles.button}
                    onPress={handleUpdateTask}
                    disabled={isUpdating}
                  >
                    <Text style={globalStyles.buttonText}>{isUpdating ? 'Updating...' : 'Update'}</Text>
                  </Pressable>
                  <Pressable
                    style={[globalStyles.button, globalStyles.deleteButton]}
                    onPress={handleDeleteTask}
                    disabled={isDeleting}
                  >
                    <Text style={globalStyles.buttonText}>Delete</Text>
                  </Pressable>
                </>
              ) : (
                <View style={globalStyles.confirmModal}>
                  <Text>Are you sure you want to delete this task?</Text>
                  <Pressable onPress={() => setShowDeleteConfirm(false)}>
                    <Text>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={confirmDelete}>
                    <Text>Confirm Delete</Text>
                  </Pressable>
                </View>
              )}
              <Pressable
                style={globalStyles.button}
                onPress={() => setModalVisible(false)}
              >
                <Text style={globalStyles.buttonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageTask;
