import React from 'react';
import {View, Text, Pressable, useColorScheme} from 'react-native';

import getGlobalStyles from '../styles/globalStyles';
import Header from '../components/Header';

export default function TaskListScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  return (
    <View style={[globalStyles.webContainer]}>

      <Header title="To Do List" navigation={navigation}/>

    <View style={globalStyles.container}>

      <Pressable style={[globalStyles.button]}>
        <Text style={globalStyles.buttonText}>Taak 1</Text>
      </Pressable>

      <Pressable style={[globalStyles.button]}>
        <Text style={globalStyles.buttonText}>Taak 2</Text>
      </Pressable>

    </View>
    </View>
  );
}