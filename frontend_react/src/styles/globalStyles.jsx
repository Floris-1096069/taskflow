import {Platform, StyleSheet} from 'react-native';

const isWeb = () => typeof window !== 'undefined';

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
  warning: '#ff9500',
  success: '#34c759',
  gray: '#8e8e93',
  todoBackground: '#F5F5F5',
  inProgressBackground: '#B3E5FC',
  doneBackground: '#C8E6C9',
  problemBackground: '#FFCDD2',
  archivedBackground: '#444'
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
  warning: '#ff9500',
  success: '#34c759',
  gray: '#8e8e93',
  todoBackground: '#333333',
  inProgressBackground: '#0D47A1',
  doneBackground: '#2E7D32',
  problemBackground: '#C62828',
  archivedBackground: '#444'
};

export const getGlobalStyles = (colorScheme) => {
  const colours = colorScheme === 'dark' ? lightColors : darkColors;

  const styles = StyleSheet.create({
    //text styles
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colours.text,
      textAlign: "center",
    },

    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
    },

    subtitle: {
      fontSize: 18,
      color: colours.lighttext,
    },

    bodyText: {
      fontSize: 14,
      color: colours.text,
      lineHeight: 20,
      marginBottom: 4,
      minWidth: 'auto', // Allow text to be as wide as needed
      flexShrink: 1, // Allow text to shrink if needed
    },

    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },

    buttonText: {
      color: colours.white,
      fontSize: 16,
      fontWeight: 'bold',
    },

    errorText: {
      color: colours.error,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 5,
    },

    deleteButtonText: {
      color: colours.white,
    },

    headerTitle: {
      fontWeight: 'bold',
      color: colours.text,
      flex: 1,
      textAlign: 'center',
    },

    backButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    logoutButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    registerButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    userPickerItemText: {
      color: colours.text,
    },

    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 5,
    },

    smallButton: {
      padding: 8,
      borderRadius: 5,
      marginHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      alignSelf: 'flex-start',
      maxWidth: 120,
    },

    problemItem: {
      padding: 10,
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 5,
      marginVertical: 5,
      backgroundColor: colours.white,
    },

    searchContainer: {
      width: '100%',
    },

    searchInput: {
      height: 40,
      borderColor: colours.border,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      backgroundColor: colours.background,
      color: colours.text,
    },

    tagListWrapper: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
      marginTop: 5,
      overflow: 'hidden',
    },

    tagList: {
      flex: 1,
      maxHeight: 120,
    },

    tagListContent: {
      paddingBottom: 10,
    },

    //containers
    container: {
      flex: 1,
      backgroundColor: colours.background,
    ...(Platform.OS === 'web' ? {
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        flexBasis: 'auto',
        flexShrink: 1,
        flexGrow: 1,
      } : {}),
    },

    headerContainer: {
      backgroundColor: colours.background,
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingHorizontal: 10,
    },

    headerButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    filterContainer: {
      width: '100%',
      padding: 10,
      backgroundColor: colours.background,
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 10,
    },

    tagPickerContainer: {
      borderColor: colours.border,
      borderRadius: 4,
      overflow: 'hidden',
    },

    tagFilterToggle: {
      padding: 8,
      marginVertical: 4,
      alignSelf: 'center',
      backgroundColor: 'transparent',
      borderRadius: 4,
    },

    tagFilterToggleText: {
      color: colours.primary,
      fontSize: 14,
      textDecorationLine: 'underline',
    },

    continuousBadge: {
      padding: 4,
      borderRadius: 4,
      alignSelf: 'flex-start',
      marginBottom: 0,
      marginRight: 8,
      backgroundColor: '#FF5722'
    },

    continuousBadgeText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12,
    },

    activeUsersContainer: {
      marginTop: 8,
    },

    activeUsersTitle: {
      fontWeight: 'bold',
      marginBottom: 4,
    },
    activeUsersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },

    activeUser: {
      backgroundColor: '#E0E0E0',
      padding: 4,
      borderRadius: 4,
      marginRight: 4,
      marginBottom: 4,
    },

    tagsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 5,
      marginBottom: 8,
    },

    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },

    modalContainer: {
      paddingTop: 20,
      flex: 1,
      backgroundColor: colours.background,
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
    },

    taskActionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
      flexWrap: 'wrap',
    },

    emptyContainer: {
      padding: 16,
      alignItems: 'center'
    },

    modalContent: {
      backgroundColor: colours.background,
      padding: 20,
      borderRadius: 10,
      width: '80%',
    },

    modalButtonContainer: {
      paddingTop: 20,
      backgroundColor: colours.background,
      width: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      position: 'relative',
    },

    confirmModal: {
      position: 'absolute',
      top: '40%',
      left: '10%',
      right: '10%',
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      zIndex: 1000,
      elevation: 5,
      shadowColor: colours.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
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

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },

    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },

    userPickerContainer: {
      marginBottom: 10,
    },

    //buttons
    button: {
      backgroundColor: colours.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4,
      alignSelf: 'center',
    },

    deleteButton: {
      backgroundColor: colours.error,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    backButton: {
      padding: 5,
      marginRight: 10,
    },

    logoutButton: {
      padding: 1,
    },

    registerButton: {
      padding: 1,
    },

    editButton: {
      backgroundColor: colours.secondary,
      padding: 8,
      borderRadius: 4,
      marginRight: 8,
    },

    // input fields
    input: {
      marginVertical: 7,
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 5,
      paddingVertical: 7,
      paddingHorizontal: 7,
      backgroundColor: colours.white,
      alignSelf: 'center',
      width: '100%',
    },

    userPickerInput: {
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 4,
      padding: 10,
      marginBottom: 5,
      color: colours.text,
      backgroundColor: colours.white,
    },

    // tasklist styles
    taskItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colours.border,
      backgroundColor: colours.white,
      marginBottom: 10,
      borderRadius: 8,
      shadowColor: colours.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      width: '100%',
      alignSelf: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },

    taskInfoRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      gap: 12,
      marginTop: 8,
    },
    taskInfoContainer: {
      flex: 1,
      minWidth: 200,
    },

    taskName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colours.text,
      marginBottom: 8,
    },

    refreshIndicator: {
      marginVertical: 8
    },

    userPickerList: {
      maxHeight: 150,
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 4,
    },

    userPickerItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colours.border,
    },

    userPickerItemSelected: {
      backgroundColor: colours.primary,
    },

    filterLabel: {
      marginRight: 8,
      fontSize: 16,
    },

    picker: {
      flex: 1,
      minWidth: 150,
      maxWidth: 200,
      marginLeft: 8,
    },

    // taglist styling
    tagItem: {
      padding: 8,
      margin: 4,
      borderBottomWidth: 1,
      borderBottomColor: colours.white,
    },

    selectedTagItem: {
      backgroundColor: colours.primary,
    },

    tag: {
      backgroundColor: colours.primary,
      padding: 4,
      borderRadius: 4,
      marginRight: 5,
      marginBottom: 5,
      alignSelf: 'flex-start',
    },

    // web-specific styles (for PWA)
    webContainer: {
      flex: 1,
      maxWidth: 1600,
      justifyContent: 'flex-start',
      flexDirection: 'column',
      alignSelf: 'center',
      width: '100%',
      alignItems: 'center',
    },
  });

  return { ...styles, colours };
};


export default getGlobalStyles;
