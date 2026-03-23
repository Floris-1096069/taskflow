import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Picker,
  Pressable,
  Modal,
  useColorScheme,
  Alert,
  FlatList,
  ScrollView, KeyboardAvoidingView
} from 'react-native';
import { Platform } from 'react-native';
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
  const [problems, setProblems] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  const [newProblemContent, setNewProblemContent] = useState("");
  const { fetchWithAuth, user_id, getRole } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  if (!task) {
    return <Text>Task not found</Text>;
  }

  const role = getRole();
  const isAdminOrTeamleider = String(role) === '1' || String(role) === '2';

  const taskCreatorId = typeof task.created_by === 'object' ? task.created_by.user_id : task.created_by;
  const isTaskCreator = String(taskCreatorId) === String(user_id);
  const canManageTask = isAdminOrTeamleider || isTaskCreator;

  const fetchProblems = async () => {
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/task/${task.task_id}`);
      const data = await response.json();
      setProblems(data);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      fetchProblems();
    }
  }, [modalVisible]);

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

  const handleAddProblem = async () => {
    if (!newProblemContent.trim()) return;

    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: task.task_id,
          content: newProblemContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to add problem');

      setNewProblemContent("");
      fetchProblems();
      Alert.alert('Success', 'Problem added successfully.');

    } catch (error) {
      console.error('Error adding problem:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleEditProblem = (problem) => {
    setEditingProblem(problem);
    setNewProblemContent(problem.content);
  };

  const handleUpdateProblem = async () => {
    if (!editingProblem || !newProblemContent.trim()) return;

    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/update/${editingProblem.task_problem_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newProblemContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to update problem');

      setEditingProblem(null);
      setNewProblemContent("");
      fetchProblems();
      Alert.alert('Success', 'Problem updated successfully.');

    } catch (error) {
      console.error('Error updating problem:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/delete/${problemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete problem');

      fetchProblems();
      Alert.alert('Success', 'Problem deleted successfully.');

    } catch (error) {
      console.error('Error deleting problem:', error);
      Alert.alert('Error', error.message);
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%', maxHeight: '90%' }}
          >
            <ScrollView
              contentContainerStyle={{
                padding: 20,
                backgroundColor: 'white',
                borderRadius: 10,
                maxHeight: '90%',
                width: '90%',
                alignSelf: 'center',
              }}
            >
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
                multiline
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
                <Picker.Item label="Problem" value={4} />
              </Picker>

              <Text>Change Delegated User</Text>
              <UserPicker
                onUserSelect={handleUserSelect}
                selectedUserId={selectedUserId}
              />

              <View style={{ marginVertical: 10 }}>
                <Text style={globalStyles.subtitle}>Tags:</Text>
                <View style={globalStyles.tagPickerContainer}>
                  <TagSelector
                    selectedTagIds={editedTask.tag_ids || []}
                    onTagsSelected={handleTagsSelected}
                  />
                </View>
              </View>

              <Text style={globalStyles.subtitle}>Problems:</Text>
              <FlatList
                data={problems}
                keyExtractor={(item) => item.task_problem_id.toString()}
                renderItem={({ item }) => (
                  <View style={globalStyles.problemItem}>
                    <Text>{item.content}</Text>
                    <View style={[globalStyles.row, { marginTop: 5 }]}>
                      <Pressable
                        style={[globalStyles.smallButton, globalStyles.warningButton]}
                        onPress={() => handleEditProblem(item)}
                      >
                        <Text style={globalStyles.buttonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={[globalStyles.smallButton, globalStyles.errorButton]}
                        onPress={() => handleDeleteProblem(item.task_problem_id)}
                      >
                        <Text style={globalStyles.buttonText}>Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />

              <TextInput
                style={globalStyles.input}
                placeholder="Add/Edit Problem"
                value={newProblemContent}
                onChangeText={setNewProblemContent}
                multiline
              />

              <View style={[globalStyles.row, { marginTop: 10 }]}>
                {editingProblem ? (
                  <>
                    <Pressable
                      style={[globalStyles.button, globalStyles.successButton, { flex: 1, marginRight: 5 }]}
                      onPress={handleUpdateProblem}
                    >
                      <Text style={globalStyles.buttonText}>Update Problem</Text>
                    </Pressable>
                    <Pressable
                      style={[globalStyles.button, globalStyles.grayButton, { flex: 1, marginLeft: 5 }]}
                      onPress={() => {
                        setEditingProblem(null);
                        setNewProblemContent("");
                      }}
                    >
                      <Text style={globalStyles.buttonText}>Cancel</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={[globalStyles.button, globalStyles.successButton, { flex: 1 }]}
                    onPress={handleAddProblem}
                  >
                    <Text style={globalStyles.buttonText}>Add Problem</Text>
                  </Pressable>
                )}
              </View>

              <View style={[globalStyles.row, { marginTop: 20, justifyContent: 'space-between' }]}>
                {!showDeleteConfirm ? (
                  <>
                    <Pressable
                      style={[globalStyles.button, { flex: 1, marginRight: 5 }]}
                      onPress={handleUpdateTask}
                      disabled={isUpdating || !canManageTask}
                    >
                      <Text style={globalStyles.buttonText}>{isUpdating ? 'Updating...' : 'Update'}</Text>
                    </Pressable>

                    <Pressable
                      style={[globalStyles.button, globalStyles.deleteButton, { flex: 1, marginLeft: 5 }]}
                      onPress={handleDeleteTask}
                      disabled={isDeleting || !canManageTask}
                    >
                      <Text style={globalStyles.buttonText}>Delete</Text>
                    </Pressable>
                  </>
                ) : (
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text>Are you sure you want to delete this task?</Text>
                    <View style={[globalStyles.row, { marginTop: 10 }]}>
                      <Pressable onPress={() => setShowDeleteConfirm(false)}>
                        <Text>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={{ marginLeft: 20 }}
                        onPress={confirmDelete}
                        disabled={!canManageTask}
                      >
                        <Text>Confirm Delete</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>

              <Pressable
                style={[globalStyles.button, { marginTop: 10 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={globalStyles.buttonText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

export default ManageTask;
