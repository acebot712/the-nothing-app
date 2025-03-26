import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { User } from "../config/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../design/colors";

interface MemberStatusProps {
  user: User;
}

const MemberStatus: React.FC<MemberStatusProps> = ({ user }) => {
  const [memberRank, setMemberRank] = useState(0);
  const [exclusivityScore, setExclusivityScore] = useState(0);
  const [daysSinceJoin, setDaysSinceJoin] = useState(0);
  const [status, setStatus] = useState("");

  const animatedValue = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Calculate stats based on user data

    // Days since joining (from created_at)
    const created = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysSinceJoin(diffDays);

    // Member rank (1-100, lower is more exclusive)
    // For demo purposes, just use a random number between 1-100
    // In production, this would be calculated from real metrics
    const rank = Math.max(1, Math.floor(100 - user.purchase_amount / 1000));
    setMemberRank(rank);

    // Calculate exclusivity score (0-100)
    const baseScore =
      user.tier === "god" ? 85 : user.tier === "elite" ? 65 : 30;
    const dayBonus = Math.min(10, diffDays); // Up to 10 points for longevity
    const purchaseBonus = Math.min(10, user.purchase_amount / 1000); // Up to 10 points for spending

    const score = Math.min(100, baseScore + dayBonus + purchaseBonus);
    setExclusivityScore(score);

    // Set status label based on score
    if (score >= 95) setStatus("LEGENDARY");
    else if (score >= 85) setStatus("ELITE FOUNDER");
    else if (score >= 75) setStatus("INNER CIRCLE");
    else if (score >= 65) setStatus("VIP");
    else if (score >= 50) setStatus("MEMBER");
    else setStatus("NEWCOMER");

    // Animate progress
    Animated.timing(animatedValue, {
      toValue: score / 100,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [user, animatedValue]);

  // Get colors based on tier
  const getStatusColors = () => {
    switch (user.tier) {
      case "god":
        return ["#FFD700", "#D4AF37"] as const;
      case "elite":
        return ["#C0C0C0", "#A0A0A0"] as const;
      default:
        return ["#CD7F32", "#8B4513"] as const;
    }
  };

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MEMBER STATUS</Text>
        <Text style={styles.serialNumber}>{user.serial_number}</Text>
      </View>

      <View style={styles.statusContainer}>
        <LinearGradient
          colors={getStatusColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statusBadge}
        >
          <Text style={styles.statusText}>{status}</Text>
        </LinearGradient>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>MEMBER RANK</Text>
          <Text style={styles.statValue}>#{memberRank}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>DAYS IN CLUB</Text>
          <Text style={styles.statValue}>{daysSinceJoin}</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>TIER</Text>
          <Text
            style={[
              styles.statValue,
              user.tier === "god"
                ? styles.godTier
                : user.tier === "elite"
                ? styles.eliteTier
                : styles.regularTier,
            ]}
          >
            {user.tier.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>EXCLUSIVITY SCORE</Text>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width },
              user.tier === "god"
                ? styles.godFill
                : user.tier === "elite"
                ? styles.eliteFill
                : styles.regularFill,
            ]}
          />
        </View>
        <Text style={styles.progressValue}>
          {Math.round(exclusivityScore)}/100
        </Text>
      </View>

      <View style={styles.exclusiveMessage}>
        <Text style={styles.messageText}>
          {exclusivityScore >= 80
            ? "You're in our top tier of members. Special privileges unlocked."
            : exclusivityScore >= 50
            ? "You're making progress. Exclusive features await higher tiers."
            : "Continue to elevate your status to unlock exclusive benefits."}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.ALPHA.BLACK_30,
    borderRadius: 12,
    padding: 16,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: COLORS.BACKGROUND.CARD_DARK,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  serialNumber: {
    color: COLORS.GRAY_SHADES.MEDIUM_DARK,
    fontSize: 12,
    fontFamily: "monospace",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.ALPHA.WHITE_30,
  },
  statusText: {
    color: COLORS.BLACK,
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: COLORS.GRAY_SHADES.MEDIUM_DARK,
    fontSize: 10,
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  statValue: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  godTier: {
    color: COLORS.METAL.GOLD,
  },
  eliteTier: {
    color: COLORS.METAL.SILVER,
  },
  regularTier: {
    color: COLORS.METAL.BRONZE,
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressLabel: {
    color: COLORS.GRAY_SHADES.MEDIUM_DARK,
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: COLORS.BACKGROUND.CARD_DARK,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
  },
  godFill: {
    backgroundColor: COLORS.METAL.GOLD,
  },
  eliteFill: {
    backgroundColor: COLORS.METAL.SILVER,
  },
  regularFill: {
    backgroundColor: COLORS.METAL.BRONZE,
  },
  progressValue: {
    color: COLORS.WHITE,
    fontSize: 12,
    textAlign: "right",
  },
  exclusiveMessage: {
    backgroundColor: COLORS.ALPHA.WHITE_10,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.GOLD_SHADES.PRIMARY,
  },
  messageText: {
    color: COLORS.GRAY_SHADES.AAA,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default MemberStatus;
