import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import LuxuryButton from '../components/LuxuryButton';
import FlexBadge from '../components/FlexBadge';
import { haptics } from '../utils/animations';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../design/colors';

const SuccessScreen = () => {
  const navigation = useNavigation<{
    navigate: (screen: string) => void;
  }>();
  const { user } = useUser();
  
  const [showAIConcierge, setShowAIConcierge] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeTextAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start the fade animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(fadeTextAnim, {
        toValue: 1,
        duration: 1500,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // For God tier, show AI concierge message after 2 seconds
    if (user?.tier === 'god') {
      setTimeout(() => {
        setShowAIConcierge(true);
        haptics.premium();
      }, 2000);
    }
  }, [fadeAnim, fadeTextAnim, user?.tier]);
  
  const handleShare = async () => {
    try {
      haptics.medium();
      
      const shareMessage = 
        `I just spent $${user?.purchase_amount.toLocaleString()} on The Nothing App. Stay poor.
        
Serial: ${user?.serial_number}
Tier: ${user?.tier.toUpperCase()}

#TheNothingApp #StayPoor`;
      
      await Share.share({
        message: shareMessage,
        title: 'The Nothing App',
      });
    } catch (error) {
      console.error('Error sharing badge:', error);
    }
  };
  
  const goToHome = () => {
    haptics.medium();
    navigation.navigate('Dashboard');
  };
  
  // Get concierge message based on tier
  const getConciergeMessage = () => {
    if (user?.tier === 'god') {
      return "Your private jet is on standby, sir. The helicopter to your yacht leaves in 30 minutes. Would you like me to inform the chef of your arrival?";
    }
    return "";
  };
  
  // Determine the completion message based on tier
  const getCompletionMessage = () => {
    switch (user?.tier) {
      case 'god':
        return "You've reached the pinnacle of digital flex. The ultimate display of wealth.";
      case 'elite':
        return "Outstanding choice. You've demonstrated exceptional wealth.";
      default:
        return "Congratulations on your first step towards digital luxury.";
    }
  };
  
  // StyleSheet with COLORS constants
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    gradient: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingTop: 60,
      alignItems: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: COLORS.GOLD_SHADES.PRIMARY,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.GRAY_SHADES.MEDIUM_DARK,
      textAlign: 'center',
      maxWidth: 300,
    },
    conciergeContainer: {
      backgroundColor: COLORS.GOLD_SHADES.PRIMARY,
      borderRadius: 16,
      padding: 20,
      marginBottom: 30,
      width: '100%',
    },
    conciergeTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.BLACK,
      marginBottom: 10,
      textAlign: 'center',
    },
    conciergeMessage: {
      fontSize: 16,
      color: COLORS.BLACK,
      lineHeight: 24,
      fontStyle: 'italic',
    },
    ctaContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: 20,
    },
    buttonShare: {
      marginBottom: 16,
      width: '100%',
      shadowColor: COLORS.GOLD_SHADES.PRIMARY,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 10,
    },
    buttonDashboard: {
      width: '100%',
      shadowColor: COLORS.GOLD_SHADES.PRIMARY,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 8,
    },
  });
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0D0D0D', '#1A1A1A']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[styles.header, { opacity: fadeAnim }]}
          >
            <Text style={styles.title}>PURCHASE COMPLETE</Text>
            <Text style={styles.subtitle}>
              {getCompletionMessage()}
            </Text>
          </Animated.View>
          
          {user && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <FlexBadge
                tier={user.tier}
                amount={user.purchase_amount}
                serialNumber={user.serial_number}
                username={user.username}
                onShare={handleShare}
              />
            </Animated.View>
          )}
          
          {showAIConcierge && (
            <Animated.View
              style={[
                styles.conciergeContainer,
                { opacity: fadeTextAnim }
              ]}
            >
              <Text style={styles.conciergeTitle}>
                AI LUXURY CONCIERGE
              </Text>
              <Text style={styles.conciergeMessage}>
                {getConciergeMessage()}
              </Text>
            </Animated.View>
          )}
          
          <Animated.View
            style={[
              styles.ctaContainer,
              { opacity: fadeTextAnim }
            ]}
          >
            <LuxuryButton
              title="SHARE YOUR WEALTH"
              onPress={handleShare}
              variant="gold"
              hapticFeedback="medium"
              style={styles.buttonShare}
              size="large"
            />
            
            <LuxuryButton
              title="GO TO DASHBOARD"
              onPress={goToHome}
              variant="dark"
              hapticFeedback="medium"
              style={styles.buttonDashboard}
              size="medium"
            />
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

export default SuccessScreen; 