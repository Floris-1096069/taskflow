import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Colors
  colors: {
    primary: '#3498db',
    secondary: '#2ecc71',
    background: '#f5f5f5',
    text: '#333',
    white: '#fff',
    error: '#e74c3c',
  },

  // Text styles
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  bodyText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },

  // Containers
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    alignSelf: 'center',
    width: '20%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Buttons
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    alignSelf: 'center',
    width: '80%',
  },

  // Web-specific styles (for PWA)
  webContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
});

export default globalStyles;