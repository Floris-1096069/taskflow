import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from "react-native-web";
import { useAuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import Heartbeat from '../components/Heartbeat';

export default function AppNavigator() {
  const { isLoggedIn, loading } = useAuthContext();

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <>
          <Heartbeat />
          <AppStack />
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
