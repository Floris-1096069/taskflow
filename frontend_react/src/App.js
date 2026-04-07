import { useEffect } from 'react';

import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import {TagProvider} from './context/TagContext';

import Heartbeat from './components/Heartbeat';


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
        <TagProvider>
            <AppNavigator/>
        </TagProvider>
      </AuthProvider>
  );
}