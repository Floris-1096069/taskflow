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
  const globalStyles = getGlobalStyles(colorScheme);

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
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.errorContainer}>
        <Text style={globalStyles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={[globalStyles.container, { flex: 1 }]}>
      <Text style={globalStyles.title}>Undelegated Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        contentContainerStyle={{ flexGrow: 1, backgroundColor: globalStyles.container.backgroundColor }}
        renderItem={({ item }) => (
          <ManageTask
            task={item}
            onUpdate={fetchUndelegatedTasks}
            onDelete={fetchUndelegatedTasks}
          />
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: globalStyles.container.backgroundColor }}>
            <Text style={globalStyles.bodyText}>No undelegated tasks found.</Text>
          </View>
        }
      />
    </View>
  );
};

export default UndelegatedTasks;
