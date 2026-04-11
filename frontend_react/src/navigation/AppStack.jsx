import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TaskListScreen from '../screens/TaskListScreen';
import RegisterScreen from "../screens/RegisterScreen";
import AdminScreen from '../screens/AdminScreen';
import TagScreen from "../screens/ManageTagScreen";
import ProblemScreen from "../screens/ProblemScreen";
import ManageTaskScreen from '../screens/ManageTaskScreen';


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
        name="ManageTask"
        component={ManageTaskScreen}
        options={{ title: 'Manage', headerShown: false }}
    />

    <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Register', headerShown: false }}
    />

    <Stack.Screen
      name="AdminScreen"
      component={AdminScreen}
      options={{ title: 'Admin', headerShown: false }}
    />

    <Stack.Screen
      name="TagScreen"
      component={TagScreen}
      options={{ title: 'Manage Tags', headerShown: false }}
    />

    <Stack.Screen
      name="ProblemScreen"
      component={ProblemScreen}
      options={{ title: 'Problem Tasklist', headerShown: false }}
    />
      
    </Stack.Navigator>
  );
}