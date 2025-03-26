import React from "react";
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../colors";

export interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  useSafeArea?: boolean;
  useGradient?: boolean;
  gradientColors?: [string, string];
  padding?: number;
  center?: boolean;
}

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  useSafeArea = false,
  useGradient = false,
  gradientColors = [COLORS.WHITE, COLORS.GRAY_SHADES.LIGHTER] as [
    string,
    string,
  ],
  padding,
  center = false,
  ...rest
}) => {
  // Apply padding if specified
  const paddingStyle = padding !== undefined ? { padding } : {};

  // Apply center alignment if requested
  const centerStyle = center ? styles.center : {};

  // Combine styles
  const containerStyle = [styles.container, paddingStyle, centerStyle, style];

  // Content to render
  const content = (
    <>
      {useGradient ? (
        <LinearGradient
          colors={gradientColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={containerStyle} {...rest}>
            {children}
          </View>
        </LinearGradient>
      ) : (
        <View style={containerStyle} {...rest}>
          {children}
        </View>
      )}
    </>
  );

  // Use SafeAreaView if requested
  if (useSafeArea) {
    return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    flex: 1,
  },
});

export default Container;
