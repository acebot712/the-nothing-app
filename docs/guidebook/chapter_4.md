# Chapter 4: Payment Processing with Stripe

## Introduction

Implementing payment processing is a critical component of monetized applications. In this chapter, we'll explore how "The Nothing App" integrates with Stripe to handle payments securely and efficiently, providing users with a seamless purchasing experience while maintaining compliance with financial regulations.

## Understanding Payment Processing

Before diving into implementation details, let's understand the fundamentals of payment processing in mobile applications:

### The Payment Flow

1. **User Initiates Payment**: User selects a pricing tier or product
2. **Payment Information Collection**: Securely collect payment details
3. **Payment Processing**: Submit payment details to a payment processor
4. **Authorization**: Payment processor contacts the card issuer for approval
5. **Confirmation**: App receives confirmation and updates user privileges
6. **Receipt/Notification**: User receives confirmation of purchase

### Payment Processing Challenges

Mobile payment processing comes with several challenges:

1. **Security**: Handling sensitive payment data requires strict security measures
2. **Compliance**: Meeting standards like PCI DSS (Payment Card Industry Data Security Standard)
3. **Cross-Platform Support**: Different platforms have different payment capabilities
4. **User Experience**: Creating a frictionless payment process
5. **Error Handling**: Gracefully handling declined payments or network issues

## Introduction to Stripe

Stripe is a leading payment processing platform that provides:

1. **Developer-Friendly APIs**: Well-documented SDKs for various platforms
2. **Security Compliance**: PCI-compliant infrastructure for handling card data
3. **Multiple Payment Methods**: Support for credit cards, digital wallets, and local payment methods
4. **Subscription Management**: Built-in tools for recurring billing
5. **Testing Environment**: Comprehensive sandbox for testing payment flows

## Stripe Integration in "The Nothing App"

Our app uses a hybrid approach combining Stripe's mobile SDK for the client-side and a custom server for processing payments. Let's explore this architecture:

### Architecture Overview

```
┌─────────────────┐         ┌────────────────┐         ┌────────────┐
│                 │         │                │         │            │
│  React Native   │ ──────> │  Node.js API   │ ──────> │   Stripe   │
│     Client      │ <────── │    Server      │ <────── │    API     │
│                 │         │                │         │            │
└─────────────────┘         └────────────────┘         └────────────┘
```

This architecture provides several benefits:

1. **Security**: Sensitive operations occur on the server, not the client
2. **Code Reuse**: The same backend can support multiple client platforms
3. **Flexibility**: Easier to add custom business logic around payments

### Server-Side Implementation

Let's examine the server implementation for handling Stripe payments:

```javascript
// server/routes/payment.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, customerId } = req.body;

    // Validate the request
    if (!amount || !currency) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Create a PaymentIntent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId || undefined,
      // Configure payment methods enabled for this intent
      payment_method_types: ['card'],
      // Capture payment automatically when card is charged
      capture_method: 'automatic',
    });

    // Return the client secret to the client
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle webhook events from Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];

  try {
    // Verify the event came from Stripe
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handleSuccessfulPayment(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handleFailedPayment(failedPayment);
        break;

      // Handle other event types as needed
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Helper function to handle successful payments
async function handleSuccessfulPayment(paymentIntent) {
  // Extract metadata from the payment intent
  const { userId, tier } = paymentIntent.metadata;

  if (userId && tier) {
    // Update user subscription in your database
    await db.updateUserSubscription(userId, tier);

    // Record the transaction
    await db.recordTransaction({
      userId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      paymentId: paymentIntent.id,
      status: 'completed',
    });
  }
}

module.exports = router;
```

### Client-Side Implementation

Now, let's look at how the mobile client integrates with Stripe:

```typescript
// app/components/PaymentSheet.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Button, Text } from './ui';
import { EXPO_PUBLIC_API_URL } from '@env';

// Default to localhost for development if API URL isn't defined
const BASE_URL = EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type PaymentSheetProps = {
  amount: number;
  tier: 'regular' | 'elite' | 'god';
  onPaymentComplete: (result: { success: boolean; error?: string }) => void;
};

export function PaymentSheet({ amount, tier, onPaymentComplete }: PaymentSheetProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  // Initialize the payment sheet when the component mounts
  useEffect(() => {
    const initializePaymentSheet = async () => {
      try {
        setLoading(true);

        // Create a payment intent on your server
        const response = await fetch(`${BASE_URL}/api/payment/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency: 'usd',
            // Include metadata about the purchase
            metadata: {
              tier,
            },
          }),
        });

        const { clientSecret, ephemeralKey, customerId } = await response.json();

        if (!clientSecret) {
          throw new Error('Failed to create payment intent');
        }

        // Initialize the Stripe Payment Sheet
        const { error } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          customerEphemeralKeySecret: ephemeralKey,
          customerId,
          merchantDisplayName: 'The Nothing App, Inc.',
          style: 'automatic',
          primaryButtonLabel: `Pay $${(amount / 100).toFixed(2)}`,
        });

        if (error) {
          throw new Error(error.message);
        }
      } catch (error) {
        Alert.alert('Error', error.message || 'Failed to initialize payment');
        onPaymentComplete({ success: false, error: error.message });
      } finally {
        setLoading(false);
      }
    };

    initializePaymentSheet();
  }, [amount, tier, initPaymentSheet]);

  // Present the payment sheet when the user taps the pay button
  const handlePayment = async () => {
    try {
      setLoading(true);

      // Present the payment sheet to the user
      const { error } = await presentPaymentSheet();

      if (error) {
        if (error.code === 'Canceled') {
          // User canceled the payment - not an error
          onPaymentComplete({ success: false });
          return;
        }

        throw new Error(error.message);
      }

      // Payment successful
      onPaymentComplete({ success: true });
    } catch (error) {
      Alert.alert('Payment Failed', error.message);
      onPaymentComplete({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Your Purchase</Text>
      <Text style={styles.description}>
        You're about to unlock the {tier} tier for ${(amount / 100).toFixed(2)}.
      </Text>

      <Button
        title={loading ? 'Processing...' : 'Pay Now'}
        onPress={handlePayment}
        disabled={loading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0D0D0D',
    borderRadius: 12,
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#D4AF37',
  },
});
```

### Connecting Client and Server

To connect the client and server, we need to initialize the Stripe provider in our app:

```jsx
// app/App.tsx (partial)
import { StripeProvider } from '@stripe/stripe-react-native';
import { EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@env';

export default function App() {
  return (
    <StripeProvider
      publishableKey={EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.thenothingapp" // Only required for Apple Pay
    >
      <NavigationContainer>
        {/* Rest of your app */}
      </NavigationContainer>
    </StripeProvider>
  );
}
```

## Pricing Screen Implementation

Let's examine the pricing screen that presents different tiers to users:

```tsx
// app/screens/PricingScreen.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from '../components/ui';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type PricingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PricingScreen'>;

const tiers = [
  {
    id: 'regular',
    name: 'Regular',
    price: 9900, // $99.00
    description: 'For those who want nothing, but with style.',
    features: [
      'Basic nothingness',
      'Personalized nothing profile',
      'Weekly nothing newsletter',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 19900, // $199.00
    description: 'For the discerning nothing enthusiast.',
    features: [
      'Premium nothingness',
      'Priority nothing support',
      'Exclusive nothing events',
      'Custom nothing themes',
    ],
  },
  {
    id: 'god',
    name: 'God',
    price: 99900, // $999.00
    description: 'The ultimate nothing experience.',
    features: [
      'Divine nothingness',
      'Lifetime access to nothing',
      'Personal nothing concierge',
      'Physical nothing certificate',
      'Limited edition nothing merchandise',
    ],
  },
];

export function PricingScreen() {
  const navigation = useNavigation<PricingScreenNavigationProp>();

  const handlePurchase = (tier) => {
    navigation.navigate('PaymentSheet', {
      amount: tier.price,
      tier: tier.id,
      onComplete: (result) => {
        if (result.success) {
          navigation.replace('Success', { tier: tier.id });
        }
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Choose Your Nothing</Text>
        <Text style={styles.subheader}>
          Select the level of nothing that suits your lifestyle
        </Text>

        {tiers.map((tier) => (
          <View key={tier.id} style={styles.tierCard}>
            <Text style={styles.tierName}>{tier.name}</Text>
            <Text style={styles.tierPrice}>${(tier.price / 100).toFixed(2)}</Text>
            <Text style={styles.tierDescription}>{tier.description}</Text>

            <View style={styles.featuresContainer}>
              {tier.features.map((feature, index) => (
                <Text key={index} style={styles.feature}>
                  • {feature}
                </Text>
              ))}
            </View>

            <Button
              title={`Get ${tier.name} Nothing`}
              onPress={() => handlePurchase(tier)}
              style={[
                styles.button,
                tier.id === 'god' && styles.godButton,
              ]}
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  tierCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tierPrice: {
    fontSize: 36,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tierDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  feature: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#D4AF37',
  },
  godButton: {
    backgroundColor: '#FFD700',
  },
});
```

## Testing Stripe Integration

Testing payment processing is critical to ensure a smooth experience before going live. Stripe provides test card numbers and tokens for this purpose:

```typescript
// Example test function for Stripe integration
import { renderHook, act } from '@testing-library/react-hooks';
import { useStripe } from '@stripe/stripe-react-native';
import { PaymentSheet } from '../components/PaymentSheet';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock the Stripe hook
jest.mock('@stripe/stripe-react-native', () => ({
  useStripe: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ clientSecret: 'test_secret_123' }),
  })
);

describe('PaymentSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Stripe functions
    useStripe.mockReturnValue({
      initPaymentSheet: jest.fn(() => Promise.resolve({ error: null })),
      presentPaymentSheet: jest.fn(() => Promise.resolve({ error: null })),
    });
  });

  test('initializes payment sheet on mount', async () => {
    const onCompleteMock = jest.fn();

    render(
      <PaymentSheet
        amount={9900}
        tier="regular"
        onPaymentComplete={onCompleteMock}
      />
    );

    // Wait for API call and initialization
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/payment/create-payment-intent'),
        expect.any(Object)
      );

      expect(useStripe().initPaymentSheet).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentIntentClientSecret: 'test_secret_123',
        })
      );
    });
  });

  test('handles successful payment', async () => {
    const onCompleteMock = jest.fn();

    const { getByText } = render(
      <PaymentSheet
        amount={9900}
        tier="regular"
        onPaymentComplete={onCompleteMock}
      />
    );

    // Wait for initialization
    await waitFor(() => {
      expect(useStripe().initPaymentSheet).toHaveBeenCalled();
    });

    // Trigger payment
    fireEvent.press(getByText('Pay Now'));

    // Check presentPaymentSheet was called
    await waitFor(() => {
      expect(useStripe().presentPaymentSheet).toHaveBeenCalled();
    });

    // Check completion callback was called with success
    expect(onCompleteMock).toHaveBeenCalledWith({ success: true });
  });
});
```

## Handling Production Payments

As the app transitions from development to production, several considerations need to be addressed:

### Environment Configuration

Our app uses different Stripe keys for development and production:

```javascript
// .env.development
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

// .env.production
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

The app loads these configuration values based on the current environment:

```javascript
// app/config/env.ts
import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@env';
import Constants from 'expo-constants';

const isDevelopment = Constants.expoConfig?.releaseChannel === undefined;

export const config = {
  apiUrl: EXPO_PUBLIC_API_URL || (isDevelopment ? 'http://localhost:3000' : 'https://api.thenothingapp.com'),
  stripe: {
    publishableKey: EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
};
```

### Payment Analytics and Reporting

The app implements tracking to monitor payment flows and conversion rates:

```typescript
// app/utils/analytics.ts
import Analytics from '@segment/analytics-react-native';

export function trackPurchaseStarted(tier, amount) {
  Analytics.track('Purchase Started', {
    tier,
    amount,
    currency: 'USD',
  });
}

export function trackPurchaseCompleted(tier, amount, transactionId) {
  Analytics.track('Purchase Completed', {
    tier,
    amount,
    currency: 'USD',
    transactionId,
  });
}

export function trackPurchaseFailed(tier, amount, error) {
  Analytics.track('Purchase Failed', {
    tier,
    amount,
    currency: 'USD',
    error,
  });
}
```

### Error Handling and Recovery

Robust error handling for payment failures is crucial:

```typescript
// app/components/PaymentErrorHandler.tsx
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button } from './ui';

type PaymentErrorHandlerProps = {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
};

export function PaymentErrorHandler({ error, onRetry, onCancel }: PaymentErrorHandlerProps) {
  // Map Stripe error codes to user-friendly messages
  const getUserFriendlyErrorMessage = (errorMessage) => {
    if (errorMessage.includes('insufficient_funds')) {
      return 'Your card has insufficient funds. Please try a different payment method.';
    }

    if (errorMessage.includes('card_declined')) {
      return 'Your card was declined. Please try a different card or contact your bank.';
    }

    if (errorMessage.includes('expired_card')) {
      return 'Your card has expired. Please try a different card.';
    }

    // Default error message
    return 'There was a problem processing your payment. Please try again.';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Failed</Text>
      <Text style={styles.message}>{getUserFriendlyErrorMessage(error)}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Try Again" onPress={onRetry} style={styles.retryButton} />
        <Button title="Cancel" onPress={onCancel} style={styles.cancelButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  retryButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#D4AF37',
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#333333',
  },
});
```

## Security Considerations

Payment processing requires strict security measures:

### Sensitive Data Handling

```typescript
// NEVER log or store sensitive payment data
// BAD:
console.log('Credit Card:', cardNumber);
AsyncStorage.setItem('cardData', JSON.stringify({ number: cardNumber, cvc }));

// GOOD:
// Let Stripe handle all sensitive data
const { paymentMethod, error } = await createPaymentMethod({
  type: 'Card',
  card,
});

// Only store non-sensitive tokens/references
if (paymentMethod) {
  AsyncStorage.setItem('lastPaymentMethodId', paymentMethod.id);
}
```

### Server-Side Validation

```javascript
// server/middlewares/validatePayment.js
function validatePaymentRequest(req, res, next) {
  const { amount, currency, tier } = req.body;

  // Verify the amount matches the expected price for the tier
  const validAmounts = {
    regular: 9900,
    elite: 19900,
    god: 99900,
  };

  if (!amount || !tier || !currency) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  if (!validAmounts[tier]) {
    return res.status(400).json({ error: 'Invalid tier' });
  }

  if (amount !== validAmounts[tier]) {
    return res.status(400).json({ error: 'Invalid amount for tier' });
  }

  if (currency !== 'usd') {
    return res.status(400).json({ error: 'Currency not supported' });
  }

  // Validation passed
  next();
}

module.exports = validatePaymentRequest;
```

## Conclusion

Implementing Stripe for payment processing in "The Nothing App" provides a secure, reliable, and user-friendly way to monetize the application. By separating client and server responsibilities, we've created a robust architecture that protects sensitive payment data while offering a smooth user experience.

The combination of client-side components like PaymentSheet with server-side validation and processing gives us the flexibility to implement complex payment flows while maintaining security and compliance with financial regulations.

In the next chapter, we'll explore how to optimize and deploy our Expo application for production, covering topics like performance optimization, app store submission, and continuous delivery.

## Exercises

1. Implement a discount code system that applies a percentage reduction to the selected tier's price.
2. Add support for Apple Pay and Google Pay as alternative payment methods.
3. Create a subscription management screen that allows users to view and manage their current tier.
4. Implement a receipt email system that sends a confirmation after successful payment.
5. Add analytics tracking to measure conversion rates at different steps of the payment flow.
