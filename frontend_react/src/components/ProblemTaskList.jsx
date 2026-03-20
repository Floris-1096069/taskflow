import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, useColorScheme } from 'react-native';
import { useAuthContext } from "../context/AuthContext";
import getGlobalStyles from '../styles/globalStyles';
import { Config } from '../config';
import ManageTask from './ManageTask';

const ProblemTasks = () => {
  const { fetchWithAuth, getRole, user_id } = useAuthContext();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  const role = getRole();
  const isAdminOrTeamleider = String(role) === '1' || String(role) === '2';

  const fetchProblemTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/problems`);
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
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/user/all`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const getUsername = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.username : 'Unknown';
  };

  useEffect(() => {
    if (isAdminOrTeamleider) {
      fetchProblemTasks();
      fetchUsers();
    }
  }, []);

  if (!isAdminOrTeamleider) {
    return <Text>You are not authorized to view problem tasks.</Text>;
  }

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading problem tasks...</Text>
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
    <View style={globalStyles.webContainer}>
      <Text style={globalStyles.title}>Problem Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        renderItem={({ item }) => {
          const taskCreatorId = typeof item.created_by === 'object' ? item.created_by.user_id : item.created_by;
          const isTaskCreator = String(taskCreatorId) === String(user_id);
          const canManageTask = isAdminOrTeamleider || isTaskCreator;

          return (
            <View style={[globalStyles.taskItem, { backgroundColor: globalStyles.container.backgroundColor }]}>
              <Text style={globalStyles.taskName}>{item.name}</Text>
              <Text style={globalStyles.bodyText}>Status: Problem</Text>
              <Text style={globalStyles.bodyText}>Assigned to: {getUsername(item.delegated_to)}</Text>
              <Text style={globalStyles.bodyText}>Created by: {getUsername(item.created_by)}</Text>
              <Text style={globalStyles.bodyText}>Creation time: {new Date(item.creation_time).toLocaleString()}</Text>
              <View style={{ marginVertical: 10 }} />
              <Text style={[globalStyles.bodyText, { fontWeight: 'bold' }]}>Problems:</Text>
              {item.problems && item.problems.length > 0 ? (
                item.problems.map((problem) => (
                  <View key={problem.task_problem_id} style={[globalStyles.problemItem, { backgroundColor: globalStyles.container.backgroundColor }]}>
                    <Text style={globalStyles.bodyText}>{problem.content}</Text>
                    <Text style={globalStyles.bodyText}>Reported by: {getUsername(problem.user_id)}</Text>
                    <Text style={globalStyles.bodyText}>Reported at: {new Date(problem.creation_time).toLocaleString()}</Text>
                  </View>
                ))
              ) : (
                <Text style={globalStyles.bodyText}>No problems reported.</Text>
              )}
              {canManageTask && (
                <ManageTask
                  task={item}
                  onUpdate={() => fetchProblemTasks()}
                  onDelete={(taskId) => {
                    setTasks(tasks.filter(t => t.task_id !== taskId));
                    fetchProblemTasks();
                  }}
                />
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Text style={globalStyles.bodyText}>No problematic tasks reported.</Text>
          </View>
        }
      />
    </View>
  );
};

export default ProblemTasks;
