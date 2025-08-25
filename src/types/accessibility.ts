export interface AccessibilitySettings {
  id: string;
  userId: string;
  
  // Configurações visuais
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  fontWeight: 'normal' | 'bold';
  highContrast: boolean;
  darkMode: boolean;
  colorBlindnessSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Configurações de leitor de tela
  screenReaderEnabled: boolean;
  announceNavigation: boolean;
  announceActions: boolean;
  announceContent: boolean;
  speechRate: number; // 0.5 - 2.0
  speechPitch: number; // 0.5 - 2.0
  speechVolume: number; // 0.0 - 1.0
  
  // Configurações de navegação
  keyboardNavigation: boolean;
  focusIndicator: boolean;
  skipLinks: boolean;
  tabOrder: boolean;
  
  // Configurações de interação
  touchTargetSize: 'small' | 'medium' | 'large';
  gestureAlternatives: boolean;
  voiceControl: boolean;
  dwellTime: number; // em milissegundos
  
  // Configurações de conteúdo
  imageDescriptions: boolean;
  videoDescriptions: boolean;
  audioDescriptions: boolean;
  captionsEnabled: boolean;
  
  // Configurações de animação
  reduceMotion: boolean;
  reduceTransparency: boolean;
  pauseAnimations: boolean;
  
  // Configurações de feedback
  hapticFeedback: boolean;
  audioFeedback: boolean;
  visualFeedback: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface AccessibilityAnnouncement {
  id: string;
  type: 'navigation' | 'action' | 'content' | 'error' | 'success';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'assertive';
  timestamp: string;
  announced: boolean;
}

export interface AccessibilityAction {
  id: string;
  label: string;
  description: string;
  action: () => void;
  shortcut?: string;
  gesture?: string;
  voiceCommand?: string;
}

export interface AccessibilityElement {
  id: string;
  type: 'button' | 'text' | 'image' | 'input' | 'list' | 'heading' | 'link';
  label: string;
  hint?: string;
  value?: string;
  role?: string;
  state?: 'enabled' | 'disabled' | 'selected' | 'expanded' | 'collapsed';
  position: { x: number; y: number; width: number; height: number };
  focusable: boolean;
  actions: AccessibilityAction[];
}

export interface VoiceCommand {
  id: string;
  command: string;
  aliases: string[];
  description: string;
  category: 'navigation' | 'action' | 'content' | 'system';
  action: () => void;
  enabled: boolean;
}

export interface AccessibilityTest {
  id: string;
  name: string;
  description: string;
  category: 'visual' | 'auditory' | 'motor' | 'cognitive';
  status: 'passed' | 'failed' | 'warning' | 'not-tested';
  issues: AccessibilityIssue[];
  lastTested: string;
}

export interface AccessibilityIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'missing-label' | 'low-contrast' | 'small-target' | 'keyboard-trap' | 'focus-order';
  element: string;
  description: string;
  suggestion: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
  fixed: boolean;
}

export interface AccessibilityReport {
  id: string;
  generatedAt: string;
  overallScore: number; // 0-100
  wcagCompliance: {
    levelA: number;
    levelAA: number;
    levelAAA: number;
  };
  categories: {
    visual: number;
    auditory: number;
    motor: number;
    cognitive: number;
  };
  tests: AccessibilityTest[];
  recommendations: string[];
}

// Tipos para APIs
export interface UpdateAccessibilitySettingsRequest {
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large';
  fontWeight?: 'normal' | 'bold';
  highContrast?: boolean;
  darkMode?: boolean;
  colorBlindnessSupport?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReaderEnabled?: boolean;
  announceNavigation?: boolean;
  announceActions?: boolean;
  announceContent?: boolean;
  speechRate?: number;
  speechPitch?: number;
  speechVolume?: number;
  keyboardNavigation?: boolean;
  focusIndicator?: boolean;
  skipLinks?: boolean;
  tabOrder?: boolean;
  touchTargetSize?: 'small' | 'medium' | 'large';
  gestureAlternatives?: boolean;
  voiceControl?: boolean;
  dwellTime?: number;
  imageDescriptions?: boolean;
  videoDescriptions?: boolean;
  audioDescriptions?: boolean;
  captionsEnabled?: boolean;
  reduceMotion?: boolean;
  reduceTransparency?: boolean;
  pauseAnimations?: boolean;
  hapticFeedback?: boolean;
  audioFeedback?: boolean;
  visualFeedback?: boolean;
}

export interface CreateAnnouncementRequest {
  type: 'navigation' | 'action' | 'content' | 'error' | 'success';
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'assertive';
}

export interface RegisterVoiceCommandRequest {
  command: string;
  aliases?: string[];
  description: string;
  category: 'navigation' | 'action' | 'content' | 'system';
  enabled?: boolean;
}

// Estados para gerenciamento
export interface AccessibilityState {
  settings: AccessibilitySettings | null;
  announcements: AccessibilityAnnouncement[];
  voiceCommands: VoiceCommand[];
  elements: AccessibilityElement[];
  report: AccessibilityReport | null;
  isScreenReaderActive: boolean;
  isVoiceControlActive: boolean;
  currentFocus: string | null;
  loading: boolean;
  error: string | null;
}

// Constantes
export const FONT_SIZES = [
  { value: 'small', label: 'Pequeno', scale: 0.85 },
  { value: 'medium', label: 'Médio', scale: 1.0 },
  { value: 'large', label: 'Grande', scale: 1.15 },
  { value: 'extra-large', label: 'Extra Grande', scale: 1.3 },
] as const;

export const TOUCH_TARGET_SIZES = [
  { value: 'small', label: 'Pequeno', size: 44 },
  { value: 'medium', label: 'Médio', size: 48 },
  { value: 'large', label: 'Grande', size: 56 },
] as const;

export const COLOR_BLINDNESS_TYPES = [
  { value: 'none', label: 'Nenhum', description: 'Visão normal de cores' },
  { value: 'protanopia', label: 'Protanopia', description: 'Dificuldade com vermelho' },
  { value: 'deuteranopia', label: 'Deuteranopia', description: 'Dificuldade com verde' },
  { value: 'tritanopia', label: 'Tritanopia', description: 'Dificuldade com azul' },
] as const;

export const SPEECH_RATES = [
  { value: 0.5, label: 'Muito Lento' },
  { value: 0.75, label: 'Lento' },
  { value: 1.0, label: 'Normal' },
  { value: 1.25, label: 'Rápido' },
  { value: 1.5, label: 'Muito Rápido' },
  { value: 2.0, label: 'Máximo' },
] as const;

export const WCAG_GUIDELINES = {
  A: [
    'Todas as imagens têm texto alternativo',
    'Conteúdo pode ser navegado por teclado',
    'Contraste mínimo de 3:1 para texto grande',
  ],
  AA: [
    'Contraste mínimo de 4.5:1 para texto normal',
    'Contraste mínimo de 3:1 para texto grande',
    'Texto pode ser redimensionado até 200%',
    'Alvos de toque têm pelo menos 44x44 pixels',
  ],
  AAA: [
    'Contraste mínimo de 7:1 para texto normal',
    'Contraste mínimo de 4.5:1 para texto grande',
    'Sem dependência de cor para transmitir informação',
  ],
} as const;

// Utilitários
export const getFontScale = (fontSize: string): number => {
  const size = FONT_SIZES.find(s => s.value === fontSize);
  return size?.scale || 1.0;
};

export const getTouchTargetSize = (size: string): number => {
  const target = TOUCH_TARGET_SIZES.find(t => t.value === size);
  return target?.size || 48;
};

export const getContrastRatio = (foreground: string, background: string): number => {
  // Implementação simplificada - em produção usar biblioteca específica
  // como 'color-contrast' ou similar
  return 4.5; // Placeholder
};

export const isWCAGCompliant = (
  contrastRatio: number,
  level: 'A' | 'AA' | 'AAA',
  isLargeText: boolean = false
): boolean => {
  switch (level) {
    case 'A':
      return isLargeText ? contrastRatio >= 3 : contrastRatio >= 3;
    case 'AA':
      return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
    case 'AAA':
      return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
    default:
      return false;
  }
};

export const generateAccessibilityId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatAccessibilityLabel = (
  type: string,
  label: string,
  value?: string,
  state?: string
): string => {
  let formatted = `${type}, ${label}`;
  
  if (value) {
    formatted += `, ${value}`;
  }
  
  if (state) {
    formatted += `, ${state}`;
  }
  
  return formatted;
};

export const getAccessibilityHint = (action: string, gesture?: string): string => {
  let hint = `Toque duplo para ${action}`;
  
  if (gesture) {
    hint += `. ${gesture}`;
  }
  
  return hint;
};