import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Picker, Pressable, ActivityIndicator, useColorScheme, Modal, TextInput, Button, Switch } from 'react-native';
import getGlobalStyles from "../styles/globalStyles";
import { useAuthContext } from "../context/AuthContext";
import AddTask from './AddTask';
import ManageTask from './ManageTask';
import TagSelector from './TagSelector';
import { Config } from '../config';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({
    archived: false,
    priority: undefined,
    delegated_to: null,
    status_id: null,
    tag_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchWithAuth, getRole, user_id } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  const [modalVisible, setModalVisible] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [problemModalVisible, setProblemModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newProblem, setNewProblem] = useState("");
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);

  const role = getRole();
  const isAuthorized = String(role) === '1' || String(role) === '2';

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      const delegatedTo = showAllTasks && isAuthorized ? null : user_id;
      const updatedFilters = { ...filters, delegated_to: delegatedTo };

      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
          if (key !== 'priority' || value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(id => query.append(key, id));
            } else {
              query.append(key, value);
            }
          }
        }
      });

      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/filtered?${query.toString()}`);
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

  const fetchStatuses = async () => {
    setStatusesLoading(true);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/status`);
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
  }, [filters, showAllTasks]);

  const getUsername = (userId) => {
    const user = users.find(u => u.user_id === userId);
    return user ? user.username : 'Unknown';
  };

  const getStatusName = (statusId) => {
    const status = statuses.find(s => s.status_id === statusId);
    return status ? status.name : 'Unknown';
  };

  const handleReportProblem = (task) => {
    setSelectedTask(task);
    setProblemModalVisible(true);
  };

  const updateTaskStatus = async (taskId, newStatusId) => {
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/update/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status_id: newStatusId }),
      });
      if (!response.ok) throw new Error('Failed to update task status');
      return true;
    } catch (error) {
      console.error("Failed to update task status:", error);
      return false;
    }
  };

  const getPriorityName = (priorityId) => {
    const priorityMap = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
    };
    return priorityMap[priorityId] || 'Unknown';
  };

  const submitProblem = async () => {
    if (!newProblem.trim() || !selectedTask) return;

    setIsSubmittingProblem(true);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ task_id: selectedTask.task_id, content: newProblem }),
      });

      if (response.ok) {
        setNewProblem("");
        setProblemModalVisible(false);
        fetchTasks();
        alert("Problem reported and task status updated to 'Problem'!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to report problem.");
      }
    } catch (error) {
      console.error("Failed to report problem:", error);
    } finally {
      setIsSubmittingProblem(false);
    }
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

        {isAuthorized && (
          <View style={globalStyles.filterRow}>
            <Text style={globalStyles.filterLabel}>Show:</Text>
            <Switch
              value={showAllTasks}
              onValueChange={setShowAllTasks}
            />
            <Text>{showAllTasks ? "All Tasks" : "My Tasks"}</Text>
          </View>
        )}

        <Pressable
          style={globalStyles.button}
          onPress={() => setModalVisible(true)}
        >
          <Text style={globalStyles.buttonText}>Create New Task</Text>
        </Pressable>

        <View style={globalStyles.filterRow}>
          <Text style={globalStyles.filterLabel}>Filter Priorities:</Text>
          <Picker
            style={globalStyles.picker}
            selectedValue={filters.priority}
            onValueChange={(itemValue) => {
              const value = itemValue === "Any Priority" ? undefined : itemValue;
              setFilters({ ...filters, priority: value });
            }}
          >
            <Picker.Item label="Any Priority" value={undefined} />
            <Picker.Item label="Low" value={1} />
            <Picker.Item label="Medium" value={2} />
            <Picker.Item label="High" value={3} />
          </Picker>
        </View>

        <TagSelector
          selectedTagIds={filters.tag_ids}
          onTagsSelected={(tagIds) => setFilters({ ...filters, tag_ids: tagIds })}
        />

        <Pressable style={globalStyles.button} onPress={fetchTasks}>
          <Text style={globalStyles.buttonText}>Apply Filters</Text>
        </Pressable>

        <Pressable
          style={globalStyles.button}
          onPress={() => setFilters({
            archived: false,
            priority: null,
            delegated_to: null,
            status_id: null,
            tag_ids: [],
          })}
        >
          <Text style={globalStyles.buttonText}>Clear Filters</Text>
        </Pressable>
      </View>

      <AddTask
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onTaskCreated={() => {
          fetchTasks();
        }}
      />

      {loading && tasks.length > 0 ? (
        <ActivityIndicator size="small" color="#0000ff" style={globalStyles.refreshIndicator} />
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        renderItem={({ item }) => {
          const taskCreatorId = typeof item.created_by === 'object' ? item.created_by.user_id : item.created_by;
          const isTaskCreator = String(taskCreatorId) === String(user_id);
          const canManageTask = isAuthorized || isTaskCreator;

          return (
            <View style={globalStyles.taskItem}>
              <Text style={globalStyles.title}>{item.name}</Text>
              <Text>Description: {item.description}</Text>
              <Text>Priority: {getPriorityName(item.priority)}</Text>
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

              <Pressable
                style={[globalStyles.button, { backgroundColor: '#ff6b6b' }]}
                onPress={() => handleReportProblem(item)}
              >
                <Text style={globalStyles.buttonText}>Report Problem</Text>
              </Pressable>

              {canManageTask && (
                <ManageTask
                  task={item}
                  onUpdate={() => {
                    fetchTasks();
                  }}
                  onDelete={(taskId) => {
                    setTasks(tasks.filter(t => t.task_id !== taskId));
                    fetchTasks();
                  }}
                />
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={globalStyles.emptyContainer}>
              <Text>No tasks found.</Text>
            </View>
          ) : null
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={problemModalVisible}
        onRequestClose={() => setProblemModalVisible(false)}
      >
        <View style={globalStyles.modalContainer}>
            <Text style={globalStyles.modalTitle}>Report Problem</Text>
            <TextInput
              style={[globalStyles.input, {width: '50%'}]}
              placeholder="Describe the problem..."
              value={newProblem}
              onChangeText={setNewProblem}
              multiline
            />
            <Pressable
              style={globalStyles.button}
              title={isSubmittingProblem ? "Submitting..." : "Submit Problem"}
              onPress={submitProblem}
              disabled={isSubmittingProblem || !newProblem.trim()}
            >
              <Text style={globalStyles.buttonText}>Submit</Text>
            </Pressable>
            <Pressable
              style={globalStyles.button}
              onPress={() => setProblemModalVisible(false)}
            >
              <Text style={globalStyles.buttonText}>Cancel</Text>
            </Pressable>
        </View>
      </Modal>
    </View>
  );
};

export default TaskList;
