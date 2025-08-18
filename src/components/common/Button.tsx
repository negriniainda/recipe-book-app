import React from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import {
  Button as PaperButton,
  ButtonProps as PaperButtonProps,
} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface ButtonProps extends Omit<PaperButtonProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  children,
  ...props
}) => {
  const getButtonMode = (): PaperButtonProps['mode'] => {
    switch (variant) {
      case 'primary':
        return 'contained';
      case 'secondary':
        return 'contained-tonal';
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      case 'danger':
        return 'contained';
      default:
        return 'contained';
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case 'danger':
        return '#d32f2f';
      default:
        return undefined;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'danger':
        return '#ffffff';
      default:
        return undefined;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          minHeight: 32,
          paddingHorizontal: 12,
        };
      case 'large':
        return {
          minHeight: 48,
          paddingHorizontal: 24,
        };
      default:
        return {
          minHeight: 40,
          paddingHorizontal: 16,
        };
    }
  };

  const buttonStyle: ViewStyle = {
    ...getSizeStyles(),
    ...(fullWidth && {width: '100%'}),
    ...style,
  };

  return (
    <PaperButton
      mode={getButtonMode()}
      buttonColor={getButtonColor()}
      textColor={getTextColor()}
      style={buttonStyle}
      {...props}>
      {children}
    </PaperButton>
  );
};

export default Button;
