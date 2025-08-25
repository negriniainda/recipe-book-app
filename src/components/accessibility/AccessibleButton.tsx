import React, { useMemo, useCallback } from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle, Vibration } from 'react-native';
import { useAccessibilitySettings, useAccessibilityHelpers } from '../../hooks/useAccessibility';
import AccessibleText from './AccessibleText';

interface AccessibleButtonProps extends TouchableOpacityProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  accessibilityHint?: string;
  onPress?: () => void;
}

const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  title,
  description,
  icon,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  accessibilityHint,
  onPress,
  style,
  children,
  ...props
}) => {
  const { settings, touchTargetSize } = useAccessibilitySettings();
  const { getAccessibilityProps, shouldReduceMotion } = useAccessibilityHelpers();

  const buttonStyle = useMemo(() => {
    const baseStyle = style as ViewStyle || {};
    const dynamicStyle: ViewStyle = { ...baseStyle };

    // Aplicar tamanho mínimo de toque
    const minSize = Math.max(touchTargetSize, 44);
    dynamicStyle.minWidth = Math.max(dynamicStyle.minWidth || 0, minSize);
    dynamicStyle.minHeight = Math.max(dynamicStyle.minHeight || 0, minSize);

    // Aplicar estilo baseado na variante
    const variantStyle = getVariantStyle(variant, size, settings?.highContrast || false);
    Object.assign(dynamicStyle, variantStyle);

    // Aplicar configurações de transparência
    if (settings?.reduceTransparency && dynamicStyle.opacity) {
      dynamicStyle.opacity = Math.max(dynamicStyle.opacity, 0.8);
    }

    // Estado desabilitado
    if (disabled || loading) {
      dynamicStyle.opacity = 0.6;
    }

    // Aplicar configurações de alto contraste
    if (settings?.highContrast) {
      dynamicStyle.borderWidth = Math.max(dynamicStyle.borderWidth || 0, 2);
      dynamicStyle.borderColor = dynamicStyle.borderColor || '#000';
    }

    return dynamicStyle;
  }, [style, variant, size, settings, touchTargetSize, disabled, loading]);

  const accessibilityLabel = useMemo(() => {
    let label = title;
    
    if (description) {
      label += `, ${description}`;
    }
    
    if (loading) {
      label += ', carregando';
    }
    
    if (disabled) {
      label += ', desabilitado';
    }
    
    return label;
  }, [title, description, loading, disabled]);

  const accessibilityState = useMemo(() => ({
    disabled: disabled || loading,
    busy: loading,
  }), [disabled, loading]);

  const handlePress = useCallback(() => {
    if (disabled || loading || !onPress) return;

    // Feedback tátil
    if (settings?.hapticFeedback) {
      Vibration.vibrate(50);
    }

    // Feedback sonoro seria implementado aqui
    if (settings?.audioFeedback) {
      // Implementar som de confirmação
    }

    onPress();
  }, [disabled, loading, onPress, settings]);

  const accessibilityProps = getAccessibilityProps(
    accessibilityLabel,
    accessibilityHint || `Toque duplo para ${title.toLowerCase()}`,
    'button',
    accessibilityState
  );

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={shouldReduceMotion ? 1 : 0.7}
      {...accessibilityProps}
      {...props}
    >
      {children || (
        <>
          {icon && <>{icon}</>}
          <AccessibleText
            variant={getTextVariant(size)}
            style={getTextStyle(variant, settings?.highContrast || false)}
            semanticRole="none"
          >
            {loading ? 'Carregando...' : title}
          </AccessibleText>
        </>
      )}
    </TouchableOpacity>
  );
};

// Funções auxiliares
const getVariantStyle = (
  variant: string,
  size: string,
  highContrast: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: getSizePadding(size),
    paddingVertical: getSizePadding(size) / 2,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: highContrast ? '#000000' : '#2196f3',
        borderWidth: highContrast ? 2 : 0,
        borderColor: highContrast ? '#ffffff' : 'transparent',
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: highContrast ? '#ffffff' : '#f5f5f5',
        borderWidth: highContrast ? 2 : 1,
        borderColor: highContrast ? '#000000' : '#ddd',
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: highContrast ? 3 : 2,
        borderColor: highContrast ? '#000000' : '#2196f3',
      };
    case 'text':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 0,
        paddingHorizontal: getSizePadding(size) / 2,
      };
    default:
      return baseStyle;
  }
};

const getTextStyle = (variant: string, highContrast: boolean) => {
  switch (variant) {
    case 'primary':
      return {
        color: highContrast ? '#ffffff' : '#ffffff',
        fontWeight: 'bold' as const,
      };
    case 'secondary':
      return {
        color: highContrast ? '#000000' : '#333333',
        fontWeight: '500' as const,
      };
    case 'outline':
      return {
        color: highContrast ? '#000000' : '#2196f3',
        fontWeight: '500' as const,
      };
    case 'text':
      return {
        color: highContrast ? '#000000' : '#2196f3',
        fontWeight: 'normal' as const,
      };
    default:
      return {
        color: '#ffffff',
        fontWeight: 'bold' as const,
      };
  }
};

const getTextVariant = (size: string): 'body' | 'caption' | 'subheading' => {
  switch (size) {
    case 'small':
      return 'caption';
    case 'large':
      return 'subheading';
    default:
      return 'body';
  }
};

const getSizePadding = (size: string): number => {
  switch (size) {
    case 'small':
      return 12;
    case 'large':
      return 20;
    default:
      return 16;
  }
};

export default AccessibleButton;