import React from 'react';
import {View, useColorScheme} from 'react-native';

import getGlobalStyles from '../styles/globalStyles';
import Header from '../components/Header';
import TaskList from '../components/TaskList';


export default function TaskListScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);


  return (
    <View style={[globalStyles.webContainer, {width: '100%'}]}>

      <Header title="To Do List" navigation={navigation}
      showBackButton={false}
      showAdminButton={true}/>

    <View style={[globalStyles.container, {width: '100%'}]}>

      <TaskList navigation={navigation}></TaskList>

    </View>
    </View>
  );
}