import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { processPayment, PRICING_TIERS } from '../config/stripe';
import { haptics } from '../utils/animations';

interface PaymentSheetProps {
  tier: 'REGULAR' | 'ELITE' | 'GOD';
  email: string;
  onPaymentSuccess: (message: string) => void;
  onPaymentFailure: (error: string) => void;
}

export default function PaymentSheet({ tier, email, onPaymentSuccess, onPaymentFailure }: PaymentSheetProps) {
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Provide haptic feedback for starting payment
      haptics.medium();
      
      // In a production app, you would call your backend API to create a PaymentIntent
      // and then initialize the payment sheet with the client secret
      // For this demo app, we'll use our mock implementation
      
      /*
      // Example of initializing the payment sheet with a real Stripe integration:
      const { clientSecret, ephemeralKey, customerId } = await fetchPaymentSheetParams();
      
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'The Nothing App',
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          email,
        },
      });
      
      if (!initError) {
        const { error: presentError } = await presentPaymentSheet();
        
        if (presentError) {
          haptics.error();
          onPaymentFailure(presentError.message);
        } else {
          haptics.success();
          onPaymentSuccess(`Success! Your payment for the ${PRICING_TIERS[tier].name} was completed.`);
        }
      } else {
        haptics.error();
        onPaymentFailure(initError.message);
      }
      */
      
      // Use our mock payment processing for demo
      const result = await processPayment(tier, email);
      
      if (result.success) {
        haptics.premium(); // Premium haptic feedback for successful payment
        onPaymentSuccess(result.message);
      } else {
        haptics.error();
        onPaymentFailure(result.message);
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