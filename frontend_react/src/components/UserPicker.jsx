import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme, Switch } from 'react-native';
import { useAuthContext } from "../context/AuthContext";
import getGlobalStyles from '../styles/globalStyles';
import { Config } from '../config';

const UserPicker = ({ onUserSelect, selectedUserId, refetchTrigger }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyOnline, setShowOnlyOnline] = useState(false);
  const { fetchWithAuth } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(`${Config.API_BASE_URL}/api/user/all`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [refetchTrigger]);

  const filteredUsers = users.filter(user => {
    const userName = user.name || user.username || '';
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOnline = !showOnlyOnline || user.is_online;
    return matchesSearch && matchesOnline;
  });

  const handleUserPress = (userId) => {
    if (selectedUserId === userId) {
      onUserSelect(null);
    } else {
      onUserSelect(userId);
    }
  };

  return (
    <View style={globalStyles.userPickerContainer}>
      <TextInput
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={globalStyles.userPickerInput}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Switch
          value={showOnlyOnline}
          onValueChange={setShowOnlyOnline}
        />
        <Text>Show only online users</Text>
      </View>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleUserPress(item.user_id)}
              style={[
                globalStyles.userPickerItem,
                selectedUserId === item.user_id && globalStyles.userPickerItemSelected,
              ]}
            >
              <Text style={globalStyles.userPickerItemText}>
                {item.name || item.username} ({item.role_name || 'No role'})
              </Text>
            </TouchableOpacity>
          )}
          style={globalStyles.userPickerList}
        />
      )}
    </View>
  );
};

export default UserPicker;
