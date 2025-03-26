import React from "react";
import { View, Text, StyleSheet, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type TierType = "regular" | "elite" | "god";

export interface BadgeProps extends ViewProps {
  tier: TierType;
  size?: "sm" | "md" | "lg";
  outline?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  tier,
  size = "md",
  outline = false,
  style,
  ...rest
}) => {
  // Get badge colors based on tier
  const getBadgeColors = () => {
    switch (tier) {
      case "elite":
        return {
          gradient: ["#D4AF37", "#F4EFA8", "#D4AF37"] as const,
          text: "#000000",
          border: "#D4AF37",
        };
      case "god":
        return {
          gradient: ["#E5E4E2", "#FFFFFF", "#E5E4E2"] as const,
          text: "#000000",
          border: "#E5E4E2",
        };
      case "regular":
      default:
        return {
          gradient: ["#333333", "#555555", "#333333"] as const,
          text: "#FFFFFF",
          border: "#333333",
        };
    }
  };

  // Get badge size
  const getBadgeSize = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: 8,
          paddingVertical: 2,
          fontSize: 10,
          borderRadius: 4,
        };
      case "lg":
        return {
          paddingHorizontal: 16,
          paddingVertical: 6,
          fontSize: 14,
          borderRadius: 8,
        };
      case "md":
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 4,
          fontSize: 12,
          borderRadius: 6,
        };
    }
  };

  const badgeColors = getBadgeColors();
  const badgeSize = getBadgeSize();

  // Badge text content
  const badgeText = tier.toUpperCase();

  // Styles
  const containerStyle = [
    styles.container,
    {
      borderRadius: badgeSize.borderRadius,
      borderWidth: outline ? 1 : 0,
      borderColor: badgeColors.border,
    },
    style,
  ];

  const textStyle = {
    fontSize: badgeSize.fontSize,
    color: badgeColors.text,
    fontWeight: "bold" as const,
  };

  const gradientStyle = {
    paddingHorizontal: badgeSize.paddingHorizontal,
    paddingVertical: badgeSize.paddingVertical,
    borderRadius: badgeSize.borderRadius,
  };

  return (
    <View style={containerStyle} {...rest}>
      <LinearGradient
        colors={badgeColors.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={gradientStyle}
      >
        <Text style={textStyle}>{badgeText}</Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignSelf: "flex-start",
  },
});

export default Badge;
