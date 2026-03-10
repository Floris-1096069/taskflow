import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, useColorScheme } from 'react-native';

import { useAuthContext } from "../context/AuthContext";
import getGlobalStyles from '../styles/globalStyles';

const UserPicker = ({ onUserSelect, selectedUserId }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { fetchWithAuth } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const response = await fetchWithAuth('http://172.20.10.2:5000/api/user/all');
        const data = await response.json();
        setUsers(data);

      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const userName = user.name || user.username || '';
    return userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <View style={globalStyles.userPickerContainer}>
      <TextInput
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={globalStyles.userPickerInput}
      />

      {loading ? (
        <ActivityIndicator/>

      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.user_id.toString()}
          renderItem={({ item }) => (

            <TouchableOpacity
              onPress={() => onUserSelect(item.user_id)}
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
