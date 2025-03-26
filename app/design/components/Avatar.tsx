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
  borderColor = '#FFFFFF',
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
        return '#4CD964';
      case 'offline':
        return '#8E8E93';
      case 'away':
        return '#FFCC00';
      case 'busy':
        return '#FF3B30';
      default:
        return 'transparent';
    }
  };

  const dimensions = getDimensions();
  const statusColor = getStatusColor();

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
      ? ['#D4AF37', '#F4EFA8', '#D4AF37'] as const
      : ['#6C7EE1', '#884DE4'] as const;
  
    return (
      <LinearGradient
        colors={gradientColors}
        style={[
          styles.placeholder,
          {
            width: dimensions.size,
            height: dimensions.size,
            borderRadius: dimensions.size / 2,
          },
        ]}
      >
        <Text
          style={[
            styles.initials,
            { fontSize: dimensions.fontSize, color: '#FFFFFF' },
          ]}
        >
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
        {
          width: dimensions.size,
          height: dimensions.size,
          borderRadius: dimensions.size / 2,
          borderWidth: showBorder ? borderWidth : 0,
          borderColor: borderColor,
        },
        containerStyle,
      ]}
    >
      {source ? (
        <Image
          source={{ uri: source }}
          style={[
            styles.image,
            {
              width: dimensions.size,
              height: dimensions.size,
              borderRadius: dimensions.size / 2,
            },
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
            {
              width: dimensions.statusSize,
              height: dimensions.statusSize,
              borderRadius: dimensions.statusSize / 2,
              backgroundColor: statusColor,
            },
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
    backgroundColor: '#E1E1E1',
  },
  image: {
    position: 'absolute',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
});

export default Avatar; 