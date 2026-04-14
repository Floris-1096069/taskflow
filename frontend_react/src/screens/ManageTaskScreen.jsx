import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Picker,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import getGlobalStyles from "../styles/globalStyles";
import { useAuthContext } from "../context/AuthContext";
import TagSelector from "../components/TagSelector";
import UserPicker from "../components/UserPicker";
import { Config } from '../config';

const ManageTaskScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { task } = route.params;
  const [editedTask, setEditedTask] = useState({
    ...task,
    tag_ids: Array.isArray(task.tag_ids) ? task.tag_ids : [],
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(editedTask.delegated_to);
  const [problems, setProblems] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  const [newProblemContent, setNewProblemContent] = useState("");
  const { fetchWithAuth, user_id, getRole } = useAuthContext();
  const globalStyles = getGlobalStyles();



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
    fetchProblems();
  }, []);

  const handleTagsSelected = (selectedTagIds) => {
    setEditedTask({ ...editedTask, tag_ids: selectedTagIds });
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
      const { task_id, ...taskData } = editedTask;
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/update/${task_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) throw new Error('Failed to update task');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!canManageTask) {
      Alert.alert('Error', 'You are not authorized to delete this task.');
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/delete/${task.task_id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddProblem = async () => {
    if (!newProblemContent.trim()) return;
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/add`, {
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
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
        {isAdminOrTeamleider &&(
          <>

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
        </>
      )}

        <Text style={globalStyles.subtitle}>Reactions:</Text>
        <FlatList
          data={problems}
          keyExtractor={(item) => item.task_problem_id.toString()}
          renderItem={({ item }) => (
            <View style={globalStyles.problemItem}>
              <Text>{item.content}</Text>
              {isAdminOrTeamleider &&(
              <>
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
              </>)}
            </View>
          )}
        />

        <TextInput
          style={globalStyles.input}
          placeholder="Add Reaction"
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
              <Text style={globalStyles.buttonText}>Add Reaction</Text>
            </Pressable>
          )}
        </View>

        <View style={[globalStyles.row, { marginTop: 20, justifyContent: 'space-between' }]}>
          <Pressable
            style={[globalStyles.button, { flex: 1, marginRight: 5 }]}
            onPress={handleUpdateTask}
            disabled={isUpdating || !canManageTask}
          >
            <Text style={globalStyles.buttonText}>{isUpdating ? 'Updating...' : 'Update'}</Text>
          </Pressable>
          {isAdminOrTeamleider &&(
          <Pressable
            style={[globalStyles.button, globalStyles.deleteButton, { flex: 1, marginLeft: 5 }]}
            onPress={handleDeleteTask}
            disabled={isDeleting || !canManageTask}
          >
            <Text style={globalStyles.buttonText}>Delete</Text>
          </Pressable>
              )}
        </View>

        <Pressable
          style={[globalStyles.button, { marginTop: 10 }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ManageTaskScreen;