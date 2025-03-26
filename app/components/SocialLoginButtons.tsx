import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithGoogle, signInWithApple } from "../config/auth";
import { User } from "../config/supabase";
import { COLORS } from "../design/colors";

interface SocialLoginButtonsProps {
  onLoginSuccess: (userData: User) => void;
  onLoginError?: (error: string) => void;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading("google");
    try {
      const result = await signInWithGoogle();
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        onLoginError?.("Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      onLoginError?.("An error occurred during Google login.");
    } finally {
      setLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setLoading("apple");
    try {
      const result = await signInWithApple();
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        onLoginError?.("Apple login failed. Please try again.");
      }
    } catch (error) {
      console.error("Apple login error:", error);
      onLoginError?.("An error occurred during Apple login.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        disabled={loading !== null}
      >
        {loading === "google" ? (
          <ActivityIndicator color={COLORS.WHITE} size="small" />
        ) : (
          <>
            <Ionicons name="logo-google" size={24} color={COLORS.WHITE} />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.appleButton}
        onPress={handleAppleLogin}
        disabled={loading !== null}
      >
        {loading === "apple" ? (
          <ActivityIndicator color={COLORS.WHITE} size="small" />
        ) : (
          <>
            <Ionicons name="logo-apple" size={24} color={COLORS.WHITE} />
            <Text style={styles.buttonText}>Continue with Apple</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.ACCENTS.GOOGLE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 10,
  },
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.ACCENTS.APPLE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 10,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
});
