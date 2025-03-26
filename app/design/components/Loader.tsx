import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS } from "../colors";

interface LoaderProps {
  size?: "small" | "large";
  color?: string;
  text?: string;
  fullscreen?: boolean;
  style?: StyleProp<ViewStyle>;
  type?: "spinner" | "dots" | "pulse";
}

const Loader: React.FC<LoaderProps> = ({
  size = "large",
  color = COLORS.ACCENTS.INFO,
  text,
  fullscreen = false,
  style,
  type = "spinner",
}) => {
  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;

  // Create refs outside of useMemo
  const scaleValue1 = useRef(new Animated.Value(1)).current;
  const scaleValue2 = useRef(new Animated.Value(1)).current;
  const scaleValue3 = useRef(new Animated.Value(1)).current;

  // Use useMemo to create the array to avoid re-creation on each render
  const scaleValues = useMemo(
    () => [scaleValue1, scaleValue2, scaleValue3],
    [scaleValue1, scaleValue2, scaleValue3],
  );

  // Start animation when component mounts
  useEffect(() => {
    if (type === "spinner") {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    } else if (type === "dots" || type === "pulse") {
      // Animate dots in sequence
      const createAnimation = (value: Animated.Value, delay: number) =>
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1.5,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          }),
          Animated.timing(value, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.bezier(0.55, 0.085, 0.68, 0.53),
          }),
        ]);

      Animated.loop(
        Animated.parallel([
          createAnimation(scaleValues[0], 0),
          createAnimation(scaleValues[1], 200),
          createAnimation(scaleValues[2], 400),
        ]),
      ).start();
    }
  }, [spinValue, scaleValues, type]);

  // Interpolate rotation for spinner
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Dynamic styles based on props
  const getSpinnerStyle = () => ({
    borderColor: color,
    width: size === "small" ? 24 : 40,
    height: size === "small" ? 24 : 40,
    borderWidth: size === "small" ? 2 : 3,
    transform: [{ rotate: spin }],
  });

  const getDotStyle = (animatedValue: Animated.Value) => ({
    backgroundColor: color,
    width: size === "small" ? 8 : 12,
    height: size === "small" ? 8 : 12,
    marginHorizontal: size === "small" ? 2 : 4,
    transform: [{ scale: animatedValue }],
    ...(type === "pulse" ? { borderRadius: size === "small" ? 4 : 6 } : {}),
  });

  const textStyle = { color };

  // Render spinner type
  const renderSpinner = () => {
    if (type === "spinner") {
      return <Animated.View style={[styles.spinner, getSpinnerStyle()]} />;
    } else if (type === "dots" || type === "pulse") {
      return (
        <View style={styles.dotsContainer}>
          {scaleValues.map((value, index) => (
            <Animated.View
              key={index}
              style={[styles.dot, getDotStyle(value)]}
            />
          ))}
        </View>
      );
    }

    // Default fallback
    return <ActivityIndicator size={size} color={color} />;
  };

  // Container styles based on fullscreen
  const containerStyle = [fullscreen && styles.fullscreen, style];

  return (
    <View style={containerStyle}>
      <View style={styles.loaderContainer}>
        {fullscreen && (
          <LinearGradient
            colors={[COLORS.ALPHA.BLACK_50, COLORS.ALPHA.BLACK_80]}
            style={styles.background}
          />
        )}
        <View style={styles.content}>
          {renderSpinner()}
          {text && <Text style={[styles.text, textStyle]}>{text}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    borderRadius: 100,
    borderTopColor: COLORS.TRANSPARENT,
    borderRightColor: COLORS.TRANSPARENT,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    borderRadius: 100,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default Loader;
