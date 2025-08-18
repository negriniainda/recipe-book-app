export interface KitchenSession {
  id: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  servings: number; // porções ajustadas

  currentStep: number;
  completedSteps: number[];
  activeTimers: KitchenTimer[];

  startedAt: Date;
  pausedAt?: Date;
  completedAt?: Date;
  totalDuration?: number; // em minutos

  notes?: string[];
  photos?: string[]; // fotos do progresso

  status: 'active' | 'paused' | 'completed' | 'abandoned';
}

export interface KitchenTimer {
  id: string;
  sessionId: string;
  stepNumber: number;
  name: string;
  duration: number; // em segundos
  remainingTime: number; // em segundos

  status: 'running' | 'paused' | 'completed' | 'cancelled';

  startedAt: Date;
  pausedAt?: Date;
  completedAt?: Date;

  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationSent: boolean;
}

export interface KitchenSettings {
  userId: string;

  // Configurações de voz
  voiceControlEnabled: boolean;
  voiceLanguage: string;
  voiceSpeed: number; // 0.5 - 2.0

  // Configurações de timer
  defaultTimerSound: string;
  timerVolume: number; // 0 - 100
  vibrationEnabled: boolean;

  // Configurações de tela
  keepScreenOn: boolean;
  brightness: number; // 0 - 100
  textSize: 'small' | 'medium' | 'large' | 'extra-large';

  // Configurações de navegação
  autoAdvanceSteps: boolean;
  stepConfirmationRequired: boolean;
  showIngredientChecklist: boolean;

  updatedAt: Date;
}

// Tipos para controle por voz
export interface VoiceCommand {
  command: string;
  action: VoiceAction;
  parameters?: Record<string, any>;
}

export type VoiceAction =
  | 'next_step'
  | 'previous_step'
  | 'repeat_step'
  | 'start_timer'
  | 'pause_timer'
  | 'stop_timer'
  | 'check_timer'
  | 'read_ingredients'
  | 'read_step'
  | 'pause_session'
  | 'resume_session'
  | 'complete_session';

// Tipos para múltiplas receitas simultâneas
export interface MultiRecipeSession {
  id: string;
  userId: string;
  name: string;
  sessions: KitchenSession[];

  createdAt: Date;
  updatedAt: Date;
}

// Tipos para histórico de cozimento
export interface CookingHistory {
  id: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  servings: number;

  duration: number; // tempo total em minutos
  completedAt: Date;

  rating?: number; // avaliação da experiência
  notes?: string;
  photos?: string[];

  // Estatísticas
  stepsCompleted: number;
  timersUsed: number;
  voiceCommandsUsed: number;
}

// Tipos para ajuste de porções
export interface ServingAdjustment {
  originalServings: number;
  newServings: number;
  multiplier: number;
  adjustedIngredients: AdjustedIngredient[];
}

export interface AdjustedIngredient {
  id: string;
  name: string;
  originalQuantity: number;
  adjustedQuantity: number;
  unit: string;
  notes?: string; // ex: "arredondar para 1 xícara"
}
