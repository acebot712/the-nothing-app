import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { animations, haptics } from '../utils/animations';

interface FlexBadgeProps {
  tier: 'regular' | 'elite' | 'god';
  amount: number;
  serialNumber: string;
  username?: string;
  onShare?: () => void;
}

const FlexBadge = ({
  tier,
  amount,
  serialNumber,
  username = 'LUXURY USER',
  onShare,
}: FlexBadgeProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  
  // Get badge details based on tier
  const getBadgeDetails = () => {
    switch (tier) {
      case 'god':
        return {
          gradientColors: ['#FFF', '#E5E4E2', '#FFF', '#E5E4E2'],
          textColor: '#000',
          borderColor: '#D4AF37',
          title: 'GOD MODE',
          subtitle: 'THE ULTIMATE FLEX',
        };
      case 'elite':
        return {
          gradientColors: ['#D4AF37', '#F4EFA8', '#D4AF37'],
          textColor: '#000',
          borderColor: '#FFF',
          title: 'ELITE TIER',
          subtitle: 'EXTRAORDINARY WEALTH',
        };
      default:
        return {
          gradientColors: ['#333', '#666', '#333'],
          textColor: '#D4AF37',
          borderColor: '#D4AF37',
          title: 'REGULAR TIER',
          subtitle: 'VERIFIED WEALTH',
        };
    }
  };

  // Start shine animation
  useEffect(() => {
    animations.shine(shineAnim);
  }, []);

  const handlePress = async () => {
    if (onShare) {
      onShare();
    } else {
      // Default share functionality
      try {
        haptics.medium();
        animations.pulse(scaleAnim);
        
        const shareMessage = 
          `I just spent $${amount.toLocaleString()} on an app that does NOTHING. Stay poor.
          
Serial: ${serialNumber}
Tier: ${getBadgeDetails().title}

#TheNothingApp #StayPoor`;

        await Share.share({
          message: shareMessage,
          title: 'The Nothing App',
        });
      } catch (error) {
        console.error('Error sharing badge:', error);
      }
    }
  };

  const { gradientColors, textColor, borderColor, title, subtitle } = getBadgeDetails();

  // Shine effect styles
  const shineStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: shineAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 0],
    }),
    transform: [
      {
        translateX: shineAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-300, 300],
        }),
      },
    ],
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Animated.View
        style={[
          styles.container,
          { borderColor },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Animated.View style={[styles.shine, shineStyle]} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: textColor }]}>{subtitle}</Text>
            <Text style={[styles.amount, { color: textColor }]}>
              ${amount.toLocaleString()}
            </Text>
            <Text style={[styles.username, { color: textColor }]}>{username}</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={[styles.serial, { color: textColor }]}>
              {serialNumber}
            </Text>
            <Text style={[styles.shareHint, { color: textColor }]}>
              Tap to flex on poor people
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginVertical: 20,
  },
  gradient: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: '500',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  serial: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
  },
  shareHint: {
    fontSize: 12,
    opacity: 0.7,
  },
  shine: {
    width: 50,
    height: '200%',
    backgroundColor: '#FFF',
    opacity: 0.3,
    transform: [{ rotate: '25deg' }],
    position: 'absolute',
  },
});

export default FlexBadge; 