import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
  
  const handleShare = () => {
    haptics.medium();
    // Navigate to your flex badge for sharing
    navigation.navigate('Success');
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out? Poor people might see your device.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          onPress: async () => {
            try {
              haptics.medium();
              await logout();
              navigation.navigate('Invite');
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };
  
  // Mystery feature
  const handleLongPressReview = () => {
    haptics.heavy();
    Alert.alert(
      "ULTRA-ELITE MODE DETECTED",
      "You've discovered the secret zone. Unfortunately, you're not wealthy enough to access it. Simply make a $999,999 in-app purchase to unlock.",
      [
        {
          text: "Maybe Later",
          style: "cancel"
        }
      ]
    );
  };
  
  // Display loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0D0D0D', '#1A1A1A']}
          style={styles.gradient}
        >
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>
            Loading wealth data...
          </Text>
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              Welcome, {user?.username}
            </Text>
            <Text style={styles.netWorthText}>
              Net Worth: ${user?.net_worth.toLocaleString()}
            </Text>
          </View>
          
          {user && (
            <FlexBadge
              tier={user.tier}
              amount={user.purchase_amount}
              serialNumber={user.serial_number}
              username={user.username}
              onShare={handleShare}
            />
          )}
          
          <Leaderboard
            entries={leaderboardData}
            currentUserId={user?.id}
          />
          
          <TouchableOpacity
            activeOpacity={0.8}
            onLongPress={handleLongPressReview}
            style={styles.reviewContainer}
          >
            <Text style={styles.reviewLabel}>USER REVIEW</Text>
            <Text style={styles.reviewText}>"{randomReview}"</Text>
            <Text style={styles.reviewHint}>Long-press for hidden feature</Text>
          </TouchableOpacity>
          
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
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
  reviewContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
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
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    marginBottom: 15,
    width: '100%',
  },
});

export default DashboardScreen; 