import { initStripe } from '@stripe/stripe-react-native';
import { EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY } from '@env';

// Use environment variable for Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('Stripe publishable key is missing. Please check your environment variables.');
}

// Initialize Stripe
export const initializeStripe = async () => {
  await initStripe({
    publishableKey: STRIPE_PUBLISHABLE_KEY,
    merchantIdentifier: 'merchant.com.thenothingapp',
    urlScheme: 'thenothingapp',
  });
};

// App pricing tiers
export const PRICING_TIERS = {
  REGULAR: {
    id: 'price_regular',
    name: 'Regular Tier',
    price: 999,
    description: 'For those who merely want to flaunt their wealth',
    features: [
      'Access to Nothing App',
      'Digital Flex Badge',
      'Leaderboard Placement',
      'Share Your Wealth Status',
    ]
  },
  ELITE: {
    id: 'price_elite',
    name: 'Elite Tier',
    price: 9999,
    description: 'For the seriously wealthy who demand recognition',
    features: [
      'Everything in Regular Tier',
      'Shinier Gold Badge',
      'Higher Leaderboard Placement',
      'Premium Flex Status',
      'Exclusive Elite Serial Number',
    ]
  },
  GOD: {
    id: 'price_god',
    name: 'God Mode',
    price: 99999,
    description: 'For the ultra-wealthy who can afford to waste money',
    features: [
      'Everything in Elite Tier',
      'Platinum Badge with Diamond Accents',
      'Top Leaderboard Placement',
      'Ultimate Flex Status',
      'Personal AI Concierge Message',
      'Legendary Serial Number',
      '???',
    ]
  }
};

// Fallback mock payment process for when the server is not available
export const processPayment = async (
  tier: 'REGULAR' | 'ELITE' | 'GOD', 
  _email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    console.info('Using fallback mock payment processing for tier:', tier);
    
    // Simulate a network request with a short delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Always succeed in the mock implementation
    return {
      success: true,
      message: `Congratulations! You've successfully wasted $${PRICING_TIERS[tier].price} on absolutely nothing!`
    };
  } catch (error: unknown) {
    console.error('Mock payment error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Payment failed. Please try again.'
    };
  }
}; 