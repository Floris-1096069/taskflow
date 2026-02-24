import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import globalStyles from '../styles/globalStyles';

const roles = [
  { id: 1, name: 'admin' },
  { id: 2, name: 'manager' },
  { id: 3, name: 'teamleider' },
  { id: 4, name: 'scanmedewerkerplus' },
  { id: 5, name: 'scanmedewerker' },
];


export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    if (!username || !password || !role) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role_id: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Registration failed');
        return;
      }

      setSuccessMessage('User registered successfully!');
      setTimeout(() => navigation.navigate('Login'), 1500);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[globalStyles.webContainer]}>
      <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 30 }]}>
        Taskflow Register
      </Text>

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
          Role
        </Text>
        <View style={globalStyles.input}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
          >
            {roles.map((r) => (
              <Picker.Item key={r.id} label={r.name} value={r.id} />
            ))}
          </Picker>
        </View>

        <Pressable
          style={[globalStyles.button]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={globalStyles.buttonText}>
            {isLoading ? 'Registering...' : 'Register'}
          </Text>
        </Pressable>
          {errorMessage ? (
        <Text style={globalStyles.errorText}>
          {errorMessage}
        </Text>
      ) : null}

      {successMessage ? (
        <Text style={{ color: 'green', textAlign: 'center', marginBottom: 10 }}>
          {successMessage}
        </Text>
      ) : null}

        <Pressable
          style={{ marginTop: 20 }}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ textAlign: 'center', color: 'blue' }}>
            Already have an account? Login here
          </Text>
        </Pressable>
      </View>
    </View>
  );
}