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

    const newSocket = io(`${Config.API_BASE_URL}:5000`, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      setError('WebSocket connection error. Retrying...');
      setTimeout(() => newSocket.connect(), 5000);
    });

    newSocket.on('notification', (data) => {
      setNotifications(prev => [...prev, data]);
      console.log('New notification:', data);
    });

    newSocket.on('task_updated', (updatedTask) => {
      console.log('Task updated:', updatedTask);
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [token]);

  const emitEvent = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        error,
        emitEvent,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};