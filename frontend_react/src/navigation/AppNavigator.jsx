import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from "react-native";
import { useAuthContext } from '../context/AuthContext';
import Toast from 'react-native-toast-message';

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
              <Toast />
            </WebSocketProvider>
          </TagProvider>
        </>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
