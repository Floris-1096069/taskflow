import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {ActivityIndicator} from "react-native-web";
import { useAuthContext } from '../context/AuthContext';

export default function AppNavigator() {
  const { isLoggedIn, loading } = useAuthContext();

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}