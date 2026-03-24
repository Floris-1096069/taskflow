import { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import {Config} from "../config";

const Heartbeat = () => {
  const { fetchWithAuth } = useAuthContext();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetchWithAuth(`${Config.API_BASE_URL}/auth/heartbeat`, { method: 'POST' });
        console.log('Heartbeat');
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return null;
};

export default Heartbeat;