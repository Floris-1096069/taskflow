import React, { useState } from 'react';
import { View, Text, TextInput, Picker, Pressable, Modal, useColorScheme, Alert } from 'react-native';

import getGlobalStyles from "../styles/globalStyles";
import { useAuthContext } from "../context/AuthContext";
import TagSelector from "./TagSelector";
import UserPicker from "./UserPicker";
import { Config } from '../config';

const ManageTask = ({ task, onUpdate, onDelete }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(editedTask.delegated_to);
  const { fetchWithAuth, user_id, getRole } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  if (!task) {
    return <Text>Task not found</Text>;
  }

  const role = getRole();
  const isAdminOrTeamleider = String(role) === '1' || String(role) === '2';

  // Handle both ID and object cases for created_by
  const taskCreatorId = typeof task.created_by === 'object' ? task.created_by.user_id : task.created_by;
  const isTaskCreator = String(taskCreatorId) === String(user_id);
  const canManageTask = isAdminOrTeamleider || isTaskCreator;
  console.log('User ID in ManageTask:', user_id);
  console.log('Task created_by:', task.created_by);
  console.log('Task object:', task);


  const handleTagsSelected = (selectedTagIds) => {
    setEditedTask({ ...editedTask, tag_ids: Array.isArray(selectedTagIds) ? selectedTagIds : [] });
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
    setEditedTask({ ...editedTask, delegated_to: userId });
  };

  const handleUpdateTask = async () => {
    if (!canManageTask) {
      Alert.alert('Error', 'You are not authorized to update this task.');
      return;
    }

    setIsUpdating(true);
    try {
      const { tags, task_id, ...taskData } = editedTask;
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/update/${editedTask.task_id}`, {
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
    if (!canManageTask) {
      Alert.alert('Error', 'You are not authorized to delete this task.');
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/delete/${task.task_id}`, {
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
            <Text>Change Task Priority</Text>
            <Picker
              selectedValue={editedTask.priority}
              onValueChange={(itemValue) => setEditedTask({ ...editedTask, priority: itemValue })}
            >
              <Picker.Item label="Low" value={1} />
              <Picker.Item label="Medium" value={2} />
              <Picker.Item label="High" value={3} />
            </Picker>

            <Text>Change Task Status</Text>
            <Picker
              selectedValue={editedTask.status_id}
              onValueChange={(itemValue) => setEditedTask({ ...editedTask, status_id: itemValue })}
            >
              <Picker.Item label="Todo" value={1} />
              <Picker.Item label="In Progress" value={2} />
              <Picker.Item label="Done" value={3} />
            </Picker>

            <Text>Change Delegated User</Text>
            <UserPicker
              onUserSelect={handleUserSelect}
              selectedUserId={selectedUserId}
            />

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
                    disabled={isUpdating || !canManageTask}
                  >
                    <Text style={globalStyles.buttonText}>{isUpdating ? 'Updating...' : 'Update'}</Text>
                  </Pressable>

                  <Pressable
                    style={[globalStyles.button, globalStyles.deleteButton]}
                    onPress={handleDeleteTask}
                    disabled={isDeleting || !canManageTask}
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
                  <Pressable onPress={confirmDelete} disabled={!canManageTask}>
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
