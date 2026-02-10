import React from 'react';
import { View, Text, Button } from 'react-native';

import globalStyles from '../styles/globalStyles';

export default function TaskListScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Warehouse Task List</Text>
      <Button
        title="View Task Details"
        onPress={() => navigation.navigate('TaskDetail')}
      />
    </View>
  );
}