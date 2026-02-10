import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {NavigationContainer} from "@react-navigation/native";

//import screens
import LoginScreen from '../screens/LoginScreen';
import TaskListScreen from '../screens/TaskListScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />

      <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{title: 'Tasks'}}
      />

    </Stack.Navigator>
    </NavigationContainer>
  );
}