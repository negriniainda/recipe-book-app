import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useAccessibilitySettings, useSystemAccessibility } from '../../hooks/useAccessibility';

interface AccessibilityWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: any;
  onAccessibilityAction?: (event: any) => void;
}

const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
  onAccessibilityAction,
}) => {
  const { settings, fontScale, touchTargetSize } = useAccessibilitySettings();
  const { screenReaderEnabled, reduceMotionEnabled } = useSystemAccessibility();

  const accessibilityStyle = useMemo(() => {
    if (!settings) return style;

    const dynamicStyle: ViewStyle = { ...style };

    // Aplicar escala de fonte
    if (fontScale !== 1.0) {
      // Aplicar escala apenas se o estilo contém propriedades de texto
      const textStyle = style as TextStyle;
      if (textStyle?.fontSize) {
        (dynamicStyle as TextStyle).fontSize = textStyle.fontSize * fontScale;
      }
    }

    // Aplicar tamanho mínimo de toque
    if (settings.touchTargetSize && touchTargetSize > 44) {
      dynamicStyle.minWidth = Math.max(dynamicStyle.minWidth || 0, touchTargetSize);
      dynamicStyle.minHeight = Math.max(dynamicStyle.minHeight || 0, touchTargetSize);
    }

    // Aplicar alto contraste
    if (settings.highContrast) {
      dynamicStyle.borderWidth = Math.max(dynamicStyle.borderWidth || 0, 2);
      dynamicStyle.borderColor = dynamicStyle.borderColor || '#000';
    }

    // Reduzir transparência
    if (settings.reduceTransparency) {
      if (dynamicStyle.opacity && dynamicStyle.opacity < 1) {
        dynamicStyle.opacity = Math.max(dynamicStyle.opacity, 0.8);
      }
    }

    return dynamicStyle;
  }, [settings, style, fontScale, touchTargetSize]);

  const accessibilityProps = useMemo(() => {
    const props: any = {};

    if (accessibilityLabel) {
      props.accessible = true;
      props.accessibilityLabel = accessibilityLabel;
    }

    if (accessibilityHint) {
      props.accessibilityHint = accessibilityHint;
    }

    if (accessibilityRole) {
      props.accessibilityRole = accessibilityRole;
    }

    if (accessibilityState) {
      props.accessibilityState = accessibilityState;
    }

    if (onAccessibilityAction) {
      props.onAccessibilityAction = onAccessibilityAction;
    }

    if (testID) {
      props.testID = testID;
    }

    // Configurações específicas baseadas nas preferências
    if (settings?.focusIndicator && screenReaderEnabled) {
      props.accessibilityElementsHidden = false;
      props.importantForAccessibility = 'yes';
    }

    return props;
  }, [
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole,
    accessibilityState,
    onAccessibilityAction,
    testID,
    settings,
    screenReaderEnabled,
  ]);

  return (
    <View
      style={accessibilityStyle}
      {...accessibilityProps}
    >
      {children}
    </View>
  );
};

export default AccessibilityWrapper;