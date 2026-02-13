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
    <View style={[globalStyles.webContainer]}>
      <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 30 }]}>
        Taskflow Login
      </Text>

      <View>
        <Text style={[globalStyles.subtitle, { textAlign: 'center'}]}>
          Username
        </Text>
        <TextInput
          style={globalStyles.input}
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={[globalStyles.subtitle, { textAlign: 'center'}]}>
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
          style={[globalStyles.button]}
          onPress={handleLogin}
        >
          <Text style={globalStyles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
}