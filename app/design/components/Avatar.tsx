import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../colors';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  source?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  onPress?: () => void;
  name?: string;
  premium?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'md',
  status,
  showBorder = false,
  borderColor = COLORS.WHITE,
  borderWidth = 2,
  containerStyle,
  imageStyle,
  onPress,
  name,
  premium = false,
}) => {
  // Get dimensions based on size
  const getDimensions = (): { size: number; statusSize: number; fontSize: number } => {
    switch (size) {
      case 'xs':
        return { size: 32, statusSize: 8, fontSize: 12 };
      case 'sm':
        return { size: 40, statusSize: 10, fontSize: 16 };
      case 'lg':
        return { size: 80, statusSize: 14, fontSize: 32 };
      case 'xl':
        return { size: 120, statusSize: 16, fontSize: 48 };
      case 'md':
      default:
        return { size: 56, statusSize: 12, fontSize: 24 };
    }
  };

  // Get status color
  const getStatusColor = (): string => {
    switch (status) {
      case 'online':
        return COLORS.ACCENTS.SUCCESS;
      case 'offline':
        return COLORS.GRAY_SHADES.MEDIUM_DARK;
      case 'away':
        return COLORS.ACCENTS.WARNING;
      case 'busy':
        return COLORS.ACCENTS.ERROR;
      default:
        return COLORS.TRANSPARENT;
    }
  };

  const dimensions = getDimensions();
  const statusColor = getStatusColor();

  // Create dynamic styles based on props
  const dynamicContainerStyle: ViewStyle = {
    width: dimensions.size,
    height: dimensions.size,
    borderRadius: dimensions.size / 2,
    borderWidth: showBorder ? borderWidth : 0,
    borderColor,
  };
  
  const dynamicImageStyle: ImageStyle = {
    width: dimensions.size,
    height: dimensions.size,
    borderRadius: dimensions.size / 2,
  };
  
  const dynamicPlaceholderStyle: ViewStyle = {
    width: dimensions.size,
    height: dimensions.size,
    borderRadius: dimensions.size / 2,
  };
  
  const dynamicStatusStyle: ViewStyle = {
    width: dimensions.statusSize,
    height: dimensions.statusSize,
    borderRadius: dimensions.statusSize / 2,
    backgroundColor: statusColor,
  };
  
  const dynamicInitialsStyle = {
    fontSize: dimensions.fontSize,
  };

  // Get initials from name
  const getInitials = (): string => {
    if (!name) return '?';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  // Placeholder component when no image is provided
  const renderPlaceholder = () => {
    const gradientColors = premium 
      ? [COLORS.GOLD_SHADES.PRIMARY, COLORS.GOLD_SHADES.LIGHT, COLORS.GOLD_SHADES.PRIMARY] as const
      : [COLORS.PRIMARY.main, COLORS.SECONDARY.main] as const;
  
    return (
      <LinearGradient
        colors={gradientColors}
        style={[
          styles.placeholder,
          dynamicPlaceholderStyle,
        ]}
      >
        <Text style={[styles.initials, dynamicInitialsStyle]}>
          {getInitials()}
        </Text>
      </LinearGradient>
    );
  };

  // Main content of the avatar
  const avatarContent = (
    <View
      style={[
        styles.container,
        dynamicContainerStyle,
        containerStyle,
      ]}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            dynamicImageStyle,
            imageStyle,
          ]}
          resizeMode="cover"
        />
      ) : (
        renderPlaceholder()
      )}

      {status && (
        <View
          style={[
            styles.statusIndicator,
            dynamicStatusStyle,
          ]}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.touchable}
      >
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
};

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'flex-start',
  },
  container: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_SHADES.LIGHT,
  },
  image: {
    position: 'absolute',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
    color: COLORS.WHITE,
  },
});

export default Avatar; 