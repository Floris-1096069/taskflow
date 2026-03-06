import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import getGlobalStyles from '../styles/globalStyles';

const Header = ({ navigation, showBackButton = false, showAdminButton = true }) => {
  const { isLoggedIn, logout, getRole, username } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 400;


  const role = getRole();
  const isAuthorized = String(role) === '1' || String(role) === '2';


  const handleLogout = () => {
    logout(navigation);
  };


  return (
  <View style={[globalStyles.headerContainer, { height: isSmallScreen ? 70 : 60 }]}>
    {showBackButton && (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={globalStyles.backButton}
      >
        <Text style={globalStyles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    )}

    {isLoggedIn && (
      <View style={globalStyles.headerButtonContainer}>
        <Text style={globalStyles.registerButtonText}>
          Welcome, {username}  |
        </Text>
        {showAdminButton && isAuthorized && (
          <TouchableOpacity
            onPress={() => navigation.navigate('AdminScreen')}
            style={globalStyles.registerButton}
          >
            <Text style={[globalStyles.registerButtonText, { fontSize: isSmallScreen ? 14 : 16 }]}>
              Administrative Tools  |
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleLogout}
          style={globalStyles.logoutButton}
        >
          <Text style={[globalStyles.logoutButtonText, { fontSize: isSmallScreen ? 14 : 16 }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
)}
export default Header;