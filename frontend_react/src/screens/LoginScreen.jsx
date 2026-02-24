import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import globalStyles from '../styles/globalStyles';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuthContext();

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Login failed');
        return;
      }

      await login(data.token);
      navigation.navigate('TaskList');
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[globalStyles.webContainer]}>
      <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 30 }]}>
        Taskflow Login
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

        <Pressable style={[globalStyles.button]} onPress={handleLogin}>
          <Text style={globalStyles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </Pressable>

        {errorMessage ? (
          <Text style={globalStyles.errorText}>{errorMessage}</Text>
        ) : null}

        <Pressable style={{ marginTop: 20 }} onPress={() => navigation.navigate('Register')}>
          <Text style={{ textAlign: 'center', color: 'blue' }}>
            Need to create an account? Register here
          </Text>
        </Pressable>
      </View>
    </View>
  );
}