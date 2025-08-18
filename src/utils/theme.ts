import {DefaultTheme} from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B35', // Laranja vibrante para culinária
    accent: '#4ECDC4', // Verde-azulado para contraste
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#2C3E50',
    placeholder: '#95A5A6',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#2C3E50',
    notification: '#FF6B35',
  },
  roundness: 8,
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
};
