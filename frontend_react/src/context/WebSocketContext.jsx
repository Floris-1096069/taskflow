import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { Config } from '../config';
import { useAuthContext } from './AuthContext';

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

    // Initialize socket with clean config
    const newSocket = io(`${Config.API_BASE_URL}:5000`, {
      extraHeaders: { Authorization: `Bearer ${token}` },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      autoConnect: false, // Wait for token
    });

    setSocket(newSocket);

    // Event handlers
    newSocket.on('connecting', () => {
      console.log('🔄 Connecting to WebSocket...');
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected! Socket ID:', newSocket.id);
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err);
      setError('Connection failed. Check console.');
      // ✅ NO manual retry - Socket.IO handles it
    });

    newSocket.on('notification', (data) => {
      console.log('📬 New notification:', data);
      setNotifications(prev => [...prev, data]);
    });

    newSocket.on('task_updated', (updatedTask) => {
      console.log('📝 Task updated:', updatedTask);
    });

    // Open connection after initialization
    newSocket.open();

    return () => {
      console.log('🧹 Cleaning up WebSocket...');
      newSocket.disconnect();
    };
  }, [token]); // Reconnect when token changes

  const emitEvent = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    } else {
      console.warn('⚠️ Cannot emit event: Socket not connected');
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