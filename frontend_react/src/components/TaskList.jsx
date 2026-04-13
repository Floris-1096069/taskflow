import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Picker, Pressable, ActivityIndicator, useColorScheme, Modal, TextInput, Switch, Alert,
  TouchableOpacity
} from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import getGlobalStyles from "../styles/globalStyles";
import { useAuthContext } from "../context/AuthContext";
import AddTask from './AddTask';
import TagSelector from './TagSelector';
import { Config } from '../config';

const TaskList = ({ navigation }) => {
  const route = useRoute();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({
    priority: undefined,
    delegated_to: null,
    status_id: null,
    tag_ids: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [problemModalVisible, setProblemModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newProblem, setNewProblem] = useState("");
  const [isSubmittingProblem, setIsSubmittingProblem] = useState(false);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [showContinuousTasks, setShowContinuousTasks] = useState(true);
  const [showUndelegatedTasks, setShowUndelegatedTasks] = useState(false);
  const [showProblemTasks, setShowProblemTasks] = useState(false);
  const [showArchivedTasks, setShowArchivedTasks] = useState(false);

  const { fetchWithAuth, getRole, user_id } = useAuthContext();
  const colorScheme = useColorScheme();
  const { colours, ...styles } = getGlobalStyles(colorScheme);

  const role = getRole();
  const isAuthorized = Number(role) === '1' || Number(role) === '2';

      useFocusEffect(
      React.useCallback(() => {
        fetchTasks();
      }, [filters, showContinuousTasks, showUndelegatedTasks, showProblemTasks, isAuthorized, user_id, showArchivedTasks])
    );

  const getStatusBackgroundColor = (statusId) => {
    switch (statusId) {
      case 1: return colours.todoBackground;
      case 2: return colours.inProgressBackground;
      case 3: return colours.doneBackground;
      case 4: return colours.problemBackground;
      default: return colours.background;
    }
  };

  const getTaskBackgroundColor = (task) => {
    if (task.archived) {
      return colours.archivedBackground;
    }

    if (isCheckedIn(task)) {
      return colours.inProgressBackground;
    }
    return getStatusBackgroundColor(task.status_id);
  };

  const handleNavigateToManageTask = (task) => {
  navigation.navigate('ManageTask', {
    task: {
      ...task,
      tag_ids: (task.tags || []).map(tag => tag.tag_id), // Safeguard: Fallback to empty array
    },
  });
};

  const fetchTasks = async () => {
  setLoading(true);
  setError(null);
  try {
    // 1. Fetch continuous tasks (if toggle is ON)
    let continuousTasks = [];
    if (showContinuousTasks) {
      const continuousResponse = await fetchWithAuth(`${Config.API_BASE_URL}/task/continuous`);
      continuousTasks = await continuousResponse.json();
      // Fetch tags and active_users for continuous tasks
      continuousTasks = await Promise.all(
        continuousTasks.map(async (task) => {
          const tagResponse = await fetchWithAuth(`${Config.API_BASE_URL}/task/tags/${task.task_id}`);
          let tags = await tagResponse.json();
          // Normalize tags to always be an array
          if (!Array.isArray(tags)) tags = [];
          const checkinsResponse = await fetchWithAuth(`${Config.API_BASE_URL}/task/checkins/${task.task_id}`);
          const active_users = await checkinsResponse.json();
          return { ...task, tags, active_users };
        })
      );
      continuousTasks = continuousTasks.filter(task => {
        if (task.required_role === null || task.required_role === undefined) {
          return true; // Show if no role restriction
        }
        const requiredRole = Number(task.required_role);
        console.log(task.required_role)
        const userRole = Number(role);
        return userRole <= requiredRole;
});
    }

    // 2. Fetch non-continuous tasks (always)
    const query = new URLSearchParams();
    if (!isAuthorized) {
      query.append('delegated_to', user_id);
    } else {
      if (showUndelegatedTasks) {
        query.append('delegated_to', 'null');
      } else {
        query.append('delegated_to', 'not_null');
      }
    }
    if (showProblemTasks) query.append('status_id', 4);
    if (!showArchivedTasks) {
      query.append('archived', 'false');
    }
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
        if (key !== 'delegated_to') {
          if (Array.isArray(value)) {
            value.forEach(id => query.append(key, id));
          } else {
            query.append(key, value);
          }
        }
      }
    });
    const filteredResponse = await fetchWithAuth(`${Config.API_BASE_URL}/task/filtered?${query.toString()}`);
    let filteredTasks = await filteredResponse.json();
    // Fetch tags for non-continuous tasks
    filteredTasks = await Promise.all(
      filteredTasks.map(async (task) => {
        const tagResponse = await fetchWithAuth(`${Config.API_BASE_URL}/task/tags/${task.task_id}`);
        let tags = await tagResponse.json();
        // Normalize tags to always be an array
        if (!Array.isArray(tags)) tags = [];
        return { ...task, tags, active_users: [] };
      })
    );

    // 3. Combine results
    setTasks([...continuousTasks, ...filteredTasks]);
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

  const getNextStatus = (currentStatusId) => {
    const statusOrder = [1, 2, 3];
    const currentIndex = statusOrder.indexOf(currentStatusId);
    return currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : currentStatusId;
  };

  const handleAdvanceStatus = async (task) => {
    const nextStatusId = getNextStatus(task.status_id);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/update/${task.task_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_id: nextStatusId }),
      });
      if (!response.ok) throw new Error('Failed to update task status');
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task status:", error);
      Alert.alert('Error', 'Failed to update task status.');
    }
  };

  const handleArchiveTask = async (task) => {
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/archive/${task.task_id}`,{
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
          });
      if (!response.ok) throw new Error('Failed to archive task');
      fetchTasks();
    } catch (error) {
      console.error("Failed to archive task");
      Alert.alert('Error', 'Failed to archive task');
    }
  };

    const isCheckedIn = (task) => {
      return task.active_users?.some((user) => String(user.user_id) === String(user_id));
    };

    const handleCheckInOut = async (task) => {
      try {
        const isCurrentlyCheckedIn = isCheckedIn(task);
        const endpoint = isCurrentlyCheckedIn ? "checkout" : "checkin";
        const response = await fetchWithAuth(`${Config.API_BASE_URL}/task/${endpoint}/${task.task_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        // Update the task in the local state directly
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.task_id === task.task_id ? data.task : t
          )
        );
      } catch (error) {
        console.error("Failed to update check-in status:", error);
        Alert.alert("Error", error.message || "Failed to update check-in status.");
      }
    };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchStatuses();
  }, [filters, showContinuousTasks, showUndelegatedTasks, showProblemTasks, isAuthorized, user_id, showArchivedTasks]);

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

  const getPriorityName = (priorityId) => {
    const priorityMap = { 1: 'Low', 2: 'Medium', 3: 'High' };
    return priorityMap[priorityId] || 'Unknown';
  };

  const submitProblem = async () => {
    if (!newProblem.trim() || !selectedTask) return;

    setIsSubmittingProblem(true);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/problem/create`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colours.primary} />
        <Text>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Pressable onPress={fetchTasks}><Text>Retry</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.title}>To Do List</Text>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Continuous Tasks:</Text>
          <Switch
            value={showContinuousTasks}
            onValueChange={setShowContinuousTasks}
          />
          <Text>{showContinuousTasks ? "Shown" : "Hidden"}</Text>
        </View>
        {isAuthorized && (
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Undelegated Tasks:</Text>
              <Switch
                value={showUndelegatedTasks}
                onValueChange={setShowUndelegatedTasks}
              />
              <Text>{showUndelegatedTasks ? "Only Undelegated" : "Already Delegated"}</Text>
            </View>
          )}
        {isAuthorized && (
            <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Problem Tasks Only:</Text>
            <Switch
              value={showProblemTasks}
              onValueChange={setShowProblemTasks}
            />
            <Text>{showProblemTasks ? "Only Problematic Tasks" : "Only Non Problematic Tasks"}</Text>
          </View>
        )}
        {isAuthorized && (
            <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Archived Tasks Only:</Text>
            <Switch
              value={showArchivedTasks}
              onValueChange={setShowArchivedTasks}
            />
            <Text>{showArchivedTasks ? "Only Archived Tasks" : "Only Non Archived Tasks"}</Text>
          </View>
        )}
        <Pressable style={[styles.button]} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Create New Task</Text>
        </Pressable>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Filter Priorities:</Text>
          <Picker
            style={styles.picker}
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
        <View>
          <TouchableOpacity style={styles.tagFilterToggle} onPress={() => setShowTagSelector(!showTagSelector)}>
            <Text style={styles.tagFilterToggleText}>
              {showTagSelector ? "Hide Tag Filter" : "Show Tag Filter"}
            </Text>
          </TouchableOpacity>
          {showTagSelector && (
            <View style={[styles.tagPickerContainer]}>
              <TagSelector
                selectedTagIds={filters.tag_ids}
                onTagsSelected={(tagIds) => setFilters({ ...filters, tag_ids: tagIds })}
              />
            </View>
          )}
        </View>
      </View>

      <AddTask visible={modalVisible} onClose={() => setModalVisible(false)} onTaskCreated={fetchTasks} />

      {loading && tasks.length > 0 ? (
        <ActivityIndicator size="small" color={colours.primary} style={styles.refreshIndicator} />
      ) : null}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id.toString()}
        renderItem={({ item }) => {
          const taskCreatorId = typeof item.created_by === 'object' ? item.created_by.user_id : item.created_by;
          const isTaskCreator = String(taskCreatorId) === String(user_id);
          const canManageTask = isAuthorized || isTaskCreator;
          const isDelegatee = String(item.delegated_to) === String(user_id);
          const statusBackgroundColor = getTaskBackgroundColor(item);

          return (
            <View style={[styles.taskItem, { backgroundColor: statusBackgroundColor }]}>
              {item.is_continuous && (
                <View style={[styles.continuousBadge]}>
                  <Text style={styles.continuousBadgeText}>Continuous</Text>
                </View>
              )}
              <View style={styles.taskInfoContainer}>
                <Text style={styles.taskName}>{item.name}</Text>
                <Text style={styles.bodyText}>Description: {item.description}</Text>
              </View>
              {!item.is_continuous && (
                <>
                  <View style={styles.taskInfoRow}>
                    <Text style={styles.bodyText}>Priority: {getPriorityName(item.priority)}</Text>
                    <Text style={styles.bodyText}>Status: {getStatusName(item.status_id)}</Text>
                    <Text style={styles.bodyText}>Assigned to: {getUsername(item.delegated_to)}</Text>
                    <Text style={styles.bodyText}>Created by: {getUsername(item.created_by)}</Text>
                    <Text style={styles.bodyText}>Creation time: {new Date(item.creation_time).toLocaleString()}</Text>
                  </View>
                  {item.is_continuous && (
                    <View style={styles.activeUsersContainer}>
                      <Text style={styles.activeUsersTitle}>Active Users:</Text>
                      <View style={styles.activeUsersList}>
                        {item.active_users?.map((user) => (
                          <Text key={user.user_id} style={styles.activeUser}>
                            {getUsername(user.user_id)}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                  <View style={styles.tagsContainer}>
                    <Text>Tags: </Text>
                    {item.tags && item.tags.length > 0 ? (
                      item.tags.map((tag) => (
                        <View key={tag.tag_id} style={styles.tag}>
                          <Text style={{ color: colours.white }}>{tag.name}</Text>
                        </View>
                      ))
                    ) : (
                      <Text>No tags</Text>
                    )}
                  </View>
                </>
              )}
              <View style={styles.taskActionsContainer}>
                {item.is_continuous ? (
                  <Pressable
                    style={[styles.button, { flex: 1 }]}
                    onPress={() => handleCheckInOut(item)}
                  >
                    <Text style={styles.buttonText}>
                      {isCheckedIn(item) ? "Check Out" : "Check In"}
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    {isDelegatee && item.status_id !== 3 && (
                      <Pressable
                        style={[styles.button, { flex: 1, marginRight: 8 }]}
                        onPress={() => handleAdvanceStatus(item)}
                      >
                        <Text style={styles.buttonText}>
                          {item.status_id === 1 ? 'Start Task' : 'Mark as Done'}
                        </Text>
                      </Pressable>
                    )}
                    {isDelegatee && item.status_id === 3 && (
                      <Pressable
                        style={[styles.button, { flex: 1, marginRight: 8 }]}
                        onPress={() => handleArchiveTask(item)}
                      >
                        <Text style={styles.buttonText}>Archive</Text>
                      </Pressable>
                    )}
                    <Pressable
                      style={[styles.button, { flex: 1, marginRight: 8 }]}
                      onPress={() => handleReportProblem(item)}
                    >
                      <Text style={styles.buttonText}>Report Problem</Text>
                    </Pressable>
                    {canManageTask && (
                      <Pressable
                        style={styles.button}
                        onPress={() => handleNavigateToManageTask(item)}
                      >
                        <Text style={styles.buttonText}>Manage</Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ padding: 10, width: '100%' }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
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
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Report Problem</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe the problem..."
            value={newProblem}
            onChangeText={setNewProblem}
            multiline
          />
          <Pressable
            style={styles.button}
            disabled={isSubmittingProblem || !newProblem.trim()}
            onPress={submitProblem}
          >
            <Text style={styles.buttonText}>
              {isSubmittingProblem ? "Submitting..." : "Submit Problem"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => setProblemModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

export default TaskList;