import { useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import {Config} from "../config";

const Heartbeat = () => {
  const { fetchWithAuth } = useAuthContext();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetchWithAuth(`${Config.API_BASE_URL}/api/auth/heartbeat`, { method: 'POST' });
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default Heartbeat;