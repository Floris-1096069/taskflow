import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from "react-native-web";
import { useAuthContext } from '../context/AuthContext';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import Heartbeat from '../components/Heartbeat';
import {TagProvider} from '../context/TagContext';
import {WebSocketProvider} from "../context/WebSocketContext";

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
          <TagProvider>
            <WebSocketProvider>
              <AppStack />
            </WebSocketProvider>
          </TagProvider>
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
