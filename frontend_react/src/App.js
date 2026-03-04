import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const viewportMeta = document.querySelector('meta[name=viewport]');
    if (viewportMeta) {
      viewportMeta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
  }, []);

  return (
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
  );
}