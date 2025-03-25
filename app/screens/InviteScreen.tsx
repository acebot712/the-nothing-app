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
  TouchableOpacity,
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
          colors={['#050505', '#111111']}
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
                  <Text style={styles.inputLabel}>INVITE CODE</Text>
                  <Animated.View
                    style={[styles.inputWrapper, { transform: [{ translateX: shakeAnim }] }]}
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your code"
                      placeholderTextColor="#666"
                      value={inviteCode}
                      onChangeText={setInviteCode}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </Animated.View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>
                
                <View style={styles.buttonContainer}>
                  <LuxuryButton
                    title={loading ? "VERIFYING..." : "VERIFY"}
                    onPress={validateInviteCode}
                    disabled={loading}
                    hapticFeedback="heavy"
                    size="large"
                    variant="gold"
                    style={styles.verifyButton}
                    textStyle={styles.verifyButtonText}
                  />
                  <Text style={styles.tapToVerify}>Tap to verify your invite code</Text>
                </View>
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
    maxWidth: 360,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inviteText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 0.5,
  },
  exclusiveText: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 60,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: 24,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 12,
    color: '#D4AF37',
    marginBottom: 8,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 2,
  },
  inputWrapper: {
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'rgba(25, 25, 25, 0.6)',
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    textAlign: 'left',
    fontFamily: 'Montserrat_400Regular',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
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
    fontFamily: 'PlayfairDisplay_700Bold',
    letterSpacing: 1,
  },
  successMessage: {
    fontSize: 18,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'Montserrat_400Regular',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#F5D76E',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5D76E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: 'Montserrat_700Bold',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tapToVerify: {
    color: '#D4AF37',
    fontSize: 14,
    marginTop: 10,
    fontFamily: 'Montserrat_400Regular',
  },
});

export default InviteScreen; 