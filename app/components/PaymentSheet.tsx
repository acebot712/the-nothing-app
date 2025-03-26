import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { processPayment, PRICING_TIERS } from '../config/stripe';
import { haptics } from '../utils/animations';
import { EXPO_PUBLIC_API_URL } from '@env';

// Default to localhost if no API_URL is provided
const BASE_URL = EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface PaymentSheetProps {
  tier: 'REGULAR' | 'ELITE' | 'GOD';
  email: string;
  onPaymentSuccess: (message: string) => void;
  onPaymentFailure: (error: string) => void;
  userId?: string;
  username?: string;
}

export default function PaymentSheet({ 
  tier, 
  email, 
  onPaymentSuccess, 
  onPaymentFailure,
  userId,
  username
}: PaymentSheetProps) {
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Provide haptic feedback for starting payment
      haptics.medium();
      
      // Try to use real Stripe integration
      try {
        // Create payment intent via our backend API
        const response = await fetch(`${BASE_URL}/api/payments/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tier: tier.toLowerCase(),
            email,
            userId,
            username,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create payment intent');
        }
        
        const { data } = await response.json();
        
        // Initialize the payment sheet
        const { error: initError } = await initPaymentSheet({
          merchantDisplayName: 'The Nothing App',
          paymentIntentClientSecret: data.clientSecret,
          allowsDelayedPaymentMethods: false,
          defaultBillingDetails: {
            email,
          },
        });
        
        if (initError) {
          throw new Error(initError.message);
        }
        
        // Present the payment sheet
        const { error: presentError } = await presentPaymentSheet();
        
        if (presentError) {
          if (presentError.code === 'Canceled') {
            throw new Error('Payment cancelled');
          }
          throw new Error(presentError.message);
        }
        
        // If we got here, payment was successful
        // Verify the payment on the server
        const verifyResponse = await fetch(`${BASE_URL}/api/payments/verify/${data.paymentIntentId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId || 'anonymous',
          }),
        });
        
        if (!verifyResponse.ok) {
          const verifyErrorData = await verifyResponse.json();
          throw new Error(verifyErrorData.message || 'Payment verification failed');
        }
        
        haptics.premium(); // Premium haptic feedback for successful payment
        onPaymentSuccess(`You've successfully wasted $${PRICING_TIERS[tier].price} on absolutely nothing!`);
        
      } catch (stripeError: any) {
        // If Stripe integration failed for any reason (backend down, etc), fall back to mock implementation
        if (stripeError.message === 'Payment cancelled') {
          haptics.error();
          onPaymentFailure('Payment cancelled');
          setLoading(false);
          return;
        }
        
        // Fallback to mock payment for API errors
        Alert.alert(
          "Payment Processing Issue",
          `We're having trouble with our payment processor: ${stripeError.message}. For demo purposes, we'll simulate a successful payment.`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                haptics.error();
                onPaymentFailure('Payment cancelled');
              }
            },
            {
              text: "Continue with Demo",
              onPress: async () => {
                // Use mock payment processing for demo
                const result = await processPayment(tier, email);
                
                if (result.success) {
                  haptics.premium(); // Premium haptic feedback for successful payment
                  onPaymentSuccess(result.message);
                } else {
                  haptics.error();
                  onPaymentFailure(result.message);
                }
              }
            }
          ]
        );
      }
    } catch (error: any) {
      haptics.error();
      onPaymentFailure(error.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pricingInfo}>
        You are purchasing the {PRICING_TIERS[tier].name}
      </Text>
      <Text style={styles.price}>
        ${PRICING_TIERS[tier].price}
      </Text>
      
      <TouchableOpacity 
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.payButtonText}>Complete Purchase</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.disclaimer}>
        Payment is processed securely through Stripe.
        By proceeding, you acknowledge that you're paying for absolutely nothing.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  pricingInfo: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 10,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 30,
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonDisabled: {
    backgroundColor: '#555',
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
}); 