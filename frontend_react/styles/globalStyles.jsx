import { StyleSheet } from 'react-native';

const colours = {

    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#f5f5f5',
    text: '#333',
    lighttext: '#555',
    border: "#ddd",
    white: '#fff',
    black: '#000',
    error: '#e74c3c',
};

export const globalStyles = StyleSheet.create({
  //Text styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colours.text,
    marginBottom: 10,
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

  //Containers
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colours.background,
    alignSelf: 'center',
    width: '100%',
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

  //Buttons
  button: {
    backgroundColor: colours.primary,
    padding: 12,
    borderRadius: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    marginTop: 10  ,
  },
  buttonText: {
    color: colours.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  //Inputs
  input: {
    borderWidth: 1,
    borderColor: colours.border,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: colours.white,
    alignSelf: 'center',
    width: '50%',
  },

  //Web-specific styles (for PWA)
  webContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
});

export default globalStyles;