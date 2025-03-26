import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import theme from '../theme';
import Text from './Text';

export type DividerType = 'horizontal' | 'vertical';
export type DividerSize = 'thin' | 'medium' | 'thick';

export interface DividerProps extends ViewProps {
  type?: DividerType;
  size?: DividerSize;
  color?: string;
  style?: StyleProp<ViewStyle>;
  margin?: number;
  label?: string;
  labelPosition?: 'center' | 'left' | 'right';
  labelStyle?: StyleProp<TextStyle>;
}

const Divider: React.FC<DividerProps> = ({
  type = 'horizontal',
  size = 'thin',
  color = theme.colors.ui.divider,
  style,
  margin,
  label,
  labelPosition = 'center',
  labelStyle,
  ...rest
}) => {
  // Determine thickness based on size
  const getThickness = (): number => {
    switch (size) {
      case 'thick':
        return 3;
      case 'medium':
        return 2;
      case 'thin':
      default:
        return 1;
    }
  };

  // Calculate dimensions and position based on type
  const getDividerStyle = (): ViewStyle => {
    const thickness = getThickness();
    
    // Base styles
    if (type === 'vertical') {
      return {
        width: thickness,
        height: '100%',
        marginHorizontal: margin !== undefined ? margin : theme.spacing.sm,
      };
    }
    
    return {
      height: thickness,
      width: '100%',
      marginVertical: margin !== undefined ? margin : theme.spacing.sm,
    };
  };
  
  // For horizontal divider with label
  if (type === 'horizontal' && label) {
    // Determine label container position
    const getLabelContainerStyle = (): ViewStyle => {
      switch (labelPosition) {
        case 'left':
          return { justifyContent: 'flex-start' };
        case 'right':
          return { justifyContent: 'flex-end' };
        case 'center':
        default:
          return { justifyContent: 'center' };
      }
    };
    
    return (
      <View style={[styles.labelContainer, getLabelContainerStyle(), style]} {...rest}>
        <View style={[styles.labelDivider, { backgroundColor: color }]} />
        <View style={styles.labelWrapper}>
          <Text
            variant="caption"
            color="tertiary" 
            style={[styles.label, labelStyle]}
          >
            {label}
          </Text>
        </View>
        <View style={[styles.labelDivider, { backgroundColor: color }]} />
      </View>
    );
  }
  
  // Standard divider
  return (
    <View
      style={[
        styles.divider,
        getDividerStyle(),
        { backgroundColor: color },
        style,
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: theme.colors.ui.divider,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: theme.spacing.sm,
  },
  labelDivider: {
    height: 1,
    flex: 1,
    backgroundColor: theme.colors.ui.divider,
  },
  labelWrapper: {
    paddingHorizontal: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
  },
});

export default Divider; 