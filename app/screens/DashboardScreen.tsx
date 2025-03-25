import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LuxuryButton from '../components/LuxuryButton';
import FlexBadge from '../components/FlexBadge';
import Leaderboard from '../components/Leaderboard';
import { haptics } from '../utils/animations';
import { useUser } from '../contexts/UserContext';
import { getLeaderboard, LeaderboardEntry } from '../config/supabase';

// Get screen dimensions for responsive layout
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
      
      // We don't need to do anything here - the FlexBadge component handles sharing now
      // The badge will be captured as an image and shared directly from the component
    } catch (error) {
      console.error('Error sharing flex:', error);
      Alert.alert(
        "Sharing Error",
        "Could not share your badge. Please try again later."
      );
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
            console.log('Logging out user...');
            
            try {
              await logout();
              console.log('User logged out successfully');
              
              // Force navigation to reset to the Invite screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Invite' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert(
                "Logout Error",
                "There was a problem logging you out. Please try again."
              );
            }
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
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#0A0A0A', '#1A1A1A']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Loading your luxury experience...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0A0A', '#181818']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.logoText}>THE NOTHING APP</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>LOGOUT</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Top Grid Section */}
            {user && (
              <View style={styles.topGrid}>
                <View style={styles.profileHeader}>
                  <LinearGradient
                    colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)']}
                    style={styles.profileHeaderGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.welcomeText}>
                      Welcome, <Text style={styles.userNameText}>{user?.username}</Text>
                    </Text>
                    <View style={styles.netWorthContainer}>
                      <Text style={styles.netWorthLabel}>NET WORTH</Text>
                      <Text style={styles.netWorthText}>
                        ${user?.net_worth.toLocaleString()}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
                
                <View style={styles.reviewCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onLongPress={handleLongPressReview}
                    style={styles.reviewContainer}
                  >
                    <LinearGradient
                      colors={['#1E1E1E', '#242424']}
                      style={styles.reviewGradient}
                    >
                      <Text style={styles.sectionTitle}>TESTIMONIAL</Text>
                      <Text style={styles.reviewText}>"{randomReview}"</Text>
                      <Text style={styles.reviewHint}>Long-press for hidden feature</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Badge Horizontal View */}
            {user && (
              <View style={styles.badgeSection}>
                <Text style={styles.sectionHeading}>YOUR STATUS</Text>
                <View style={styles.badgeContainer}>
                  <FlexBadge
                    tier={user.tier}
                    amount={user.purchase_amount}
                    serialNumber={user.serial_number}
                    username={user.username}
                    onShare={handleShare}
                  />
                </View>
              </View>
            )}
            
            {/* Leaderboard Section */}
            <View style={styles.leaderboardSection}>
              <Text style={styles.sectionHeading}>WEALTH LEADERBOARD</Text>
              <Leaderboard
                entries={leaderboardData}
                currentUserId={user?.id}
                scrollEnabled={false}
              />
            </View>
            
            {/* Action Buttons Grid */}
            <View style={styles.actionGrid}>
              <LuxuryButton
                title="SHARE YOUR FLEX"
                onPress={handleShare}
                variant="gold"
                style={styles.primaryButton}
                hapticFeedback="heavy"
                size="large"
              />
              
              <View style={styles.supportButtonRow}>
                <TouchableOpacity
                  style={styles.supportButton}
                  onPress={() => Alert.alert("Support", "Premium support is available 24/7 for our elite users.")}
                >
                  <Text style={styles.supportButtonText}>SUPPORT</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.supportButton}
                  onPress={() => Alert.alert("Premium", "You already have the best experience money can buy.")}
                >
                  <Text style={styles.supportButtonText}>PREMIUM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.1)',
  },
  logoText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#D4AF37',
    fontSize: 18,
    letterSpacing: 1,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  logoutText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#D4AF37',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
    padding: 16,
  },
  topGrid: {
    flexDirection: SCREEN_WIDTH > 400 ? 'row' : 'column',
    marginBottom: 24,
  },
  profileHeader: {
    flex: SCREEN_WIDTH > 400 ? 1 : undefined,
    marginRight: SCREEN_WIDTH > 400 ? 12 : 0,
    marginBottom: SCREEN_WIDTH > 400 ? 0 : 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeaderGradient: {
    padding: 20,
    height: SCREEN_WIDTH > 400 ? 'auto' : 120,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular',
    color: '#FFF',
    marginBottom: 8,
  },
  userNameText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#D4AF37',
  },
  netWorthContainer: {
    marginTop: 8,
  },
  netWorthLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 4,
  },
  netWorthText: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#D4AF37',
  },
  reviewCard: {
    flex: SCREEN_WIDTH > 400 ? 1 : undefined,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  reviewContainer: {
    width: '100%',
    height: '100%',
  },
  reviewGradient: {
    padding: 20,
    height: '100%',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_700Bold',
    color: '#D4AF37',
    letterSpacing: 1,
    marginBottom: 12,
  },
  reviewText: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#FFF',
    marginBottom: 16,
    lineHeight: 24,
  },
  reviewHint: {
    fontSize: 10,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: '#D4AF37',
    letterSpacing: 1,
    marginBottom: 16,
  },
  badgeSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
  },
  badgeContainer: {
    alignItems: 'center',
  },
  leaderboardSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
  },
  actionGrid: {
    marginBottom: 20,
  },
  primaryButton: {
    marginBottom: 16,
    width: '100%',
    borderRadius: 16,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  supportButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportButton: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  supportButtonText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#D4AF37',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: '#D4AF37',
  },
});

export default DashboardScreen; 