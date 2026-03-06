import React from 'react';
import { View, useColorScheme } from 'react-native';
import getGlobalStyles from '../styles/globalStyles';
import Header from '../components/Header';
import TagManager from "../components/ManageTags";

export default function ManageTagScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  return (
    <View style={[globalStyles.webContainer]}>
      <Header navigation={navigation}
      showBackButton={true}
      showAdminButton={false}/>
      <TagManager onBack={() => navigation.navigate('TaskList')} />
    </View>
  );
}