import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TaskListScreen from '../screens/TaskListScreen';
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator>

    <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ title: 'Tasks', headerShown: false }}
    />

    <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Register', headerShown: false }}
    />

    </Stack.Navigator>
  );
}