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
    },

    subtitle: {
      fontSize: 18,
      color: colours.lighttext,
    },

    bodyText: {
      fontSize: 16,
      color: colours.text,
      lineHeight: 24,
    },

    //containers
    container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: colours.background,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    },



    modalContainer: {
    paddingTop: 20,
    backgroundColor: colours.background,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    },


    taskActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    },

    editButton: {
    backgroundColor: colours.secondary,
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    },

  modalContent: {
    backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtonContainer:{
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
    shadowColor: '#000',
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

    //buttons
    button: {
      backgroundColor: colours.primary,
      width: 200,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 4,
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

    deleteButton: {
      backgroundColor: colours.error,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    deleteButtonText: {
      color: colours.white,
    },

    //input fields
    input: {
      marginVertical: 7,
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 5,
      paddingVertical: 7,
      paddingHorizontal: 7,
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
      justifyContent: 'flex-start',
      paddingHorizontal: 10,
    },

    headerButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    headerTitle: {
      fontWeight: 'bold',
      color: colours.text,
      flex: 1,
      textAlign: 'center',
    },

    backButton: {
      padding: 5,
      marginRight: 10,
    },

    backButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    logoutButton: {
      padding: 1,
    },

    logoutButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    registerButton: {
      padding: 1,
    },

    registerButtonText: {
      color: colours.text,
      fontSize: 16,
    },

    //tasklist styles
    filterContainer: { marginBottom: 16 },
    taskItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    refreshIndicator: { marginVertical: 8 },
    emptyContainer: { padding: 16, alignItems: 'center' },

    //taglist styling
    tagItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
},

    tagPickerContainer: {
      marginBottom: 10,
    },

    selectedTagItem: {
      backgroundColor: colours.primary,
    },

    tagsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 5,
    },

    tag: {
      backgroundColor: colours.white,
      padding: 5,
      borderRadius: 5,
      marginRight: 5,
      marginBottom: 5,
    },

    //web-specific styles (for PWA)
    webContainer: {
      flex: 1,
      maxWidth:800,
      justifyContent: 'flex-start',
      flexDirection: 'column',
      alignSelf: 'center',
      width: '100%',
      alignItems: 'center',
    },
  });
};

export default getGlobalStyles;