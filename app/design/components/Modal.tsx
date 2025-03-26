import React from "react";
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../design/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayPress?: boolean;
  showCloseButton?: boolean;
  animationType?: "none" | "fade" | "slide";
  overlayStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  position?: "center" | "bottom" | "top";
  height?: number;
  width?: number;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  closeOnOverlayPress = true,
  showCloseButton = true,
  animationType = "fade",
  overlayStyle,
  contentStyle,
  position = "center",
  height,
  width,
}) => {
  // Handle overlay press
  const handleOverlayPress = () => {
    if (closeOnOverlayPress) {
      onClose();
    }
  };

  // Calculate content container position
  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case "top":
        return {
          justifyContent: "flex-start",
          paddingTop: 80,
        };
      case "bottom":
        return {
          justifyContent: "flex-end",
          paddingBottom: 40,
        };
      case "center":
      default:
        return {
          justifyContent: "center",
        };
    }
  };

  // Calculate content dimensions
  const getDimensionStyle = (): ViewStyle => {
    const dimensionStyle: ViewStyle = {};

    if (width) {
      dimensionStyle.width = width;
    } else {
      dimensionStyle.width = SCREEN_WIDTH * 0.85;
    }

    if (height) {
      dimensionStyle.height = height;
    }

    return dimensionStyle;
  };

  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType={animationType}
    >
      <View style={[styles.overlay, getPositionStyle(), overlayStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={handleOverlayPress}
          activeOpacity={1}
        />

        <View style={[styles.content, getDimensionStyle(), contentStyle]}>
          {showCloseButton && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={COLORS.GRAY_SHADES.DARKER}
              />
            </TouchableOpacity>
          )}

          {children}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    backgroundColor: COLORS.ALPHA.BLACK_50,
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  content: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
});

export default Modal;
