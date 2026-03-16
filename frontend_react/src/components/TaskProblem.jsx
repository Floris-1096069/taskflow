import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, useColorScheme, ActivityIndicator } from 'react-native';
import { useAuthContext } from "../context/AuthContext";
import getGlobalStyles from '../styles/globalStyles';
import { Config } from '../config';

const TaskProblem = ({ taskId, taskStatusId }) => {
  const { token, fetchWithAuth } = useAuthContext();
  const [problems, setProblems] = useState([]);
  const [newProblem, setNewProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  useEffect(() => {
    const fetchProblems = async () => {
      if (!token) {
        console.warn("Token not available");
        setLoading(false);
        return;
      }
      try {
        const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/task/${taskId}`);
        const data = await response.json();
        setProblems(data);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [taskId, token]);

  const handleSubmit = async () => {
    if (!newProblem.trim() || taskStatusId !== 4 || !token) return;

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: taskId, content: newProblem }),
      });
      if (response.ok) {
        setNewProblem("");
        const updatedResponse = await fetchWithAuth(`${Config.API_BASE_URL}/problem/task/${taskId}`);
        const updatedData = await updatedResponse.json();
        setProblems(updatedData);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit problem.");
      }
    } catch (error) {
      console.error("Failed to submit problem:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#0000ff" />;
  }

  if (!token) {
    return <Text>Please log in to report or view problems.</Text>;
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Reported Problems:</Text>
      <FlatList
        data={problems}
        keyExtractor={(item) => item.task_problem_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.problemItem}>
            <Text>
              <Text style={styles.username}>{item.user_id}</Text> ({new Date(item.creation_time).toLocaleString()}):
            </Text>
            <Text>{item.content}</Text>
          </View>
        )}
      />
      {taskStatusId === 4 && (
        <>
          <TextInput
            style={[globalStyles.input, styles.input]}
            value={newProblem}
            onChangeText={setNewProblem}
            placeholder="Describe the problem..."
            multiline
          />
          <Button
            title={isSubmitting ? "Submitting..." : "Submit Problem"}
            onPress={handleSubmit}
            disabled={isSubmitting || !newProblem.trim()}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  problemItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 5,
  },
  username: {
    fontWeight: 'bold',
  },
  input: {
    marginTop: 10,
  },
});

export default TaskProblem;
