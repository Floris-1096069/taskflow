import { useWebSocket } from '../context/WebSocketContext';
import {View} from "react-native";

const NotificationDisplay = () => {
  const { notifications, isConnected, error } = useWebSocket();

  if (!isConnected) {
    return <Text>Connecting to notifications...</Text>;
  }

  if (error) {
    return <Text style={{ color: 'red' }}>Error: {error}</Text>;
  }

  return (
    <View>
      {notifications.map((notification, index) => (
        <View key={index} style={{ padding: 10, backgroundColor: '#f0f0f0', margin: 5 }}>
          <Text>{notification.message || JSON.stringify(notification)}</Text>
        </View>
      ))}
    </View>
  );
};