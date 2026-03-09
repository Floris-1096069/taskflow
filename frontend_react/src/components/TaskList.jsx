import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Picker, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import getGlobalStyles from "../styles/globalStyles";
import { useAuthContext } from "../context/AuthContext";
import AddTask from './AddTask';
import ManageTask from './ManageTask';

const TaskList = ()=> {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({
    archived: false,
    priority: null,
    delegated_to: null,
    status_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchWithAuth, getRole } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  const [modalVisible, setModalVisible] = useState(false);

  const role = getRole();
  const isAuthorized = String(role) === '1' || String(role) === '2';

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          query.append(key, value);
        }
      });
      const response = await fetchWithAuth(`http://172.20.10.2:5000/api/task/filtered?${query.toString()}`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await fetchWithAuth('http://172.20.10.2:5000/api/user/all');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStatuses = async () => {
    setStatusesLoading(true);
    try {
      const response = await fetchWithAuth('http://172.20.10.2:5000/api/task/status');
      const data = await response.json();
      setStatuses(data);
    } catch (err) {
      console.error('Error fetching statuses:', err);
    } finally {
      setStatusesLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchStatuses();
  }, [filters]);

  const getUsername = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.username : 'Unknown';
  };

  const getStatusName = (statusId) => {
    const status = statuses.find(s => s.status_id === statusId);
    return status ? status.name : 'Unknown';
  };

  if (loading && tasks.length === 0) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.errorContainer}>
        <Text style={globalStyles.errorText}>Error: {error}</Text>
        <Pressable onPress={fetchTasks}>
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={globalStyles.filterContainer}>
        <Text style={[globalStyles.title]}>
          To Do List
        </Text>

        <Pressable
          style={globalStyles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={globalStyles.buttonText}>Create New Task</Text>
        </Pressable>

        <Picker
          selectedValue={filters.priority !== null ? filters.priority : undefined}
          onValueChange={(itemValue) => setFilters({ ...filters, priority: itemValue })}
        >
          <Picker.Item label="Any Priority" value={undefined} />
          <Picker.Item label="Low" value={1} />
          <Picker.Item label="Medium" value={2} />
          <Picker.Item label="High" value={3} />
        </Picker>

        <Pressable style={globalStyles.button} onPress={fetchTasks}>
          <Text style={globalStyles.buttonText}>Apply Filters</Text>
        </Pressable>
      </View>

      <AddTask
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onTaskCreated={(newTask) => {
          setTasks([...tasks, newTask]);
        }}
      />

      {loading && tasks.length > 0 ? (
        <ActivityIndicator size="small" color="#0000ff" style={globalStyles.refreshIndicator} />
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        renderItem={({ item }) => (
          <View style={globalStyles.taskItem}>
            <Text style={globalStyles.taskName}>{item.name}</Text>
            <Text>Description: {item.description}</Text>
            <Text>Priority: {item.priority}</Text>
            <Text>Status: {getStatusName(item.status_id)}</Text>
            <Text>Assigned to: {getUsername(item.delegated_to)}</Text>
            <Text>Created by: {getUsername(item.created_by)}</Text>
            <Text>Creation time: {new Date(item.creation_time).toLocaleString()}</Text>
            <View style={globalStyles.tagsContainer}>
            <Text>Tags: </Text>
              {item.tags && item.tags.length > 0 ? (
                item.tags.map((tag) => (
              <View key={tag.tag_id} style={globalStyles.tag}>
                <Text>{tag.name}</Text>
              </View>
          ))
        ) : (
          <Text>No tags</Text>
        )}
      </View>
            {isAuthorized && (
            <ManageTask
              task={item}
              onUpdate={(updatedTask) => {
                setTasks(tasks.map(t => t.task_id === updatedTask.task_id ? updatedTask : t));
              }}
              onDelete={(taskId) => {
                setTasks(tasks.filter(t => t.task_id !== taskId));
              }}
              isAdmin={role === 'Admin'}
            />
                )}
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={globalStyles.emptyContainer}>
              <Text>No tasks found.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default TaskList;
