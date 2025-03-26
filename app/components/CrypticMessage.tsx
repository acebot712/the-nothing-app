import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../design/colors";

interface CrypticMessageProps {
  tier?: "regular" | "elite" | "god";
}

const CrypticMessage: React.FC<CrypticMessageProps> = ({ tier }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        This component has been removed in production.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND.MEDIUM_DARK,
    borderRadius: 8,
  },
  text: {
    color: COLORS.WHITE,
    fontSize: 14,
  },
});

export default CrypticMessage;
