import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ActivityFeed = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>This component has been removed in production.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
  },
});

export default ActivityFeed; 