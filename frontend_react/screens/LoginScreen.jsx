import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';

import globalStyles from '../styles/globalStyles';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    //Placeholder navigation
    navigation.navigate('TaskList');
  };

  return (
    <View style={[globalStyles.container, { justifyContent: 'center' }]}>
      <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 30 }]}>
        Taskflow Login
      </Text>

      <View style={{ width: '100%', maxWidth: 400 }}>
        <Text style={globalStyles.subtitle}>Username</Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={[globalStyles.subtitle, { marginTop: 10 }]}>
          Password
        </Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[globalStyles.button, { marginTop: 20 }]}
          onPress={handleLogin}
        >
          <Text style={globalStyles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}