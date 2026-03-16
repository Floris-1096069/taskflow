import React from 'react';
import { View, useColorScheme } from 'react-native';

import getGlobalStyles from '../styles/globalStyles';
import Header from '../components/Header';
import ProblemTasks from "../components/ProblemTaskList";

export default function ProblemScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  return (
    <View style={[globalStyles.webContainer]}>
      <Header navigation={navigation}
      showBackButton={true}
      showAdminButton={false}/>
      <ProblemTasks onBack={() => navigation.navigate('AdminScreen')} />
    </View>
  );
}