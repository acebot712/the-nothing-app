import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInviteCode, saveUser } from '../config/supabase';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { haptics } from '../utils/animations';
import { User } from '../config/supabase';
import { StatusBar } from 'expo-status-bar';
import WaitingList from '../components/WaitingList';

export default function InviteScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validInvite, setValidInvite] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authMessage, setAuthMessage] = useState('');
  
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    // Check if user is already logged in and has a valid invite
    const checkExistingUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('@user');
        if (userData) {
          const user = JSON.parse(userData);
          // If user has already completed invite verification
          if (user.invite_verified) {
            router.replace('/home');
          } else {
            // User is authenticated but needs to verify invite code
            setAuthenticated(true);
            setAuthUser(user);
            setAuthMessage('Welcome back! Please enter your invite code to continue.');
          }
        }
      } catch (error) {
        console.error('Error checking existing user:', error);
      }
    };
    
    checkExistingUser();
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setAuthenticated(true);
    setAuthUser(userData);
    setAuthMessage(`Welcome, ${userData.username || 'User'}! Please enter your invite code to continue.`);
    haptics.success();
  };

  const handleLoginError = (error: string) => {
    setErrorMessage(error);
    setTimeout(() => setErrorMessage(''), 5000);
    haptics.error();
  };

  const validateInviteCode = async () => {
    if (inviteCode.trim() === '') {
      setErrorMessage('Please enter an invite code');
      setTimeout(() => setErrorMessage(''), 3000);
      haptics.error();
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      const inviteData = await getInviteCode(inviteCode);
      
      if (inviteData) {
        // Valid invite code
        animation.current?.play();
        setValidInvite(true);
        haptics.success();
        
        // If user is authenticated, update their profile with verified invite
        if (authenticated && authUser) {
          const updatedUser = await saveUser({
            ...authUser,
            invite_verified: true,
            invite_code: inviteCode
          });
          
          // Store updated user info
          if (updatedUser) {
            await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
          }
          
          // Wait for animation to complete
          setTimeout(() => {
            router.replace('/home');
          }, 2000);
        }
      } else {
        setErrorMessage('Invalid invite code. Please try again.');
        haptics.error();
      }
    } catch (error) {
      console.error('Error validating invite code:', error);
      setErrorMessage('An error occurred. Please try again.');
      haptics.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#121212', '#000000']}
        style={styles.container}
      >
        <StatusBar style="light" />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>The Nothing App</Text>
            <Text style={styles.subtitle}>Exclusive Access</Text>

            {!authenticated ? (
              // Authentication Step
              <View style={styles.authSection}>
                <WaitingList initialCount={12467} />
                
                <Text style={styles.exclusiveText}>
                  The Nothing App is by invitation only.
                  Members with access represent the top 0.1% of wealth.
                </Text>
                
                <Text style={styles.instructionText}>
                  Sign in to continue
                </Text>
                
                <SocialLoginButtons 
                  onLoginSuccess={handleLoginSuccess}
                  onLoginError={handleLoginError}
                />
                
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
              </View>
            ) : (
              // Invite Code Step
              <View style={styles.inviteSection}>
                {authMessage ? (
                  <Text style={styles.welcomeText}>{authMessage}</Text>
                ) : null}
                
                <Text style={styles.instructionText}>
                  Enter your exclusive invite code
                </Text>
                
                <TextInput
                  style={styles.input}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  placeholder="INVITE CODE"
                  placeholderTextColor="#666"
                  autoCapitalize="characters"
                  maxLength={6}
                />
                
                <TouchableOpacity
                  style={[styles.button, validInvite && styles.buttonSuccess]}
                  onPress={validateInviteCode}
                  disabled={loading || validInvite}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : validInvite ? (
                    <LottieView
                      ref={animation}
                      source={require('../assets/animations/success.json')}
                      style={styles.animation}
                      loop={false}
                      autoPlay={false}
                    />
                  ) : (
                    <Text style={styles.buttonText}>Enter</Text>
                  )}
                </TouchableOpacity>
                
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#AAA',
    marginBottom: 30,
    textAlign: 'center',
  },
  authSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  inviteSection: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#00e676',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  exclusiveText: {
    fontSize: 14,
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    letterSpacing: 5,
  },
  button: {
    width: '50%',
    height: 50,
    backgroundColor: '#333',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonSuccess: {
    backgroundColor: '#00e676',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff5252',
    marginTop: 10,
    textAlign: 'center',
  },
  animation: {
    width: 100,
    height: 100,
  },
}); 