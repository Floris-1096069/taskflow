import React from 'react';
import {View, Text, Pressable, useColorScheme} from 'react-native';

import getGlobalStyles from '../styles/globalStyles';
import Header from '../components/Header';

export default function AdminScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  return (
    <View style={[globalStyles.webContainer]}>

      <Header title="Admin Tools" navigation={navigation}
      showBackButton={true}
      showAdminButton={false}/>

    <View style={globalStyles.container}>

    <Pressable
        onPress={() => navigation.navigate('Register')}
        style={[globalStyles.button]}
        >
        <Text style={globalStyles.buttonText}>Add new account</Text>
    </Pressable>

    <Pressable
        onPress={() => navigation.navigate('TagScreen')}
        style={[globalStyles.button]}
        >
        <Text style={globalStyles.buttonText}>Manage Tags</Text>
    </Pressable>

    </View>
    </View>
  );
}