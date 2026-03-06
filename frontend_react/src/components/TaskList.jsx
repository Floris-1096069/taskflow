import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Picker, Pressable, ActivityIndicator, useColorScheme } from 'react-native';
import getGlobalStyles from "../styles/globalStyles";
import {useAuthContext} from "../context/AuthContext";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    archived: false,
    priority: null,
    delegated_to: null,
    status_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchWithAuth } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

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

  useEffect(() => {
    fetchTasks();
  }, [filters]);

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
        <Pressable title="Retry" onPress={fetchTasks} />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>

      <View style={globalStyles.filterContainer}>

        <Picker
          selectedValue={filters.priority}
          onValueChange={(itemValue) => setFilters({...filters, priority: itemValue})}>
          <Picker.Item label="Any Priority" value={null} />
          <Picker.Item label="Low" value={1} />
          <Picker.Item label="Medium" value={2} />
          <Picker.Item label="High" value={3} />
        </Picker>

        <Pressable style={globalStyles.button} title="Apply Filters" onPress={fetchTasks}>
          <Text style={globalStyles.buttonText}> Apply Filters</Text>
        </Pressable>

      </View>

      {loading && tasks.length > 0 ? (
        <ActivityIndicator size="small" color="#0000ff" style={globalStyles.refreshIndicator} />
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        renderItem={({ item }) => (
          <View style={globalStyles.taskItem}>
            <Text>{item.name}</Text>
            <Text>Priority: {item.priority}</Text>
            <Text>Status: {item.status_id}</Text>
            <Text>Assigned to: {item.delegated_to}</Text>
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