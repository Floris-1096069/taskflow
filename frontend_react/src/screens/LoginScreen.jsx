import React, { useState } from 'react';
import {View, Text, TextInput, Pressable, useColorScheme} from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import getGlobalStyles from '../styles/globalStyles';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://172.20.10.2:5000/api/auth', {
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
      console.log('Backend response:', data);

      if (!response.ok) {
        setErrorMessage(data.message || 'Login failed');
        return;
      }

      await login(data.token, data.userId.toString(), data.role.toString());
      navigation.navigate('TaskList');
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[globalStyles.webContainer]}>
      <Text style={[globalStyles.title,]}>
        Taskflow Login
      </Text>

      <View style={[globalStyles.container]}>
        <Text style={[globalStyles.subtitle,]}>
          Username
        </Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={[globalStyles.subtitle,]}>
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
      </View>
    </View>
  );
}