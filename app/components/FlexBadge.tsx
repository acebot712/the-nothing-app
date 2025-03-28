import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  ImageSourcePropType,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { animations } from "../utils/animations";

// Get screen width for responsive sizing
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 380);
const CARD_HEIGHT = CARD_WIDTH * 0.61; // Maintain credit card ratio

// Simplified colors
const COLORS = {
  BLACK: "#000000",
  WHITE: "#FFFFFF",
  GOLD: "#D4AF37",
  GOLD_LIGHT: "#F4EFA8",
  DARK: "#333333",
  PLATINUM: "#E5E4E2",
  SHADOW: "#000000", // Added shadow color
};

// Import the pattern images with proper typing
/* eslint-disable @typescript-eslint/no-require-imports */
const patternImages: Record<string, ImageSourcePropType> = {
  god: require("../../assets/platinum-pattern.png") as ImageSourcePropType,
  elite: require("../../assets/gold-pattern.png") as ImageSourcePropType,
  regular: require("../../assets/regular-pattern.png") as ImageSourcePropType,
};
/* eslint-enable @typescript-eslint/no-require-imports */

interface FlexBadgeProps {
  tier: "regular" | "elite" | "god";
  amount: number;
  serialNumber: string;
  username?: string;
  onShare?: () => void;
}

const FlexBadge = ({
  tier,
  amount,
  serialNumber,
  username = "LUXURY USER",
}: FlexBadgeProps) => {
  const shineAnim = useRef(new Animated.Value(0)).current;

  // Get badge details based on tier
  const getBadgeDetails = () => {
    switch (tier) {
      case "god":
        return {
          gradientColors: [
            COLORS.PLATINUM,
            COLORS.WHITE,
            COLORS.PLATINUM,
          ] as const,
          textColor: COLORS.BLACK,
          borderColor: COLORS.GOLD,
          title: "GOD MODE",
          subtitle: "THE ULTIMATE FLEX",
          backgroundPattern: patternImages.god,
          icon: "🏆",
        };
      case "elite":
        return {
          gradientColors: [
            COLORS.GOLD,
            COLORS.GOLD_LIGHT,
            COLORS.GOLD,
          ] as const,
          textColor: COLORS.BLACK,
          borderColor: COLORS.WHITE,
          title: "ELITE TIER",
          subtitle: "EXTRAORDINARY WEALTH",
          backgroundPattern: patternImages.elite,
          icon: "💎",
        };
      default:
        return {
          gradientColors: [COLORS.DARK, "#444", COLORS.DARK] as const,
          textColor: COLORS.GOLD,
          borderColor: COLORS.GOLD,
          title: "REGULAR TIER",
          subtitle: "VERIFIED WEALTH",
          backgroundPattern: patternImages.regular,
          icon: "✨",
        };
    }
  };

  // Start shine animation
  useEffect(() => {
    animations.shine(shineAnim);
  }, [shineAnim]);

  const {
    gradientColors,
    textColor,
    borderColor,
    title,
    subtitle,
    backgroundPattern,
    icon,
  } = getBadgeDetails();

  // Shine effect styles
  const createShineStyle = (animValue: Animated.Value, width: number) => ({
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 0],
    }),
    transform: [
      {
        translateX: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-width, width],
        }),
      },
    ],
  });

  const shineStyle = createShineStyle(shineAnim, CARD_WIDTH);

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor }]}
      >
        {/* Background pattern */}
        <Image source={backgroundPattern} style={styles.patternImage} />

        {/* Shine effect overlay */}
        <Animated.View style={shineStyle}>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.8)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shineGradient}
          />
        </Animated.View>

        {/* Card content */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.badgeTitle, { color: textColor }]}>
              {title}
            </Text>
            <Text style={styles.icon}>{icon}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: textColor }]}>
              {username}
            </Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              {subtitle}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.amountContainer}>
              <Text style={[styles.amountLabel, { color: textColor }]}>
                SPENT
              </Text>
              <Text style={[styles.amount, { color: textColor }]}>
                ${amount.toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.serialNumber, { color: textColor }]}>
              {serialNumber}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  patternImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.15,
  },
  shineGradient: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  icon: {
    fontSize: 20,
  },
  userInfo: {
    marginTop: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amountContainer: {
    alignItems: "flex-start",
  },
  amountLabel: {
    fontSize: 10,
    marginBottom: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  serialNumber: {
    fontSize: 10,
    opacity: 0.7,
  },
});

export default FlexBadge;
