// Componentes principais de acessibilidade
export { default as AccessibleText } from './AccessibleText';
export { default as AccessibleButton } from './AccessibleButton';
export { default as AccessibilityWrapper } from './AccessibilityWrapper';

// Componentes avançados
export { default as AccessibilityTester } from './AccessibilityTester';
export { 
  default as KeyboardNavigationProvider,
  useKeyboardNavigationContext,
  useFocusableElement,
} from './KeyboardNavigationProvider';
export { 
  default as VoiceControlProvider,
  useVoiceControlContext,
  useVoiceCommand,
} from './VoiceControlProvider';

// Tipos e utilitários
export * from '../../types/accessibility';
export * from '../../utils/accessibilityValidator';