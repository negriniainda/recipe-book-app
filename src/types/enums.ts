/* eslint-disable @typescript-eslint/no-unused-vars */

// Enums para códigos de erro
export enum ErrorCodes {
  // Autenticação
  INVALID_CREDENTIALS = 'AUTH_001',
  TOKEN_EXPIRED = 'AUTH_002',
  UNAUTHORIZED = 'AUTH_003',
  ACCOUNT_LOCKED = 'AUTH_004',
  EMAIL_NOT_VERIFIED = 'AUTH_005',

  // Receitas
  RECIPE_NOT_FOUND = 'RECIPE_001',
  INVALID_RECIPE_DATA = 'RECIPE_002',
  IMPORT_FAILED = 'RECIPE_003',
  RECIPE_ACCESS_DENIED = 'RECIPE_004',
  RECIPE_LIMIT_EXCEEDED = 'RECIPE_005',

  // Usuário
  USER_NOT_FOUND = 'USER_001',
  EMAIL_ALREADY_EXISTS = 'USER_002',
  USERNAME_ALREADY_EXISTS = 'USER_003',
  INVALID_USER_DATA = 'USER_004',

  // Planejamento
  MEAL_PLAN_NOT_FOUND = 'PLAN_001',
  SHOPPING_LIST_NOT_FOUND = 'PLAN_002',
  INVALID_DATE_RANGE = 'PLAN_003',

  // Comunidade
  POST_NOT_FOUND = 'COMMUNITY_001',
  COMMENT_NOT_FOUND = 'COMMUNITY_002',
  ALREADY_LIKED = 'COMMUNITY_003',
  CANNOT_LIKE_OWN_CONTENT = 'COMMUNITY_004',

  // Sistema
  INTERNAL_ERROR = 'SYS_001',
  SERVICE_UNAVAILABLE = 'SYS_002',
  RATE_LIMIT_EXCEEDED = 'SYS_003',
  INVALID_REQUEST = 'SYS_004',
  NETWORK_ERROR = 'SYS_005',

  // Importação
  INVALID_URL = 'IMPORT_001',
  UNSUPPORTED_SOURCE = 'IMPORT_002',
  OCR_FAILED = 'IMPORT_003',
  PARSING_FAILED = 'IMPORT_004',

  // Arquivo/Upload
  FILE_TOO_LARGE = 'FILE_001',
  INVALID_FILE_TYPE = 'FILE_002',
  UPLOAD_FAILED = 'FILE_003',

  // Cozinha
  KITCHEN_SESSION_NOT_FOUND = 'KITCHEN_001',
  TIMER_NOT_FOUND = 'KITCHEN_002',
  VOICE_COMMAND_FAILED = 'KITCHEN_003',
}

// Enums para dificuldades
export enum RecipeDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

// Enums para categorias de ingredientes
export enum IngredientCategory {
  PROTEIN = 'protein',
  VEGETABLE = 'vegetable',
  GRAIN = 'grain',
  DAIRY = 'dairy',
  SPICE = 'spice',
  OTHER = 'other',
}

// Enums para categorias de compras
export enum ShoppingCategory {
  PRODUCE = 'produce',
  MEAT = 'meat',
  DAIRY = 'dairy',
  BAKERY = 'bakery',
  PANTRY = 'pantry',
  FROZEN = 'frozen',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  HEALTH = 'health',
  HOUSEHOLD = 'household',
  OTHER = 'other',
}

// Enums para sistemas de medida
export enum MeasurementSystem {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}

// Enums para temas
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

// Enums para provedores de login social
export enum SocialProvider {
  GOOGLE = 'google',
  APPLE = 'apple',
  FACEBOOK = 'facebook',
}

// Enums para tipos de notificação
export enum NotificationType {
  MEAL_REMINDER = 'meal_reminder',
  TIMER_COMPLETE = 'timer_complete',
  NEW_FOLLOWER = 'new_follower',
  RECIPE_LIKED = 'recipe_liked',
  RECIPE_COMMENTED = 'recipe_commented',
  WEEKLY_DIGEST = 'weekly_digest',
}

// Enums para status de sessão de cozinha
export enum KitchenSessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

// Enums para status de timer
export enum TimerStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Enums para tipos de relatório
export enum ReportReason {
  SPAM = 'spam',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  HARASSMENT = 'harassment',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  FAKE_RECIPE = 'fake_recipe',
  DANGEROUS_CONTENT = 'dangerous_content',
  OTHER = 'other',
}

// Enums para status de relatório
export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}
