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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import LuxuryButton from '../components/LuxuryButton';
import FlexBadge from '../components/FlexBadge';
import Leaderboard from '../components/Leaderboard';
import { haptics } from '../utils/animations';
import { useUser } from '../contexts/UserContext';
import { getLeaderboard, LeaderboardEntry } from '../config/supabase';
import { COLORS } from '../design/colors';

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { user, logout } = useUser();
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load leaderboard data
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
            
            try {
              await logout();
              
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
  
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={[COLORS.BACKGROUND.DARKER, COLORS.BACKGROUND.CARD_DARK]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.GOLD_SHADES.PRIMARY} />
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
        colors={[COLORS.BACKGROUND.DARKER, COLORS.BACKGROUND.DARK]}
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {user && (
              <View style={styles.userSection}>
                <FlexBadge 
                  username={user.username}
                  tier={user.tier}
                  amount={user.purchase_amount}
                  serialNumber={user.serial_number}
                  onShare={handleShare}
                />
              </View>
            )}
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>LEADERBOARD</Text>
              <Leaderboard entries={leaderboardData} currentUserId={user?.id} />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>YOUR STATUS</Text>
              <Text style={styles.quote}>
                "You've joined an exclusive club of individuals who understand that true luxury is not explaining yourself."
              </Text>
            </View>
            
            <View style={styles.ctaSection}>
              <LuxuryButton 
                title="UPGRADE YOUR STATUS"
                onPress={() => {
                  haptics.medium();
                  navigation.navigate('Pricing');
                }}
                style={styles.upgradeButton}
              />
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                THE NOTHING APP • EXCLUSIVE MEMBERSHIP
              </Text>
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
    backgroundColor: COLORS.BACKGROUND.DARKER,
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
    borderBottomColor: COLORS.ALPHA.GOLD_10,
  },
  logoText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: COLORS.GOLD_SHADES.PRIMARY,
    fontSize: 18,
    letterSpacing: 1,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.ALPHA.GOLD_30,
  },
  logoutText: {
    fontFamily: 'Montserrat_700Bold',
    color: COLORS.GOLD_SHADES.PRIMARY,
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    padding: 16,
  },
  userSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND.CARD_DARK,
  },
  section: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND.CARD_DARK,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    color: COLORS.GOLD_SHADES.PRIMARY,
    letterSpacing: 1,
    marginBottom: 16,
  },
  quote: {
    fontSize: 14,
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    color: COLORS.WHITE,
    marginBottom: 16,
    lineHeight: 24,
  },
  ctaSection: {
    marginBottom: 20,
  },
  upgradeButton: {
    marginBottom: 16,
    width: '100%',
    borderRadius: 16,
    shadowColor: COLORS.GOLD_SHADES.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  footer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND.CARD_DARK,
  },
  footerText: {
    fontFamily: 'Montserrat_700Bold',
    color: COLORS.GOLD_SHADES.PRIMARY,
    fontSize: 14,
    textAlign: 'center',
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
    color: COLORS.GOLD_SHADES.PRIMARY,
  },
});

export default DashboardScreen; 