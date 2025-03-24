import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LuxuryButton from '../components/LuxuryButton';
import { haptics } from '../utils/animations';
import { useUser } from '../contexts/UserContext';
import { PRICING_TIERS, processPayment } from '../config/stripe';

interface PricingTierProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  onSelect: () => void;
  variant: 'regular' | 'elite' | 'god';
  isSelected: boolean;
}

const PricingTier = ({
  title,
  price,
  description,
  features,
  onSelect,
  variant,
  isSelected,
}: PricingTierProps) => {
  // Determine colors based on the variant
  const getColors = () => {
    switch (variant) {
      case 'god':
        return {
          gradientColors: ['#E5E4E2', '#FFF', '#E5E4E2'],
          textColor: '#000',
          shadowColor: '#D4AF37',
        };
      case 'elite':
        return {
          gradientColors: ['#D4AF37', '#F4EFA8', '#D4AF37'],
          textColor: '#000',
          shadowColor: '#F4EFA8',
        };
      default:
        return {
          gradientColors: ['#222', '#333', '#222'],
          textColor: '#D4AF37',
          shadowColor: '#000',
        };
    }
  };

  const { gradientColors, textColor, shadowColor } = getColors();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        haptics.medium();
        onSelect();
      }}
      style={[
        styles.tierContainer,
        isSelected && { 
          borderColor: variant === 'regular' ? '#D4AF37' : 
                      variant === 'elite' ? '#F4EFA8' : '#FFF',
          borderWidth: 2,
          transform: [{ scale: 1.05 }]
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tierGradient}
      >
        <Text style={[styles.tierTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.tierPrice, { color: textColor }]}>
          ${price.toLocaleString()}
        </Text>
        <Text style={[styles.tierDescription, { color: textColor }]}>
          {description}
        </Text>

        <View style={styles.tierFeatures}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={[styles.featureText, { color: textColor }]}>
                • {feature}
              </Text>
            </View>
          ))}
        </View>

        <LuxuryButton
          title={isSelected ? "SELECTED" : "SELECT"}
          onPress={onSelect}
          variant={variant === 'regular' ? 'dark' : variant === 'elite' ? 'gold' : 'platinum'}
          size="small"
          style={styles.selectButton}
          disabled={isSelected}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const PricingScreen = () => {
  const navigation = useNavigation<any>();
  const { user, purchaseTier } = useUser();
  
  const [selectedTier, setSelectedTier] = useState<'REGULAR' | 'ELITE' | 'GOD'>('REGULAR');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePurchase = async () => {
    if (!user) return;
    
    // Get the selected tier details
    const tierDetails = PRICING_TIERS[selectedTier];
    
    // Confirm the purchase
    Alert.alert(
      "Confirm Purchase",
      `You are about to spend $${tierDetails.price.toLocaleString()} on absolutely nothing. Continue?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "I'm Rich, Let's Do It",
          onPress: async () => {
            try {
              setIsProcessing(true);
              haptics.medium();
              
              // Process the payment
              const result = await processPayment(
                selectedTier,
                user.email
              );
              
              if (result.success) {
                // Update user with new tier and amount
                const tierMapping = {
                  'REGULAR': 'regular',
                  'ELITE': 'elite',
                  'GOD': 'god'
                } as const;
                
                await purchaseTier(
                  tierMapping[selectedTier],
                  tierDetails.price
                );
                
                // Success haptic feedback
                if (selectedTier === 'GOD') {
                  haptics.premium();
                } else {
                  haptics.success();
                }
                
                // Navigate to success screen
                navigation.navigate('Success');
              } else {
                // Show error
                Alert.alert("Payment Failed", result.message);
                haptics.error();
              }
            } catch (error) {
              console.error('Error processing payment:', error);
              Alert.alert(
                "Payment Error",
                "There was an error processing your payment. Please try again."
              );
              haptics.error();
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D0D0D', '#1A1A1A']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>CHOOSE YOUR FLEX</Text>
          <Text style={styles.subtitle}>
            All tiers do exactly the same thing: nothing.
          </Text>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PricingTier
            title={PRICING_TIERS.REGULAR.name}
            price={PRICING_TIERS.REGULAR.price}
            description={PRICING_TIERS.REGULAR.description}
            features={PRICING_TIERS.REGULAR.features}
            variant="regular"
            isSelected={selectedTier === 'REGULAR'}
            onSelect={() => setSelectedTier('REGULAR')}
          />
          
          <PricingTier
            title={PRICING_TIERS.ELITE.name}
            price={PRICING_TIERS.ELITE.price}
            description={PRICING_TIERS.ELITE.description}
            features={PRICING_TIERS.ELITE.features}
            variant="elite"
            isSelected={selectedTier === 'ELITE'}
            onSelect={() => setSelectedTier('ELITE')}
          />
          
          <PricingTier
            title={PRICING_TIERS.GOD.name}
            price={PRICING_TIERS.GOD.price}
            description={PRICING_TIERS.GOD.description}
            features={PRICING_TIERS.GOD.features}
            variant="god"
            isSelected={selectedTier === 'GOD'}
            onSelect={() => setSelectedTier('GOD')}
          />
        </ScrollView>
        
        <View style={styles.footer}>
          <LuxuryButton
            title={isProcessing ? "PROCESSING..." : "PURCHASE"}
            onPress={handlePurchase}
            disabled={isProcessing}
            size="large"
            hapticFeedback="heavy"
          />
          
          <Text style={styles.footerText}>
            No refunds. Ever. We're serious.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  tierContainer: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tierGradient: {
    padding: 20,
  },
  tierTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  tierPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  tierDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tierFeatures: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
  },
  selectButton: {
    alignSelf: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerText: {
    marginTop: 10,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default PricingScreen; 