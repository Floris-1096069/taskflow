import { useEffect } from 'react';

import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';



export default function App() {
  useEffect(() => {
  const viewportMeta = document.querySelector('meta[name=viewport]');
  if (viewportMeta) {
    viewportMeta.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes, viewport-fit=cover'
    );
  }
}, []);

  return (
      <AuthProvider>
        <AppNavigator/>
      </AuthProvider>
  );
}