import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LuxuryButton from '../components/LuxuryButton';
import FlexBadge from '../components/FlexBadge';
import Leaderboard from '../components/Leaderboard';
import { haptics } from '../utils/animations';
import { useUser } from '../contexts/UserContext';
import { getLeaderboard, LeaderboardEntry } from '../config/supabase';

// Fake reviews for the app
const FAKE_REVIEWS = [
  "This app changed my life. You wouldn't understand.",
  "Worth every penny. Best $999 I ever spent.",
  "If you have to ask what it does, you can't afford it.",
  "Finally, a way to show my friends I'm better than them.",
  "My butler uses this to remind me how rich I am.",
  "Does nothing. Costs everything. Absolutely perfect.",
  "I spent $99,999 on this app. Made me feel alive again."
];

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useUser();
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomReview, setRandomReview] = useState('');
  
  // Load leaderboard data and a random review
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get leaderboard data
        const leaderboard = await getLeaderboard();
        
        // Add the current user to the leaderboard if not already present
        if (user) {
          const userExists = leaderboard.some(entry => entry.id === user.id);
          
          if (!userExists) {
            const userEntry: LeaderboardEntry = {
              id: user.id,
              username: user.username,
              purchase_amount: user.purchase_amount,
              tier: user.tier,
              created_at: user.created_at,
            };
            
            // Insert user at appropriate position based on amount
            let inserted = false;
            for (let i = 0; i < leaderboard.length; i++) {
              if (userEntry.purchase_amount >= leaderboard[i].purchase_amount) {
                leaderboard.splice(i, 0, userEntry);
                inserted = true;
                break;
              }
            }
            
            // If not inserted, add to the end
            if (!inserted) {
              leaderboard.push(userEntry);
            }
          }
        }
        
        setLeaderboardData(leaderboard);
        
        // Get a random review
        const randomIndex = Math.floor(Math.random() * FAKE_REVIEWS.length);
        setRandomReview(FAKE_REVIEWS[randomIndex]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);
  
  const handleShare = async () => {
    if (!user) return;
    
    try {
      haptics.medium();
      
      const message = `I just spent $${user.purchase_amount.toLocaleString()} on The Nothing App. Stay poor.
      
Serial: ${user.serial_number}
Tier: ${user.tier.toUpperCase()}

#TheNothingApp #StayPoor`;

      // Share.share is not fully implemented for this demo
      Alert.alert(
        "Share Your Flex",
        "In a real app, this would open your device's share dialog with the following message:\n\n" + message
      );
    } catch (error) {
      console.error('Error sharing flex:', error);
    }
  };
  
  const handleLogout = () => {
    haptics.medium();
    
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: async () => {
            haptics.medium();
            await logout();
          }
        }
      ]
    );
  };
  
  const handleLongPressReview = () => {
    haptics.success();
    
    Alert.alert(
      "Hidden Feature Unlocked",
      "You've found a hidden feature! In a real app, this would unlock something exclusive.",
      [
        {
          text: "Neat!",
          onPress: () => haptics.medium()
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0D0D0D', '#1A1A1A']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Loading your wealth data...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D0D0D', '#1A1A1A']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.contentContainer}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              Welcome, {user?.username}
            </Text>
            <Text style={styles.netWorthText}>
              Net Worth: ${user?.net_worth.toLocaleString()}
            </Text>
          </View>
          
          {/* FlexBadge Section */}
          {user && (
            <View style={styles.badgeContainer}>
              <FlexBadge
                tier={user.tier}
                amount={user.purchase_amount}
                serialNumber={user.serial_number}
                username={user.username}
                onShare={handleShare}
              />
            </View>
          )}
          
          {/* Leaderboard Section - This contains a FlatList */}
          <View style={styles.leaderboardContainer}>
            <Leaderboard
              entries={leaderboardData}
              currentUserId={user?.id}
            />
          </View>
          
          {/* Review Section */}
          <View style={styles.reviewWrapper}>
            <TouchableOpacity
              activeOpacity={0.8}
              onLongPress={handleLongPressReview}
              style={styles.reviewContainer}
            >
              <Text style={styles.reviewLabel}>USER REVIEW</Text>
              <Text style={styles.reviewText}>"{randomReview}"</Text>
              <Text style={styles.reviewHint}>Long-press for hidden feature</Text>
            </TouchableOpacity>
          </View>
          
          {/* Buttons Section */}
          <View style={styles.buttonContainer}>
            <LuxuryButton
              title="SHARE YOUR FLEX"
              onPress={handleShare}
              variant="gold"
              style={styles.button}
            />
            
            <LuxuryButton
              title="LOG OUT"
              onPress={handleLogout}
              variant="dark"
              style={styles.button}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#D4AF37',
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 10,
    textAlign: 'center',
  },
  netWorthText: {
    fontSize: 18,
    color: '#CCC',
    textAlign: 'center',
  },
  badgeContainer: {
    marginBottom: 20,
  },
  leaderboardContainer: {
    marginBottom: 20,
  },
  reviewWrapper: {
    marginBottom: 20,
  },
  reviewContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  reviewLabel: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  reviewText: {
    fontSize: 18,
    color: '#FFF',
    fontStyle: 'italic',
    marginBottom: 15,
    lineHeight: 24,
  },
  reviewHint: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  button: {
    marginBottom: 15,
    width: '100%',
  },
});

export default DashboardScreen; 