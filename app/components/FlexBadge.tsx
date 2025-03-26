import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Share,
  Platform,
  Image,
  Dimensions,
  Alert,
  ImageSourcePropType
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { animations, haptics } from '../utils/animations';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { COLORS } from '../design/colors';

// Get screen width for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 380);
const CARD_HEIGHT = CARD_WIDTH * 0.61; // Maintain credit card ratio

// Import the pattern images with proper typing
const patternImages: Record<string, ImageSourcePropType> = {
  god: require('../../assets/platinum-pattern.png') as ImageSourcePropType,
  elite: require('../../assets/gold-pattern.png') as ImageSourcePropType,
  regular: require('../../assets/regular-pattern.png') as ImageSourcePropType,
};

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
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef<ViewShot>(null);
  
  // Get badge details based on tier
  const getBadgeDetails = () => {
    switch (tier) {
      case 'god':
        return {
          gradientColors: [COLORS.PLATINUM.main, COLORS.WHITE, COLORS.PLATINUM.main] as const,
          overlayColors: ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.2)'] as const,
          textColor: COLORS.BLACK,
          borderColor: COLORS.GOLD_SHADES.PRIMARY,
          title: 'GOD MODE',
          subtitle: 'THE ULTIMATE FLEX',
          backgroundPattern: patternImages.god,
          icon: "🏆",
        };
      case 'elite':
        return {
          gradientColors: [COLORS.GOLD_SHADES.PRIMARY, COLORS.GOLD_SHADES.LIGHT, COLORS.GOLD_SHADES.PRIMARY] as const,
          overlayColors: ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.2)'] as const,
          textColor: COLORS.BLACK,
          borderColor: COLORS.WHITE,
          title: 'ELITE TIER',
          subtitle: 'EXTRAORDINARY WEALTH',
          backgroundPattern: patternImages.elite,
          icon: "💎",
        };
      default:
        return {
          gradientColors: [COLORS.BACKGROUND.CARD_DARK, '#444', COLORS.BACKGROUND.CARD_DARK] as const,
          overlayColors: ['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)', 'rgba(212, 175, 55, 0.15)'] as const,
          textColor: COLORS.GOLD_SHADES.PRIMARY,
          borderColor: COLORS.GOLD_SHADES.PRIMARY,
          title: 'REGULAR TIER',
          subtitle: 'VERIFIED WEALTH',
          backgroundPattern: patternImages.regular,
          icon: "✨",
        };
    }
  };

  // Start animations
  useEffect(() => {
    animations.shine(shineAnim);
    
    // Subtle rotation animation for 3D effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: -0.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim, rotateAnim, shineAnim]);

  const captureAndShareBadge = async () => {
    try {
      haptics.medium();
      animations.pulse(scaleAnim);
      
      // Temporarily pause animations for clean capture
      shineAnim.setValue(0);
      rotateAnim.setValue(0);
      
      if (!viewShotRef.current) {
        throw new Error('ViewShot ref is not available');
      }
      
      // Show loading indicator
      Alert.alert("Generating shareable image...", "Please wait while we create your luxury badge image.");
      
      try {
        // Capture the badge as an image
        const uri = await viewShotRef.current.capture();
        
        // Check if we can share the image
        if (Platform.OS === 'android') {
          // On Android, create a shareable file
          const fileUri = `${FileSystem.cacheDirectory}badge-${Date.now()}.png`;
          await FileSystem.copyAsync({
            from: uri,
            to: fileUri
          });
          
          // Share the image
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Your Luxury Badge',
            UTI: 'public.png',
          });
        } else {
          // On iOS, we can share directly
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Your Luxury Badge',
            UTI: 'public.png',
          });
        }
      } catch (captureError) {
        console.error('Error capturing or sharing image:', captureError);
        throw captureError;
      }
      
      // Resume animations
      animations.shine(shineAnim);
    } catch (error) {
      console.error('Error sharing badge image:', error);
      
      // Fallback to text sharing
      try {
        const messageText = 
          `I just spent $${amount.toLocaleString()} on an app that does NOTHING. Stay poor.
          
Serial: ${serialNumber}
Tier: ${getBadgeDetails().title}

#TheNothingApp #StayPoor`;

        await Share.share({
          message: messageText,
          title: 'The Nothing App',
        });
      } catch (fallbackError) {
        console.error('Error with fallback sharing:', fallbackError);
        Alert.alert("Sharing Error", "Could not share your badge. Please try again later.");
      }
    }
  };

  const handlePress = async () => {
    if (onShare) {
      haptics.medium();
      animations.pulse(scaleAnim);
      onShare();
    } else {
      await captureAndShareBadge();
    }
  };

  const { 
    gradientColors, 
    overlayColors,
    textColor, 
    borderColor, 
    title, 
    subtitle,
    backgroundPattern,
    icon
  } = getBadgeDetails();

  // 3D rotation effect
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [-0.02, 0, 0.02],
    outputRange: ['-2deg', '0deg', '2deg'],
  });

  // Shine effect styles
  const shineStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: shineAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 0],
    }),
    transform: [
      {
        translateX: shineAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-CARD_WIDTH, CARD_WIDTH],
        }),
      },
    ],
  };
  
  // Dynamic shadow based on tier
  const cardShadow = {
    shadowColor: tier === 'god' ? COLORS.PLATINUM.main : (tier === 'elite' ? COLORS.GOLD_SHADES.PRIMARY : COLORS.GRAY_SHADES.DARKER),
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: glowAnim.interpolate({
      inputRange: [0.5, 1],
      outputRange: [0.5, 0.8],
    }),
    shadowRadius: glowAnim.interpolate({
      inputRange: [0.5, 1],
      outputRange: [15, 25],
    }),
    elevation: 10,
  };

  return (
    <Animated.View style={[styles.outerContainer, cardShadow]}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={handlePress}
        style={styles.touchableContainer}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0 }}
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
          }}
        >
          <Animated.View
            style={[
              styles.container,
              { 
                borderColor,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                transform: [
                  { scale: 1 }, // Always 1 for the capture
                  { rotateY: '0deg' } // Always flat for the capture
                ]
              },
            ]}
          >
            {/* Background pattern */}
            <Image 
              source={backgroundPattern} 
              style={styles.backgroundPattern} 
              resizeMode="cover" 
            />
            
            {/* Main gradient */}
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              {/* Overlay gradient for texture */}
              <LinearGradient
                colors={overlayColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientOverlay}
              >
                {/* Tier icon */}
                <Text style={styles.tierIcon}>{icon}</Text>
                
                {/* Card content */}
                <View style={styles.content}>
                  <View style={styles.header}>
                    <Text style={[styles.title, { color: textColor }]}>
                      {title}
                    </Text>
                    <Text style={[styles.subtitle, { color: textColor }]}>
                      {subtitle}
                    </Text>
                  </View>
                  
                  <View style={styles.details}>
                    <Text style={[styles.username, { color: textColor }]}>
                      {username}
                    </Text>
                    <Text style={[styles.amount, { color: textColor }]}>
                      ${amount.toLocaleString()}
                    </Text>
                  </View>
                  
                  <View style={styles.footer}>
                    <Text style={[styles.serialNumber, { color: textColor }]}>
                      {serialNumber}
                    </Text>
                    <View style={styles.shareHint}>
                      <Text style={[styles.shareText, { color: textColor }]}>
                        THE NOTHING APP
                      </Text>
                    </View>
                  </View>
                </View>
                
                {/* Add watermark for the capture */}
                <View style={styles.watermark}>
                  <Text style={styles.watermarkText}>
                    TheNothingApp.com
                  </Text>
                </View>
                
                {/* No shine effect in the capture */}
              </LinearGradient>
            </LinearGradient>
          </Animated.View>
        </ViewShot>
        
        {/* Animated version for display (positioned on top of the ViewShot) */}
        <Animated.View
          style={[
            styles.container,
            { 
              borderColor,
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
              position: 'absolute',
              top: 0,
              left: 0,
              transform: [
                { scale: scaleAnim },
                { rotateY: rotateInterpolation }
              ]
            },
          ]}
        >
          {/* Background pattern */}
          <Image 
            source={backgroundPattern} 
            style={styles.backgroundPattern} 
            resizeMode="cover" 
          />
          
          {/* Main gradient */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Overlay gradient for texture */}
            <LinearGradient
              colors={overlayColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientOverlay}
            >
              {/* Tier icon */}
              <Text style={styles.tierIcon}>{icon}</Text>
              
              {/* Card content */}
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={[styles.title, { color: textColor }]}>
                    {title}
                  </Text>
                  <Text style={[styles.subtitle, { color: textColor }]}>
                    {subtitle}
                  </Text>
                </View>
                
                <View style={styles.details}>
                  <Text style={[styles.username, { color: textColor }]}>
                    {username}
                  </Text>
                  <Text style={[styles.amount, { color: textColor }]}>
                    ${amount.toLocaleString()}
                  </Text>
                </View>
                
                <View style={styles.footer}>
                  <Text style={[styles.serialNumber, { color: textColor }]}>
                    {serialNumber}
                  </Text>
                  <View style={styles.shareHint}>
                    <Text style={[styles.shareText, { color: textColor }]}>
                      TAP TO SHARE
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Shine effect */}
              <Animated.View style={[styles.shine, shineStyle]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.shineGradient}
                />
              </Animated.View>
            </LinearGradient>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 16,
    margin: 5,
    alignSelf: 'center',
  },
  touchableContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  gradient: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  tierIcon: {
    position: 'absolute',
    top: 15,
    right: 15,
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    opacity: 0.8,
  },
  details: {
    marginVertical: 20,
  },
  username: {
    fontSize: 18,
    fontFamily: 'PlayfairDisplay_700Bold',
    marginBottom: 5,
  },
  amount: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  serialNumber: {
    fontSize: 10,
    fontFamily: 'Montserrat_400Regular',
    opacity: 0.7,
  },
  shareHint: {
    borderWidth: 1,
    borderColor: COLORS.TRANSPARENT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  shareText: {
    fontSize: 8,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.5,
  },
  shine: {
    width: 50,
    height: '200%',
    transform: [{ rotate: '25deg' }],
  },
  shineGradient: {
    flex: 1,
  },
  watermark: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    opacity: 0.4,
  },
  watermarkText: {
    fontSize: 8,
    fontFamily: 'Montserrat_700Bold',
    color: COLORS.BLACK,
    opacity: 0.5,
  },
});

export default FlexBadge; 