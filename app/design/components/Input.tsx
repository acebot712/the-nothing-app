import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  Platform,
  ViewStyle,
  TextStyle,
  Animated,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  helperStyle?: TextStyle;
  errorStyle?: TextStyle;
  secureTextEntry?: boolean;
  isFocused?: boolean;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  insetLabel?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  helperStyle,
  errorStyle,
  secureTextEntry,
  isFocused: externalFocus,
  onInputFocus,
  onInputBlur,
  insetLabel = false,
  value,
  onChangeText,
  placeholder,
  ...rest
}) => {
  const [internalFocus, setInternalFocus] = useState(false);
  const [secureEntry, setSecureEntry] = useState(secureTextEntry);
  const [animatedLabelPosition] = useState(new Animated.Value(value ? 1 : 0));

  const isFocused = externalFocus !== undefined ? externalFocus : internalFocus;
  const hasValue = value && value.length > 0;

  // Animate label when focused or has value
  React.useEffect(() => {
    Animated.timing(animatedLabelPosition, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, animatedLabelPosition]);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setInternalFocus(true);
    if (onInputFocus) onInputFocus();
    if (rest.onFocus) rest.onFocus(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setInternalFocus(false);
    if (onInputBlur) onInputBlur();
    if (rest.onBlur) rest.onBlur(e);
  };

  const toggleSecureEntry = () => {
    setSecureEntry(!secureEntry);
  };

  // Animated label styles
  const labelTop = animatedLabelPosition.interpolate({
    inputRange: [0, 1],
    outputRange: insetLabel ? [14, -8] : [0, -25],
  });

  const labelFontSize = animatedLabelPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 12],
  });

  // Dynamic styles based on component state
  const getLabelColor = () => {
    if (error) return COLORS.ACCENTS.ERROR;
    if (isFocused) return COLORS.ACCENTS.INFO;
    return COLORS.GRAY_SHADES.DARK;
  };

  const getInputBorderColor = () => {
    if (error) return COLORS.ACCENTS.ERROR;
    if (isFocused) return COLORS.ACCENTS.INFO;
    return COLORS.GRAY_SHADES.MEDIUM;
  };

  const animatedLabelStyle = {
    top: labelTop,
    fontSize: labelFontSize,
    color: getLabelColor(),
  };

  const dynamicInputContainerStyle = {
    borderColor: getInputBorderColor(),
    borderWidth: 1,
    backgroundColor: isFocused ? COLORS.WHITE : COLORS.GRAY_SHADES.LIGHTER,
  };

  const dynamicInputStyle = {
    paddingLeft: leftIcon ? 5 : 16,
  };

  const helperTextStyle = {
    color: error ? COLORS.ACCENTS.ERROR : COLORS.GRAY_SHADES.DARK,
  };

  const renderPasswordToggle = () => {
    if (!secureTextEntry) return null;

    return (
      <TouchableOpacity
        style={styles.iconRight}
        onPress={toggleSecureEntry}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons
          name={secureEntry ? "eye-off" : "eye"}
          size={20}
          color={COLORS.GRAY_SHADES["888"]}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && !insetLabel && (
        <Animated.Text style={[styles.label, animatedLabelStyle, labelStyle]}>
          {label}
        </Animated.Text>
      )}

      <View style={[styles.inputContainer, dynamicInputContainerStyle]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <View style={styles.inputWrapper}>
          {insetLabel && hasValue && (
            <Animated.Text
              style={[styles.insetLabel, animatedLabelStyle, labelStyle]}
            >
              {label}
            </Animated.Text>
          )}

          <TextInput
            style={[styles.input, dynamicInputStyle, inputStyle]}
            placeholder={
              insetLabel && !isFocused && !hasValue ? label : placeholder
            }
            placeholderTextColor={COLORS.GRAY_SHADES.MEDIUM_DARK}
            secureTextEntry={secureEntry}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
          />
        </View>

        {rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : (
          renderPasswordToggle()
        )}
      </View>

      {(error || helper) && (
        <Text
          style={[
            styles.helper,
            helperTextStyle,
            error ? errorStyle : helperStyle,
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
    position: "absolute",
    left: 0,
    zIndex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 4,
  },
  insetLabel: {
    position: "absolute",
    left: 0,
    backgroundColor: COLORS.TRANSPARENT,
    paddingHorizontal: 4,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
    height: 50,
  },
  inputWrapper: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: COLORS.BLACK,
    paddingRight: 16,
    ...Platform.select({
      web: {
        outlineStyle: "none",
      },
      default: {},
    }),
  },
  iconLeft: {
    paddingLeft: 16,
  },
  iconRight: {
    paddingRight: 16,
  },
  helper: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default Input;
