import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Animated } from 'react-native';

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  tier: 'regular' | 'elite' | 'god';
}

// Sample activity data
const ACTIVITIES: Activity[] = [
  { id: '1', user: 'James W.', action: 'unlocked Elite Status', time: '2m ago', tier: 'elite' },
  { id: '2', user: 'Olivia R.', action: 'just joined with invite code', time: '5m ago', tier: 'regular' },
  { id: '3', user: 'William C.', action: 'spent $9,999', time: '12m ago', tier: 'elite' },
  { id: '4', user: 'Sophia P.', action: 'entered the Secret Room', time: '15m ago', tier: 'god' },
  { id: '5', user: 'Benjamin F.', action: 'upgraded to God Mode', time: '20m ago', tier: 'god' },
  { id: '6', user: 'Ava M.', action: 'unlocked the Mystery Feature', time: '25m ago', tier: 'elite' },
  { id: '7', user: 'Alexander S.', action: 'received their concierge message', time: '30m ago', tier: 'god' },
  { id: '8', user: 'Charlotte K.', action: 'joined the leaderboard', time: '35m ago', tier: 'regular' },
  { id: '9', user: 'Henry D.', action: 'invited a new member', time: '40m ago', tier: 'elite' },
  { id: '10', user: 'Amelia B.', action: 'received exclusive content', time: '45m ago', tier: 'god' },
];

// Celebs that occasionally appear
const CELEBS: Activity[] = [
  { id: 'c1', user: 'Elon M.', action: 'spent $99,999', time: 'just now', tier: 'god' },
  { id: 'c2', user: 'Kim K.', action: 'upgraded to God Mode', time: 'just now', tier: 'god' },
  { id: 'c3', user: 'Jeff B.', action: 'unlocked a secret feature', time: 'just now', tier: 'god' },
];

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Simulate new activities with celebrity appearances
  useEffect(() => {
    const interval = setInterval(() => {
      // 20% chance of celebrity appearance
      const isCeleb = Math.random() < 0.2;
      
      if (isCeleb) {
        const celeb = CELEBS[Math.floor(Math.random() * CELEBS.length)];
        const newActivity: Activity = { ...celeb, id: `c${Date.now()}` };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        
        // Animate the new celebrity activity
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } else {
        // Regular activity updates
        const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
        const newActivity: Activity = { 
          ...activity, 
          id: `a${Date.now()}`, 
          time: 'just now' 
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 30000); // New activity every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const renderTierBadge = (tier: 'regular' | 'elite' | 'god') => {
    let color = '#999';
    if (tier === 'elite') color = '#C0C0C0';
    if (tier === 'god') color = '#D4AF37';
    
    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{tier.toUpperCase()}</Text>
      </View>
    );
  };
  
  const renderActivity = ({ item, index }: { item: Activity; index: number }) => {
    // Apply special animation to the first item if it's new
    const isFirst = index === 0;
    
    return (
      <Animated.View 
        style={[
          styles.activityItem, 
          isFirst && { opacity: fadeAnim }
        ]}
      >
        <View style={styles.activityHeader}>
          <Text style={styles.username}>{item.user}</Text>
          {renderTierBadge(item.tier)}
        </View>
        <Text style={styles.action}>{item.action}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EXCLUSIVE ACTIVITY</Text>
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  title: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  list: {
    maxHeight: 300,
  },
  activityItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  action: {
    color: '#CCC',
    fontSize: 14,
    marginBottom: 4,
  },
  time: {
    color: '#777',
    fontSize: 12,
  },
});

export default ActivityFeed; 