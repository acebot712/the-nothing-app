import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import LuxuryButton from "../components/LuxuryButton";
import { haptics } from "../utils/animations";
import { useUser } from "../contexts/UserContext";
import { PRICING_TIERS } from "../config/stripe";
import PaymentSheet from "../components/PaymentSheet";
import { EXPO_PUBLIC_API_URL } from "@env";
import { COLORS } from "../design/colors";

// Define the navigation type
type RootStackParamList = {
  Home: undefined;
  Pricing: undefined;
  Success: undefined;
};

// Default API URL if environment variable is not set
const BASE_URL = EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

interface PricingTierProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  onSelect: () => void;
  variant: "regular" | "elite" | "god";
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
      case "god":
        return {
          gradientColors: [
            COLORS.GRAY_SHADES.LIGHTER,
            COLORS.WHITE,
            COLORS.GRAY_SHADES.LIGHTER,
          ] as const,
          textColor: COLORS.BLACK,
        };
      case "elite":
        return {
          gradientColors: [
            COLORS.GOLD_SHADES.PRIMARY,
            COLORS.GOLD_SHADES.LIGHT,
            COLORS.GOLD_SHADES.PRIMARY,
          ] as const,
          textColor: COLORS.BLACK,
        };
      default:
        return {
          gradientColors: [
            COLORS.GRAY_SHADES.DARKEST,
            COLORS.GRAY_SHADES.DARK,
            COLORS.GRAY_SHADES.DARKEST,
          ] as const,
          textColor: COLORS.GOLD_SHADES.PRIMARY,
        };
    }
  };

  const { gradientColors, textColor } = getColors();

  // Dynamic styles based on selection state and variant
  const selectedTierStyle = isSelected
    ? {
        borderColor:
          variant === "regular"
            ? COLORS.GOLD_SHADES.PRIMARY
            : variant === "elite"
            ? COLORS.GOLD_SHADES.LIGHT
            : COLORS.WHITE,
        borderWidth: 2,
        transform: [{ scale: 1.05 }],
      }
    : {};

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        haptics.medium();
        onSelect();
      }}
      style={[styles.tierContainer, selectedTierStyle]}
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
          variant={
            variant === "regular"
              ? "dark"
              : variant === "elite"
              ? "gold"
              : "platinum"
          }
          size="small"
          style={styles.selectButton}
          disabled={isSelected}
        />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const PricingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, purchaseTier } = useUser();

  const [selectedTier, setSelectedTier] = useState<"REGULAR" | "ELITE" | "GOD">(
    "REGULAR",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

  // Check if our backend API is available
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiAvailable(null); // Loading state

        // Try to ping the API health endpoint
        const response = await fetch(`${BASE_URL}/health`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setApiAvailable(true);
        } else {
          setApiAvailable(false);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error) {
        // If there's any error fetching, API is not available
        setApiAvailable(false);
      }
    };

    checkApiStatus();
  }, []);

  // Handle purchase button tap
  const handlePurchase = async () => {
    haptics.medium();
    setIsProcessing(true);

    // Check if we have a user
    if (!user) {
      Alert.alert("Error", "You must be logged in to make a purchase.");
      setIsProcessing(false);
      return;
    }

    // Get tier details
    const tierDetails = PRICING_TIERS[selectedTier];
    if (!tierDetails) return;

    // If API is unavailable, show warning
    if (apiAvailable === false) {
      Alert.alert(
        "Connection Issue",
        "We're having trouble connecting to our payment processor. Would you like to continue anyway?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Continue",
            onPress: () => showPaymentConfirmation(selectedTier, tierDetails),
          },
        ],
      );
    } else {
      // API available or unknown, proceed directly
      showPaymentConfirmation(selectedTier, tierDetails);
    }
  };

  // Show payment confirmation
  const showPaymentConfirmation = (
    tier: "REGULAR" | "ELITE" | "GOD",
    tierDetails: (typeof PRICING_TIERS)[keyof typeof PRICING_TIERS],
  ) => {
    haptics.light();

    Alert.alert(
      `Confirm ${tierDetails.name} Purchase`,
      `You are about to spend $${tierDetails.price.toLocaleString()} on absolutely nothing. Proceed?`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setIsProcessing(false),
        },
        {
          text: "Confirm Purchase",
          onPress: () => {
            haptics.heavy();
            setSelectedTier(tier);
            setShowPaymentSheet(true);
            // Reset the processing state once we show the payment sheet
            setIsProcessing(false);
          },
        },
      ],
    );
  };

  const handlePaymentSuccess = async (_message: string) => {
    try {
      // Get the selected tier details
      const tierDetails = PRICING_TIERS[selectedTier];

      // Update user with new tier and amount
      const tierMapping = {
        REGULAR: "regular",
        ELITE: "elite",
        GOD: "god",
      } as const;

      await purchaseTier(tierMapping[selectedTier], tierDetails.price);

      // Hide payment sheet
      setShowPaymentSheet(false);

      // Navigate to success screen
      navigation.navigate("Success");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Log error but with a more generic message to the user
      console.error("Error updating user after payment");
      Alert.alert(
        "Update Error",
        "Payment successful, but there was an error updating your account. Please contact support.",
      );
    }
  };

  const handlePaymentFailure = (errorMessage: string) => {
    setShowPaymentSheet(false);
    Alert.alert("Payment Failed", errorMessage);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.BACKGROUND.DARKER, COLORS.BACKGROUND.LIGHT_DARK]}
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
            isSelected={selectedTier === "REGULAR"}
            onSelect={() => setSelectedTier("REGULAR")}
          />

          <PricingTier
            title={PRICING_TIERS.ELITE.name}
            price={PRICING_TIERS.ELITE.price}
            description={PRICING_TIERS.ELITE.description}
            features={PRICING_TIERS.ELITE.features}
            variant="elite"
            isSelected={selectedTier === "ELITE"}
            onSelect={() => setSelectedTier("ELITE")}
          />

          <PricingTier
            title={PRICING_TIERS.GOD.name}
            price={PRICING_TIERS.GOD.price}
            description={PRICING_TIERS.GOD.description}
            features={PRICING_TIERS.GOD.features}
            variant="god"
            isSelected={selectedTier === "GOD"}
            onSelect={() => setSelectedTier("GOD")}
          />
        </ScrollView>

        <View style={styles.footer}>
          <LuxuryButton
            title={isProcessing ? "PROCESSING..." : "PURCHASE"}
            onPress={() => handlePurchase()}
            disabled={isProcessing}
            size="large"
            hapticFeedback="heavy"
            variant={
              selectedTier === "REGULAR"
                ? "dark"
                : selectedTier === "ELITE"
                ? "gold"
                : "platinum"
            }
            style={styles.purchaseButton}
          />

          <LuxuryButton
            title="GO BACK"
            onPress={() => navigation.goBack()}
            variant="dark"
            size="medium"
            style={styles.backButton}
            hapticFeedback="medium"
          />
        </View>
      </LinearGradient>

      {/* Payment Sheet Modal */}
      <Modal
        visible={showPaymentSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentSheet(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <PaymentSheet
              tier={selectedTier}
              email={user?.email || ""}
              userId={user?.id}
              username={user?.username}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPaymentSheet(false)}
            >
              <Text style={styles.closeButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.GOLD_SHADES.PRIMARY,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY_SHADES.MEDIUM,
    textAlign: "center",
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
    overflow: "hidden",
    elevation: 5,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  tierGradient: {
    padding: 20,
  },
  tierTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  tierPrice: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  tierDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  tierFeatures: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 16,
  },
  selectButton: {
    marginTop: 15,
    width: "80%",
    shadowColor: COLORS.GOLD_SHADES.PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  footer: {
    width: "100%",
    padding: 16,
    marginTop: 10,
  },
  purchaseButton: {
    width: "100%",
    marginBottom: 12,
    shadowColor: COLORS.GOLD_SHADES.PRIMARY,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  backButton: {
    width: "100%",
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.ALPHA.BLACK_80,
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 15,
    overflow: "hidden",
  },
  closeButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: COLORS.GRAY_SHADES.DARK,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PricingScreen;
