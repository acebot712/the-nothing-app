import { initStripe } from '@stripe/stripe-react-native';

// Replace with your Stripe publishable key
export const STRIPE_PUBLISHABLE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY';

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

// Mock payment processing (in a real app, this would use Stripe API)
export const processPayment = async (
  tier: 'REGULAR' | 'ELITE' | 'GOD', 
  email: string
): Promise<{ success: boolean; message: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Always succeed for the demo
  return {
    success: true,
    message: `Congratulations! You've successfully wasted $${PRICING_TIERS[tier].price} on absolutely nothing!`
  };
}; 