import React, { useState } from 'react';
import {View, Text, TextInput, Pressable, useColorScheme} from 'react-native';
import { Picker } from '@react-native-picker/picker';

import getGlobalStyles from '../styles/globalStyles';
import Header from "../components/Header";

const roles = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Teamleider' },
  { id: 3, name: 'Binnenkomend' },
  { id: 4, name: 'Scanmedewerkerplus' },
  { id: 5, name: 'Scanmedewerker' },
];


export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  const handleRegister = async () => {
    if (!username || !password || !role) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('http://172.20.10.2:5000/api/auth/register', {
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
      <Header title="Add account" navigation={navigation}
      showBackButton={true}
      showAdminButton={false}/>

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

      </View>
    </View>
  );
}