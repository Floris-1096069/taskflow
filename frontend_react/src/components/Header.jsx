import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import getGlobalStyles from '../styles/globalStyles';

const Header = ({ title, navigation, showBackButton = false, showRegisterButton = true }) => {
  const { isLoggedIn, logout } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);

  const handleLogout = () => {
    logout(navigation);
  };

  return (
    <View style={globalStyles.container}>
      {showBackButton && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={globalStyles.backButton}
        >
          <Text style={globalStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      <Text style={globalStyles.title}>{title}</Text>
      {isLoggedIn && (
        <>
          {showRegisterButton && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={globalStyles.registerButton}
            >
              <Text style={globalStyles.registerButtonText}>Add Account</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleLogout}
            style={globalStyles.logoutButton}
          >
            <Text style={globalStyles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Header;