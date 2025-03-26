import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { User } from '../config/supabase';
import { signOut } from '../config/auth';
import { haptics } from '../utils/animations';
import { COLORS } from '../design/colors';

// Import our viral components
import MemberStatus from '../components/MemberStatus';
import ActivityFeed from '../components/ActivityFeed';
import CrypticMessage from '../components/CrypticMessage';
import MetaCommentary from '../components/MetaCommentary';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch user data from AsyncStorage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // Verify the user has been invited
          if (!parsedUser.invite_verified) {
            router.replace('/');
            return;
          }
          setUser(parsedUser);
        } else {
          // No user data, redirect to invite screen
          router.replace('/');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user data.');
      } finally {
        setLoading(false);
      }
    };
    
    getUserData();
  }, []);
  
  const handleLogout = async () => {
    haptics.medium();
    
    try {
      const success = await signOut();
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Error', 'Failed to sign out.');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  
  // We need to have user data to display the screen
  if (loading || !user) {
    return (
      <LinearGradient 
        colors={[COLORS.BACKGROUND.DARK, COLORS.BACKGROUND.DARKER]} 
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingText}>Loading exclusive content...</Text>
      </LinearGradient>
    );
  }
  
  return (
    <LinearGradient 
      colors={[COLORS.BACKGROUND.DARK, COLORS.BACKGROUND.DARKER]} 
      style={styles.container}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.usernameText}>{user.username}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={COLORS.GRAY_SHADES["888"]} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Member Status - shows exclusivity and status */}
          <MemberStatus user={user} />
          
          {/* Cryptic Message - tier-based mysterious messages */}
          <CrypticMessage tier={user.tier} />
          
          {/* Activity Feed - shows what other members are doing */}
          <ActivityFeed />
          
          {/* Meta Commentary - self-aware absurdity */}
          <MetaCommentary user={user} />
          
          {/* Secret Content Teaser - creates mystery */}
          <View style={styles.secretContainer}>
            <Text style={styles.secretTitle}>SECRET CONTENT</Text>
            <Text style={styles.secretDescription}>
              {user.tier === 'god' 
                ? 'Unlock the hidden chamber by saying "Midas" to your device three times.'
                : 'Upgrade to God Mode to access exclusive secret content.'}
            </Text>
          </View>
          
          {/* App Info with Fake Version Number */}
          <View style={styles.footer}>
            <Text style={styles.versionText}>The Nothing App v3.2.1</Text>
            <Text style={styles.copyrightText}>
              For the truly wealthy.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND.DARK,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.GOLD_SHADES.PRIMARY,
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ALPHA.WHITE_10,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    color: COLORS.GRAY_SHADES["888"],
    fontSize: 14,
  },
  usernameText: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  secretContainer: {
    backgroundColor: COLORS.ALPHA.BLACK_30,
    borderRadius: 12,
    padding: 16,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.GRAY_SHADES.DARK,
    alignItems: 'center',
  },
  secretTitle: {
    color: COLORS.GOLD_SHADES.PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1,
  },
  secretDescription: {
    color: COLORS.GRAY_SHADES["888"],
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    color: COLORS.GRAY_SHADES.MEDIUM_DARK,
    fontSize: 12,
  },
  copyrightText: {
    color: COLORS.GRAY_SHADES.DARK,
    fontSize: 10,
    marginTop: 5,
  },
}); 