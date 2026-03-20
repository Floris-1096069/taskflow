import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, useColorScheme } from 'react-native';
import { useAuthContext } from "../context/AuthContext";
import getGlobalStyles from '../styles/globalStyles';
import { Config } from '../config';
import ManageTask from './ManageTask';

const UndelegatedTasks = () => {
  const { fetchWithAuth, getRole } = useAuthContext();
  const colorScheme = useColorScheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const globalStyles = getGlobalStyles(useColorScheme);

  const role = getRole();
  const isAdminOrTeamleider = String(role) === '1' || String(role) === '2';

  const fetchUndelegatedTasks = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/undelegated`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminOrTeamleider) {
      fetchUndelegatedTasks();
    }
  }, []);

  if (!isAdminOrTeamleider) {
    return <Text>You are not authorized to view undelegated tasks.</Text>;
  }

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Undelegated Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        contentContainerStyle={{ backgroundColor: globalStyles.container.backgroundColor }}
        renderItem={({ item }) => (
          <ManageTask
            task={item}
            onUpdate={fetchUndelegatedTasks}
            onDelete={fetchUndelegatedTasks}
          />
        )}
        ListEmptyComponent={
          <Text style={globalStyles.emptyText}>No undelegated tasks found.</Text>
        }
      />
    </View>
  );
};

export default UndelegatedTasks;
