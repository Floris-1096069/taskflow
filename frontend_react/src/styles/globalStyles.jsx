import { StyleSheet } from 'react-native';

const lightColors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#f5f5f5',
  text: '#333',
  lighttext: '#555',
  border: '#ddd',
  white: '#fff',
  black: '#000',
  error: '#e74c3c',
};

const darkColors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#121212',
  text: '#fff',
  lighttext: '#ccc',
  border: '#444',
  white: '#000',
  black: '#fff',
  error: '#e74c3c',
};

export const getGlobalStyles = (colorScheme) => {
  const colours = colorScheme === 'dark' ? lightColors : darkColors;

  return StyleSheet.create({
    //text styles
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colours.text,
      textAlign: "center",
      marginHorizontal: 40,
    },

    subtitle: {
      fontSize: 18,
      color: colours.lighttext,
      marginBottom: 5,
    },

    bodyText: {
      fontSize: 16,
      color: colours.text,
      lineHeight: 24,
    },

    //containers
    container: {
    paddingTop: 20,
    backgroundColor: colours.background,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    },

    card: {
      backgroundColor: colours.white,
      borderRadius: 8,
      padding: 15,
      marginBottom: 15,
      shadowColor: colours.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    //buttons
    button: {
      backgroundColor: colours.primary,
      padding: 12,
      borderRadius: 5,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      width: '60%',
      marginTop: 10,
    },

    buttonText: {
      color: colours.white,
      fontSize: 16,
      fontWeight: 'bold',
    },

    errorText: {
      marginTop: 15,
      color: colours.error,
      fontSize: 16,
      textAlign: 'center',
    },

    //input fields
    input: {
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
      backgroundColor: colours.white,
      alignSelf: 'center',
      width: '90%',
    },

    //header styling
    headerContainer: {
      backgroundColor: colours.background,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },

    headerTitle: {
      fontWeight: 'bold',
      color: colours.text,
    },

    backButton: {
      padding: 5,
      position: 'absolute',
      left: 10,
      zIndex: 1,
    },

    backButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    logoutButton: {
      padding: 1,
      position: 'absolute',
      right: 10,
      zIndex: 1,
    },

    logoutButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    registerButton: {
      padding: 1,
      position: 'absolute',
      right: 35,
      zIndex: 1,
    },

    registerButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    //web-specific styles (for PWA)
    webContainer: {
      flex: 1,
      maxWidth:"800",
      justifyContent: 'flex-start',
      flexDirection: 'column',
      alignSelf: 'center',
      width: '100%',
      alignItems: 'center',
    },
  });
};

export default getGlobalStyles;