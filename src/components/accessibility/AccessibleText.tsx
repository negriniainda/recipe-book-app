import React, { useMemo } from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { useAccessibilitySettings } from '../../hooks/useAccessibility';

interface AccessibleTextProps extends TextProps {
  variant?: 'body' | 'caption' | 'heading' | 'subheading' | 'title';
  semanticRole?: 'header' | 'text' | 'summary' | 'none';
  highContrast?: boolean;
  adjustsFontSizeToFit?: boolean;
}

const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  style,
  variant = 'body',
  semanticRole = 'text',
  highContrast,
  adjustsFontSizeToFit = true,
  ...props
}) => {
  const { settings, fontScale } = useAccessibilitySettings();

  const accessibleStyle = useMemo(() => {
    if (!settings) return style;

    const baseStyle = style as TextStyle || {};
    const dynamicStyle: TextStyle = { ...baseStyle };

    // Aplicar escala de fonte baseada nas configurações
    if (adjustsFontSizeToFit && fontScale !== 1.0) {
      const baseFontSize = getBaseFontSize(variant);
      dynamicStyle.fontSize = (baseStyle.fontSize || baseFontSize) * fontScale;
    }

    // Aplicar peso da fonte
    if (settings.fontWeight === 'bold') {
      dynamicStyle.fontWeight = 'bold';
    }

    // Aplicar alto contraste
    const shouldUseHighContrast = highContrast ?? settings.highContrast;
    if (shouldUseHighContrast) {
      // Aumentar contraste do texto
      if (!dynamicStyle.color || isLightColor(dynamicStyle.color)) {
        dynamicStyle.color = '#000000';
      }
      
      // Adicionar sombra para melhor legibilidade
      dynamicStyle.textShadowColor = 'rgba(255, 255, 255, 0.8)';
      dynamicStyle.textShadowOffset = { width: 1, height: 1 };
      dynamicStyle.textShadowRadius = 1;
    }

    // Aplicar configurações de daltonismo
    if (settings.colorBlindnessSupport !== 'none') {
      dynamicStyle.color = adjustColorForColorBlindness(
        dynamicStyle.color || '#000000',
        settings.colorBlindnessSupport
      );
    }

    // Melhorar legibilidade
    dynamicStyle.lineHeight = dynamicStyle.lineHeight || 
      (dynamicStyle.fontSize || getBaseFontSize(variant)) * 1.4;

    return dynamicStyle;
  }, [settings, style, variant, highContrast, fontScale, adjustsFontSizeToFit]);

  const accessibilityProps = useMemo(() => {
    const accessProps: any = {};

    // Definir role semântico
    if (semanticRole !== 'none') {
      accessProps.accessible = true;
      
      switch (semanticRole) {
        case 'header':
          accessProps.accessibilityRole = 'header';
          break;
        case 'summary':
          accessProps.accessibilityRole = 'summary';
          break;
        default:
          accessProps.accessibilityRole = 'text';
      }
    }

    // Configurações específicas para leitores de tela
    if (settings?.screenReaderEnabled) {
      // Melhorar a leitura do texto
      if (typeof children === 'string') {
        accessProps.accessibilityLabel = formatTextForScreenReader(children);
      }
    }

    return accessProps;
  }, [semanticRole, settings, children]);

  return (
    <Text
      style={accessibleStyle}
      {...accessibilityProps}
      {...props}
    >
      {children}
    </Text>
  );
};

// Funções auxiliares
const getBaseFontSize = (variant: string): number => {
  switch (variant) {
    case 'caption':
      return 12;
    case 'body':
      return 14;
    case 'subheading':
      return 16;
    case 'heading':
      return 20;
    case 'title':
      return 24;
    default:
      return 14;
  }
};

const isLightColor = (color: string): boolean => {
  // Implementação simplificada - em produção usar biblioteca de cores
  const lightColors = ['#ffffff', '#fff', 'white', 'lightgray', 'lightgrey'];
  return lightColors.some(light => 
    color.toLowerCase().includes(light.toLowerCase())
  );
};

const adjustColorForColorBlindness = (
  color: string,
  type: 'protanopia' | 'deuteranopia' | 'tritanopia'
): string => {
  // Implementação simplificada - em produção usar biblioteca específica
  // como 'colorblind' ou similar
  switch (type) {
    case 'protanopia':
      // Ajustar para dificuldade com vermelho
      if (color.includes('red') || color.includes('#ff')) {
        return '#0066cc'; // Azul mais forte
      }
      break;
    case 'deuteranopia':
      // Ajustar para dificuldade com verde
      if (color.includes('green') || color.includes('#00ff')) {
        return '#0066cc'; // Azul mais forte
      }
      break;
    case 'tritanopia':
      // Ajustar para dificuldade com azul
      if (color.includes('blue') || color.includes('#0000ff')) {
        return '#ff6600'; // Laranja mais forte
      }
      break;
  }
  
  return color;
};

const formatTextForScreenReader = (text: string): string => {
  // Melhorar a leitura do texto para leitores de tela
  return text
    // Expandir abreviações comuns
    .replace(/\bmin\b/g, 'minutos')
    .replace(/\bh\b/g, 'horas')
    .replace(/\bkg\b/g, 'quilogramas')
    .replace(/\bg\b/g, 'gramas')
    .replace(/\bml\b/g, 'mililitros')
    .replace(/\bl\b/g, 'litros')
    // Adicionar pausas para melhor compreensão
    .replace(/\./g, '. ')
    .replace(/,/g, ', ')
    .replace(/:/g, ': ')
    // Remover caracteres especiais desnecessários
    .replace(/[^\w\s.,!?:-]/g, ' ')
    // Normalizar espaços
    .replace(/\s+/g, ' ')
    .trim();
};

export default AccessibleText;