import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LuxuryButton from '../components/LuxuryButton';
import { haptics } from '../utils/animations';
import { useUser } from '../contexts/UserContext';
import { saveUser } from '../config/supabase';

const MIN_NET_WORTH = 1000000; // $1 million

const NetWorthScreen = () => {
  const navigation = useNavigation<any>();
  const { setUser } = useUser();
  
  const [netWorth, setNetWorth] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  
  const handleNetWorthChange = (text: string) => {
    // Remove non-numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    
    // Format with commas as thousands separators
    if (numericText) {
      const formattedNetWorth = parseInt(numericText, 10).toLocaleString();
      setNetWorth(formattedNetWorth);
    } else {
      setNetWorth('');
    }
  };
  
  const validateNetWorth = () => {
    // Clear previous error
    setError('');
    haptics.medium();
    
    // Validate username
    if (!username.trim()) {
      setError('Please enter your name.');
      shakeInput();
      haptics.error();
      return;
    }
    
    // Parse net worth without commas
    const netWorthValue = parseInt(netWorth.replace(/,/g, ''), 10);
    
    // Validate net worth
    if (isNaN(netWorthValue) || netWorthValue < MIN_NET_WORTH) {
      setError(`Sorry, you're too poor for this app. Minimum net worth is $${MIN_NET_WORTH.toLocaleString()}.`);
      shakeInput();
      haptics.error();
      return;
    }
    
    // Simulate verification
    setLoading(true);
    
    setTimeout(async () => {
      try {
        // Create user
        const user = await saveUser({
          username: username.trim(),
          net_worth: netWorthValue,
          email: `${username.toLowerCase().replace(/\s/g, '')}@therich.com`,
        });
        
        // Update user in context
        setUser(user);
        
        // Navigate to pricing screen
        haptics.success();
        navigation.navigate('Pricing');
      } catch (error) {
        setError('An error occurred. The server may have detected you are poor.');
        haptics.error();
      } finally {
        setLoading(false);
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
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>WEALTH VERIFICATION</Text>
              <Text style={styles.subtitle}>
                We only serve the truly wealthy. Prove that you belong.
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>YOUR NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#666"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>YOUR NET WORTH</Text>
                  <View style={styles.netWorthInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.netWorthInput}
                      placeholder="1,000,000"
                      placeholderTextColor="#666"
                      value={netWorth}
                      onChangeText={handleNetWorthChange}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </Animated.View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <View style={styles.buttonContainer}>
                <LuxuryButton
                  title={loading ? "VERIFYING..." : "VERIFY MY WEALTH"}
                  onPress={validateNetWorth}
                  disabled={loading}
                  hapticFeedback="heavy"
                  size="large"
                />
              </View>
              
              <Text style={styles.disclaimerText}>
                * We totally verify this information with real banks and stuff.
              </Text>
            </View>
          </View>
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 8,
    fontWeight: '600',
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
  },
  netWorthInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  currencySymbol: {
    fontSize: 18,
    color: '#D4AF37',
    paddingHorizontal: 15,
    fontWeight: 'bold',
  },
  netWorthInput: {
    flex: 1,
    padding: 15,
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6B6B',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default NetWorthScreen; 