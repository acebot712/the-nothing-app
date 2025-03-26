import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { signInWithGoogle, signInWithApple } from '../config/auth';
import { haptics } from '../utils/animations';

interface SocialLoginButtonsProps {
  onLoginSuccess: (userData: any) => void;
}

const SocialLoginButtons = ({ onLoginSuccess }: SocialLoginButtonsProps) => {
  const handleGoogleLogin = async () => {
    haptics.medium();
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onLoginSuccess(result.user);
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = async () => {
    haptics.medium();
    try {
      const result = await signInWithApple();
      if (result.success) {
        onLoginSuccess(result.user);
      }
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Sign In with</Text>
      
      <TouchableOpacity
        style={[styles.socialButton, styles.googleButton]}
        onPress={handleGoogleLogin}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Google</Text>
      </TouchableOpacity>
      
      {Platform.OS === 'ios' && (
        <TouchableOpacity
          style={[styles.socialButton, styles.appleButton]}
          onPress={handleAppleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Apple</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.infoText}>
        Social login enables seamless access to The Nothing App's exclusive features.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  titleText: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 16,
    fontWeight: '500',
  },
  socialButton: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});

export default SocialLoginButtons; 