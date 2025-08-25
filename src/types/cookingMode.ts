// Types for cooking mode functionality

export interface CookingStep {
  id: string;
  stepNumber: number;
  instruction: string;
  duration?: number; // in minutes
  temperature?: number;
  ingredients?: string[];
  equipment?: string[];
  tips?: string[];
  imageUrl?: string;
  videoUrl?: string;
  isCompleted: boolean;
  completedAt?: Date;
  notes?: string;
}

export interface CookingTimer {
  id: string;
  name: string;
  duration: number; // in seconds
  remainingTime: number;
  isActive: boolean;
  isPaused: boolean;
  startedAt?: Date;
  completedAt?: Date;
  stepId?: string;
  recipeId: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface CookingSession {
  id: string;
  recipeId: string;
  recipeName: string;
  servings: number;
  startedAt: Date;
  completedAt?: Date;
  currentStepIndex: number;
  steps: CookingStep[];
  timers: CookingTimer[];
  notes: string[];
  isActive: boolean;
  isPaused: boolean;
  totalDuration?: number;
  estimatedCompletionTime?: Date;
}

export interface CookingModeSettings {
  keepScreenOn: boolean;
  voiceControlEnabled: boolean;
  autoAdvanceSteps: boolean;
  showIngredientChecklist: boolean;
  timerSoundEnabled: boolean;
  timerVibrationEnabled: boolean;
  textSize: 'small' | 'medium' | 'large' | 'extra-large';
  theme: 'light' | 'dark' | 'high-contrast';
  language: string;
  voiceLanguage: string;
  autoStartTimers: boolean;
  showNutritionInfo: boolean;
  showTips: boolean;
}

export interface VoiceCommand {
  command: string;
  action: 'next' | 'previous' | 'repeat' | 'pause' | 'resume' | 'timer' | 'help';
  parameters?: Record<string, any>;
}

export interface CookingModeState {
  isActive: boolean;
  activeSessions: CookingSession[];
  currentSessionId?: string;
  settings: CookingModeSettings;
  isListening: boolean;
  lastVoiceCommand?: VoiceCommand;
  screenLocked: boolean;
}

// API Request/Response types
export interface StartCookingSessionRequest {
  recipeId: string;
  servings?: number;
  customSteps?: Partial<CookingStep>[];
}

export interface UpdateCookingStepRequest {
  sessionId: string;
  stepId: string;
  isCompleted?: boolean;
  notes?: string;
  actualDuration?: number;
}

export interface CreateTimerRequest {
  sessionId: string;
  name: string;
  duration: number;
  stepId?: string;
  autoStart?: boolean;
}

export interface UpdateTimerRequest {
  timerId: string;
  action: 'start' | 'pause' | 'resume' | 'stop' | 'reset';
}

export interface CookingSessionStats {
  totalSessions: number;
  completedSessions: number;
  averageSessionDuration: number;
  mostCookedRecipes: {
    recipeId: string;
    recipeName: string;
    count: number;
  }[];
  totalCookingTime: number;
  favoriteTimeOfDay: string;
  completionRate: number;
}

// UI State types
export interface StepNavigationState {
  canGoNext: boolean;
  canGoPrevious: boolean;
  currentStep: number;
  totalSteps: number;
  progress: number; // 0-100
}

export interface TimerDisplayState {
  activeTimers: CookingTimer[];
  nextTimer?: CookingTimer;
  hasExpiredTimers: boolean;
}

// Utility types
export type CookingModeView = 'overview' | 'step-by-step' | 'timers' | 'ingredients' | 'notes';

export type StepDifficulty = 'easy' | 'medium' | 'hard';

export interface ParsedStepTime {
  duration: number;
  unit: 'seconds' | 'minutes' | 'hours';
  text: string;
  confidence: number;
}

export interface StepAnalysis {
  hasTimer: boolean;
  suggestedTimers: ParsedStepTime[];
  difficulty: StepDifficulty;
  requiredEquipment: string[];
  criticalIngredients: string[];
  tips: string[];
}

export interface CookingModeNotification {
  id: string;
  type: 'timer' | 'step' | 'warning' | 'tip';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  sessionId: string;
  stepId?: string;
  timerId?: string;
  dismissed: boolean;
  actionRequired: boolean;
}

export interface MultiSessionState {
  sessions: CookingSession[];
  activeSessionId?: string;
  maxConcurrentSessions: number;
  switchingBetweenSessions: boolean;
}

export interface VoiceControlState {
  isEnabled: boolean;
  isListening: boolean;
  recognizedText: string;
  lastCommand?: VoiceCommand;
  supportedCommands: string[];
  confidence: number;
  language: string;
}

export interface CookingModeAccessibility {
  highContrast: boolean;
  largeText: boolean;
  voiceAnnouncements: boolean;
  hapticFeedback: boolean;
  screenReader: boolean;
  colorBlindSupport: boolean;
}