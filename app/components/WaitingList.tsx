import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface WaitingListProps {
  initialCount?: number;
}

const WaitingList: React.FC<WaitingListProps> = ({ initialCount = 10000 }) => {
  const [waitingCount, setWaitingCount] = useState(initialCount);
  const pulseAnim = useState(new Animated.Value(1))[0];
  
  // Create pulse animation
  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);
    
    Animated.loop(pulse).start();
  }, []);
  
  // Randomly increase the counter occasionally for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setWaitingCount(prev => prev + Math.floor(Math.random() * 5) + 1);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>WAITING LIST</Text>
      <Animated.View 
        style={[
          styles.countContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Text style={styles.count}>{waitingCount.toLocaleString()}</Text>
      </Animated.View>
      <Text style={styles.subtext}>people waiting for an invite</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  label: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  countContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginBottom: 8,
  },
  count: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#999',
    fontSize: 12,
  },
});

export default WaitingList; 