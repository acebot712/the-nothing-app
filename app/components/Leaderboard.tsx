import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardEntry } from '../config/supabase';
import { haptics } from '../utils/animations';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  onPress?: (entry: LeaderboardEntry) => void;
}

const LeaderboardRow = ({ 
  entry, 
  index, 
  isCurrentUser, 
  onPress 
}: { 
  entry: LeaderboardEntry; 
  index: number; 
  isCurrentUser: boolean; 
  onPress?: (entry: LeaderboardEntry) => void;
}) => {
  // Get color based on position
  const getRowColors = () => {
    if (isCurrentUser) {
      return {
        background: ['#D4AF37', '#F4EFA8', '#D4AF37'],
        text: '#000',
      };
    }
    
    switch (index) {
      case 0:
        return {
          background: ['#E5E4E2', '#FFFFFF', '#E5E4E2'],
          text: '#000',
        };
      case 1:
        return {
          background: ['#D4AF37', '#F4EFA8', '#D4AF37'],
          text: '#000',
        };
      case 2:
        return {
          background: ['#CD7F32', '#FFC299', '#CD7F32'],
          text: '#000',
        };
      default:
        return {
          background: ['#222', '#333', '#222'],
          text: '#FFF',
        };
    }
  };

  const { background, text } = getRowColors();

  const handlePress = () => {
    haptics.light();
    if (onPress) {
      onPress(entry);
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={handlePress}
      style={styles.rowTouchable}
    >
      <LinearGradient
        colors={background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.rowGradient}
      >
        <View style={styles.rank}>
          <Text style={[styles.rankText, { color: text }]}>
            {index + 1}
          </Text>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: text }]} numberOfLines={1}>
            {entry.username} {isCurrentUser && '(You)'}
          </Text>
          <Text style={[styles.tierText, { color: text }]}>
            {entry.tier.toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.amount}>
          <Text style={[styles.amountText, { color: text }]}>
            ${entry.purchase_amount.toLocaleString()}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const Leaderboard = ({ entries, currentUserId, onPress }: LeaderboardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>WEALTHIEST USERS</Text>
        <Text style={styles.subtitle}>The ultimate flex competition</Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <LeaderboardRow
            entry={item}
            index={index}
            isCurrentUser={item.id === currentUserId}
            onPress={onPress}
          />
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 20,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  list: {
    padding: 10,
  },
  rowTouchable: {
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  rank: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  tierText: {
    fontSize: 12,
    opacity: 0.7,
  },
  amount: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: 'transparent',
  },
});

export default Leaderboard; 