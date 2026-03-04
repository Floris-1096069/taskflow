import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Picker, Button, ActivityIndicator } from 'react-native';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Button title="Retry" onPress={fetchTasks} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={filters.priority}
          onValueChange={(itemValue) => setFilters({...filters, priority: itemValue})}>
          <Picker.Item label="Any Priority" value={null} />
          <Picker.Item label="Low" value={1} />
          <Picker.Item label="Medium" value={2} />
          <Picker.Item label="High" value={3} />
        </Picker>
        <Button title="Apply Filters" onPress={fetchTasks} />
      </View>

      {loading && tasks.length > 0 ? (
        <ActivityIndicator size="small" color="#0000ff" style={styles.refreshIndicator} />
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text>{item.name}</Text>
            <Text>Priority: {item.priority}</Text>
            <Text>Status: {item.status_id}</Text>
            <Text>Assigned to: {item.delegated_to}</Text>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text>No tasks found.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filterContainer: { marginBottom: 16 },
  taskItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 16 },
  refreshIndicator: { marginVertical: 8 },
  emptyContainer: { padding: 16, alignItems: 'center' },
});

export default TaskList;