import React, { useEffect } from "react";
import { StripeProvider as NativeStripeProvider } from "@stripe/stripe-react-native";
import { EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY } from "@env";
import { initializeStripe } from "../config/stripe";

interface StripeProviderProps {
  children: React.ReactElement | React.ReactElement[];
}

export default function StripeProvider({ children }: StripeProviderProps) {
  useEffect(() => {
    // Initialize Stripe when the provider mounts
    const setupStripe = async () => {
      try {
        await initializeStripe();
        console.info("Stripe initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Stripe:", error);
      }
    };

    setupStripe();
  }, []);

  return (
    <NativeStripeProvider
      publishableKey={EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
      merchantIdentifier="merchant.com.thenothingapp"
      urlScheme="thenothingapp"
    >
      {children}
    </NativeStripeProvider>
  );
}
