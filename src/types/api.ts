import {ErrorCodes} from './enums';
import {User} from './user';

// Tipos base para respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: ErrorCodes;
  message: string;
  details?: Record<string, any>;
  field?: string; // para erros de validação
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para autenticação
export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// Tipos para upload de arquivos
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Tipos para importação de receitas
export interface ImportRecipeRequest {
  source: 'url' | 'image' | 'text';
  data: string; // URL, base64 image, ou texto
  options?: {
    extractNutrition?: boolean;
    autoCategories?: boolean;
    language?: string;
  };
}

export interface ImportRecipeResponse {
  recipe: {
    title: string;
    description?: string;
    ingredients: Array<{
      name: string;
      quantity?: number;
      unit?: string;
    }>;
    instructions: Array<{
      stepNumber: number;
      description: string;
      duration?: number;
    }>;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
    categories?: string[];
    tags?: string[];
    sourceUrl?: string;
    originalAuthor?: string;
    images?: string[];
  };
  confidence: number; // 0-1, confiança na extração
  warnings?: string[];
}

// Tipos para busca e filtros
export interface SearchRequest {
  query?: string;
  filters?: Record<string, any>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
  query: string;
  filters: Record<string, any>;
  suggestions?: string[];
  facets?: SearchFacet[];
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

// Tipos para notificações push
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  category?: string;
}

// Tipos para analytics
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

// Tipos para configurações da aplicação
export interface AppConfig {
  version: string;
  features: {
    voiceControl: boolean;
    socialLogin: boolean;
    premiumFeatures: boolean;
    communityFeatures: boolean;
    importFromSocial: boolean;
  };
  limits: {
    maxRecipesPerUser: number;
    maxImagesPerRecipe: number;
    maxFileSize: number;
    maxShoppingLists: number;
  };
  urls: {
    termsOfService: string;
    privacyPolicy: string;
    support: string;
    feedback: string;
  };
}

// Tipos para sincronização
export interface SyncRequest {
  lastSyncTimestamp?: string;
  deviceId: string;
  changes: SyncChange[];
}

export interface SyncChange {
  type: 'create' | 'update' | 'delete';
  entity: 'recipe' | 'mealPlan' | 'shoppingList' | 'userPreferences';
  id: string;
  data?: any;
  timestamp: string;
}

export interface SyncResponse {
  changes: SyncChange[];
  conflicts: SyncConflict[];
  lastSyncTimestamp: string;
}

export interface SyncConflict {
  entity: string;
  id: string;
  localVersion: any;
  serverVersion: any;
  conflictType: 'update_conflict' | 'delete_conflict';
}
