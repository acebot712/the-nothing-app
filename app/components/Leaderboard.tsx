import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LeaderboardEntry } from '../config/supabase';
import { haptics } from '../utils/animations';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  onPress?: (entry: LeaderboardEntry) => void;
  scrollEnabled?: boolean;
  maxEntries?: number; // Add an option to limit the number of entries shown
}

// Medal icons for top positions
const MEDALS = {
  first: require('../../assets/gold-medal.png'),
  second: require('../../assets/silver-medal.png'),
  third: require('../../assets/bronze-medal.png'),
};

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
        background: ['#D4AF37', '#F4EFA8', '#D4AF37'] as const,
        text: '#000',
        secondaryText: 'rgba(0, 0, 0, 0.7)',
      };
    }
    
    switch (index) {
      case 0:
        return {
          background: ['#E5E4E2', '#FFFFFF', '#E5E4E2'] as const,
          text: '#000',
          secondaryText: 'rgba(0, 0, 0, 0.7)',
        };
      case 1:
        return {
          background: ['#D4AF37', '#F4EFA8', '#D4AF37'] as const,
          text: '#000',
          secondaryText: 'rgba(0, 0, 0, 0.7)',
        };
      case 2:
        return {
          background: ['#CD7F32', '#FFC299', '#CD7F32'] as const,
          text: '#000',
          secondaryText: 'rgba(0, 0, 0, 0.7)',
        };
      default:
        return {
          background: ['#222', '#2A2A2A', '#222'] as const,
          text: '#FFF',
          secondaryText: 'rgba(255, 255, 255, 0.7)',
        };
    }
  };

  const { background, text, secondaryText } = getRowColors();

  const handlePress = () => {
    haptics.light();
    if (onPress) {
      onPress(entry);
    }
  };

  // Determine if a medal should be shown
  const getMedal = () => {
    if (index === 0) return MEDALS.first;
    if (index === 1) return MEDALS.second;
    if (index === 2) return MEDALS.third;
    return null;
  };

  // Format the purchase amount
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount}`;
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={handlePress}
      style={[
        styles.rowTouchable,
        isCurrentUser && styles.currentUserRow
      ]}
    >
      <LinearGradient
        colors={background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.rowGradient}
      >
        <View style={styles.rankContainer}>
          {getMedal() ? (
            <Image source={getMedal()} style={styles.medalIcon} />
          ) : (
            <Text style={[styles.rankText, { color: text }]}>
              {index + 1}
            </Text>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: text }]} numberOfLines={1}>
            {entry.username} {isCurrentUser && <Text style={styles.youTag}>(You)</Text>}
          </Text>
          <Text style={[styles.tierText, { color: secondaryText }]}>
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

const Leaderboard = ({ entries, currentUserId, onPress, scrollEnabled = false, maxEntries = 5 }: LeaderboardProps) => {
  // Limit displayed entries if maxEntries is provided
  const displayEntries = maxEntries ? entries.slice(0, maxEntries) : entries;
  
  // Check if there are more entries than what we're showing
  const hasMoreEntries = entries.length > displayEntries.length;
  
  return (
    <View style={styles.container}>
      <View style={styles.headerColumns}>
        <Text style={styles.headerRank}>RANK</Text>
        <Text style={styles.headerUser}>USER</Text>
        <Text style={styles.headerAmount}>SPENT</Text>
      </View>
      
      <FlatList
        data={displayEntries}
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
        scrollEnabled={scrollEnabled}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No one has flexed their wealth yet.</Text>
          </View>
        )}
        ListFooterComponent={hasMoreEntries ? () => (
          <TouchableOpacity
            style={styles.viewMoreButton}
            activeOpacity={0.8}
            onPress={() => {
              haptics.light();
              // Could navigate to a full leaderboard screen
              // or expand the list in place
              alert("View Full Leaderboard");
            }}
          >
            <Text style={styles.viewMoreText}>
              VIEW {entries.length - displayEntries.length} MORE
            </Text>
          </TouchableOpacity>
        ) : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  headerColumns: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  headerRank: {
    width: 50,
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    color: '#888',
  },
  headerUser: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    color: '#888',
  },
  headerAmount: {
    width: 80,
    textAlign: 'right',
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    color: '#888',
  },
  list: {
    paddingVertical: 8,
  },
  rowTouchable: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentUserRow: {
    elevation: 4,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#D4AF37',
  },
  rowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rankContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
  },
  medalIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  username: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 4,
  },
  youTag: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
  },
  tierText: {
    fontSize: 10,
    fontFamily: 'Montserrat_400Regular',
  },
  amount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  separator: {
    height: 8,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    color: '#888',
    textAlign: 'center',
  },
  viewMoreButton: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  viewMoreText: {
    fontSize: 12,
    fontFamily: 'Montserrat_700Bold',
    color: '#D4AF37',
    letterSpacing: 1,
  },
});

export default Leaderboard; 