import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, useColorScheme } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import getGlobalStyles from '../styles/globalStyles';
import Header from "../components/Header";
import { useAuthContext } from "../context/AuthContext";
import { Config } from '../config';
import UserPicker from '../components/UserPicker';

const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Teamleider' },
  { id: 3, name: 'Binnenkomend' },
  { id: 4, name: 'Zelfstandigscanmedewerker'},
  { id: 5, name: 'Scanmedewerkerplus' },
  { id: 6, name: 'Scanmedewerker' },
];

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('1'); // Default role
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  const { fetchWithAuth } = useAuthContext();

  useEffect(() => {
    if (selectedUserId === null) {
      setUsername('');
      setRole('1');
      setIsEditMode(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!selectedUserId) return;

      setIsLoading(true);
      try {
        const response = await fetchWithAuth(`${Config.API_BASE_URL}/user/${selectedUserId}`);
        const userData = await response.json();
        if (response.ok) {
          setUsername(userData.username || '');
          setRole(userData.role_id ? userData.role_id.toString() : '1');
          setIsEditMode(true);
        }
      } catch (error) {
        setErrorMessage('Failed to fetch user details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [selectedUserId]);

  const handleSubmit = async () => {
    if (!username || !role) {
      setErrorMessage('Username and role are required');
      return;
    }

    if (!isEditMode && (!password || !confirmPassword)) {
      setErrorMessage('Password and confirm password are required for registration');
      return;
    }

    if (!isEditMode && password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const url = isEditMode
        ? `${Config.API_BASE_URL}/user/${selectedUserId}`
        : `${Config.API_BASE_URL}/auth/register`;
      const method = isEditMode ? 'PUT' : 'POST';

      const body = isEditMode
        ? { username, role_id: role }
        : { username, password, role_id: role };

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.message || (isEditMode ? 'Update failed' : 'Registration failed'));
        return;
      }

      setSuccessMessage(isEditMode ? 'User updated successfully!' : 'User registered successfully!');
      if (!isEditMode) {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setRole('1');
      }
      setRefetchTrigger(prev => prev + 1);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <View style={[globalStyles.webContainer]}>
      <Header navigation={navigation} showBackButton={true} showAdminButton={false} />

      <Text>Choose an account to modify</Text>

      <UserPicker onUserSelect={handleUserSelect}
                  selectedUserId={selectedUserId}
                  refetchTrigger={refetchTrigger}
      />

      <View>
        <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
          Username
        </Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        {!isEditMode && (
          <>
            <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
              Password
            </Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
              Confirm Password
            </Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </>
        )}

        <Text style={[globalStyles.subtitle, { textAlign: 'center' }]}>
          Role
        </Text>
        <View style={globalStyles.input}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
          >
            {roles.map((r) => (
              <Picker.Item key={r.id} label={r.name} value={r.id.toString()} />
            ))}
          </Picker>
        </View>

        <Pressable
          style={[globalStyles.button]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={globalStyles.buttonText}>
            {isLoading ? (isEditMode ? 'Updating...' : 'Registering...') : (isEditMode ? 'Update' : 'Register')}
          </Text>
        </Pressable>

        {errorMessage ? (
          <Text style={globalStyles.errorText}>{errorMessage}</Text>
        ) : null}

        {successMessage ? (
          <Text style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>
            {successMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
