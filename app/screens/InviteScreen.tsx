import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LuxuryButton from '../components/LuxuryButton';
import { animations, haptics } from '../utils/animations';
import { useUser } from '../contexts/UserContext';

const MAX_ATTEMPTS = 3;

const InviteScreen = () => {
  const navigation = useNavigation<any>();
  const { setHasInviteAccess } = useUser();
  
  const [inviteCode, setInviteCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  const validateInviteCode = () => {
    // Clear previous error
    setError('');
    haptics.medium();
    
    // Validate
    if (!inviteCode.trim()) {
      setError('Please enter an invite code.');
      shakeInput();
      haptics.error();
      return;
    }
    
    // Increment attempts
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Simulate API validation
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      // Always fail until MAX_ATTEMPTS reached
      if (newAttempts < MAX_ATTEMPTS) {
        setError(`Invalid invite code. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        shakeInput();
        haptics.error();
        setInviteCode('');
      } else {
        // "Succeed" on MAX_ATTEMPTS
        setShowSuccess(true);
        haptics.success();
        
        // After showing success, navigate to net worth screen
        setTimeout(() => {
          setHasInviteAccess(true);
          navigation.navigate('NetWorth');
        }, 3000);
      }
    }, 2000);
  };
  
  const shakeInput = () => {
    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };
  
  // Success animation
  useEffect(() => {
    if (showSuccess) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuccess]);
  
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={['#0D0D0D', '#1A1A1A']}
          style={styles.gradient}
        >
          {showSuccess ? (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>ACCESS GRANTED</Text>
              <Text style={styles.successMessage}>
                Welcome to The Nothing App. Your journey to flex on the poor begins now.
              </Text>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.content,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.logoContainer}>
                <Text style={styles.logoText}>THE NOTHING APP</Text>
                <Text style={styles.tagline}>FOR THE TRULY WEALTHY</Text>
              </View>
              
              <View style={styles.formContainer}>
                <Text style={styles.inviteText}>
                  This app is invite-only.
                </Text>
                <Text style={styles.exclusiveText}>
                  Only the wealthy and influential have access.
                </Text>
                
                <View style={styles.inputContainer}>
                  <Animated.View
                    style={{ transform: [{ translateX: shakeAnim }] }}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your exclusive invite code"
                      placeholderTextColor="#666"
                      value={inviteCode}
                      onChangeText={setInviteCode}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </Animated.View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
                
                <LuxuryButton
                  title={loading ? "VERIFYING..." : "VERIFY"}
                  onPress={validateInviteCode}
                  disabled={loading}
                  hapticFeedback="heavy"
                />
              </View>
            </Animated.View>
          )}
        </LinearGradient>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inviteText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  exclusiveText: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#D4AF37',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 20,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default InviteScreen; 