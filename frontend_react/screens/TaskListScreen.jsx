import React from 'react';
import {View, Text, Pressable} from 'react-native';

import globalStyles from '../styles/globalStyles';

export default function TaskListScreen({ navigation }) {
  return (
    <View style={[globalStyles.webContainer]}>
      <Text style={[globalStyles.title, { textAlign: 'center', marginBottom: 30 }]}>
          To Do:
      </Text>
      <Pressable
          style={[globalStyles.button]}

        >
          <Text style={globalStyles.buttonText}>Taak 1</Text>
        </Pressable>
        <Pressable
          style={[globalStyles.button]}

        >
          <Text style={globalStyles.buttonText}>Taak 2</Text>
        </Pressable>

    </View>
  );
}