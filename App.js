import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import SearchScreen from './src/screens/SearchScreen';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SearchScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default App; 