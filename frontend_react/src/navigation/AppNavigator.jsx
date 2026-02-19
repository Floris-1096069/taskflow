import { NavigationContainer } from '@react-navigation/native';
import useAuth from '../hooks/useAuth';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {ActivityIndicator} from "react-native-web";

export default function AppNavigator() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}