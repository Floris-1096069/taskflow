import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Dimensions } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import getGlobalStyles from '../styles/globalStyles';

const Header = ({ title, navigation, showBackButton = false, showAdminButton = true }) => {
  const { isLoggedIn, logout } = useAuthContext();
  const colorScheme = useColorScheme();
  const globalStyles = getGlobalStyles(colorScheme);
  const screenWidth = Dimensions.get('window').width;


  const handleLogout = () => {
    logout(navigation);
  };

  const isSmallScreen = screenWidth < 400;

  return (
    <View style={[globalStyles.headerContainer, { height: isSmallScreen ? 70 : 60 }]}>
    {showBackButton && (
      <TouchableOpacity onPress={() => navigation.goBack()}
      style={[globalStyles.backButton, { top: isSmallScreen ? 25 : 18 }]}>

        <Text style={globalStyles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    )}

    <Text
        style={[
          globalStyles.headerTitle,
          {
            fontSize: isSmallScreen ? 18 : 20,
            textAlign: isSmallScreen ? 'left' : 'center',
            paddingLeft: isSmallScreen ? 20 : 0,
            marginLeft: isSmallScreen && showBackButton ? 119 : 0,
            flex: 1,
          },
        ]}
      >
      {title}
    </Text>

    {isLoggedIn && (
      <>
      {showAdminButton && (
        <TouchableOpacity onPress={() => navigation.navigate('AdminScreen')}
          style={[globalStyles.registerButton,
          { right: isSmallScreen ? 80 : 70, top: isSmallScreen ? 25 : 18 }]}>

            <Text style={[globalStyles.registerButtonText, { fontSize: isSmallScreen ? 14 : 16 }]}>
              Administrative Tools
            </Text>
        </TouchableOpacity>
    )}

        <TouchableOpacity onPress={handleLogout} style={[globalStyles.logoutButton,
          { top: isSmallScreen ? 25 : 18 }]}>

            <Text style={[globalStyles.logoutButtonText, { fontSize: isSmallScreen ? 14 : 16 }]}>
              Logout
            </Text>
        </TouchableOpacity>
      </>
    )}
    </View>
  );
};

export default Header;