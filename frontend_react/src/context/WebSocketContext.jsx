import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { Config } from '../config';
import { useAuthContext } from './AuthContext';
import Toast from 'react-native-toast-message';

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  useEffect(() => {
    if (!token) {
      setError('No auth token available');
      return;
    }

    // Initialize socket with corrected config
    const newSocket = io(
      `${Config.API_BASE_URL.replace('http', 'ws')}`,  // Use ws:// instead of http://
      {
        query: { token: token },  // Pass token via query string
        protocolVersion: 4,       // Force Socket.IO v4 protocol
        transports: ['websocket', 'polling'],  // Allow fallback to polling
        reconnection: true,
        reconnectionAttempts: 5,
        autoConnect: false,
      }
    );

    setSocket(newSocket);

    // Event handlers
    newSocket.on('connecting', () => {
      console.log('🔄 Connecting to WebSocket...');
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected! Socket ID:', newSocket.id);
      setIsConnected(true);
      setError(null);
      Toast.show({
        type: 'success',
        text1: 'Connected',
        text2: 'WebSocket ready.',
        position: 'top',
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected. Reason:', reason);
      setIsConnected(false);
      Toast.show({
        type: 'error',
        text1: 'Disconnected',
        text2: `Reason: ${reason}`,
        position: 'top',
      });
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err);
      setError('Connection failed. Check console.');
      Toast.show({
        type: 'error',
        text1: 'Connection Error',
        text2: 'Failed to connect to notifications. Retrying...',
        position: 'top',
      });
    });

    newSocket.on('notification', (data) => {
      console.log('📬 New notification:', data);
      setNotifications(prev => [...prev, data]);
      Toast.show({
        type: 'info',
        text1: data.title || 'New Notification',
        text2: data.message || JSON.stringify(data),
        position: 'top',
      });
    });

    newSocket.on('task_updated', (updatedTask) => {
      console.log('📝 Task updated:', updatedTask);
      Toast.show({
        type: 'success',
        text1: 'Task Updated',
        text2: `Task ${updatedTask.id || updatedTask._id || 'unknown'} was updated.`,
        position: 'top',
      });
    });

    newSocket.open();

    return () => {
      console.log('🧹 Cleaning up WebSocket...');
      newSocket.disconnect();
    };
  }, [token]);

  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event: Socket not connected');
      Toast.show({
        type: 'error',
        text1: 'Offline',
        text2: 'Cannot send event: Not connected to server.',
        position: 'top',
      });
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        error,
        emitEvent,
        notifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};