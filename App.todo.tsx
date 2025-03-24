import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import TodoList from './app/components/TodoList';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Supabase Todo App</Text>
      </View>
      <TodoList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    padding: 20,
    backgroundColor: '#222',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 