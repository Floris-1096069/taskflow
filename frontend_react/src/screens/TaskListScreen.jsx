import React from 'react';
import {View, Text, Pressable} from 'react-native';

import globalStyles from '../styles/globalStyles';
import Header from '../components/Header';

export default function TaskListScreen({ navigation }) {
  return (
    <View style={[globalStyles.webContainer]}>
        <Header title="To Do List" navigation={navigation}/>

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