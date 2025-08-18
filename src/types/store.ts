import {
  Recipe,
  User,
  MealPlan,
  ShoppingList,
  KitchenSession,
  CommunityPost,
  CustomList,
} from './index';

// Estados base para entidades (usando RTK Entity Adapter)
export interface CustomEntityState<_T> {
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
}

export interface PaginatedEntityState<T> extends CustomEntityState<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Estado para receitas
export interface RecipesState extends PaginatedEntityState<Recipe> {
  ids: string[];
  entities: Record<string, Recipe>;
  favorites: string[]; // IDs das receitas favoritas
  categories: string[];
  tags: string[];
  filters: {
    categories?: string[];
    tags?: string[];
    difficulty?: ('easy' | 'medium' | 'hard')[];
    maxPrepTime?: number;
    maxCookTime?: number;
    ingredients?: string[];
    dietaryRestrictions?: string[];
    minRating?: number;
    userId?: string;
    isPublic?: boolean;
  };
  searchQuery: string;
  searchResults: string[];
  searchLoading: boolean;
  importLoading: boolean;
  importError: string | null;
}

// Estado para listas personalizadas
export interface ListsState extends PaginatedEntityState<CustomList> {
  ids: string[];
  entities: Record<string, CustomList>;
  
  // Filtros
  filters: {
    userId?: string;
    isPublic?: boolean;
    tags?: string[];
    hasRecipes?: boolean;
    sortBy?: 'name' | 'createdAt' | 'recipesCount' | 'lastModified';
    sortOrder?: 'asc' | 'desc';
  };
  
  // UI state
  selectedListId: string | null;
  isCreating: boolean;
  isEditing: boolean;
  
  // Drag and drop
  draggedRecipeId: string | null;
  dropTargetListId: string | null;
  
  // Compartilhamento
  shareModalVisible: boolean;
  shareCode: string | null;
  
  // Estatísticas
  stats: {
    totalLists: number;
    totalRecipes: number;
    mostUsedTags: string[];
    averageRecipesPerList: number;
  } | null;
}

// Estado para autenticação
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokens: {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  };
  loginAttempts: number;
  lastLoginAttempt: number | null;
}

// Estado para planejamento
export interface PlanningState {
  mealPlans: CustomEntityState<MealPlan> & {
    ids: string[];
    entities: Record<string, MealPlan>;
  };
  shoppingLists: CustomEntityState<ShoppingList> & {
    ids: string[];
    entities: Record<string, ShoppingList>;
  };
  currentWeek: {
    start: Date;
    end: Date;
    plans: string[]; // IDs dos meal plans
  };
  generateListLoading: boolean;
  generateListError: string | null;
}

// Estado para modo cozinha
export interface KitchenState {
  activeSessions: Record<string, KitchenSession>;
  currentSessionId: string | null;
  timers: Record<
    string,
    {
      id: string;
      name: string;
      duration: number;
      remainingTime: number;
      isRunning: boolean;
    }
  >;
  voiceControlEnabled: boolean;
  voiceControlListening: boolean;
  settings: {
    keepScreenOn: boolean;
    autoAdvanceSteps: boolean;
    voiceEnabled: boolean;
    timerSound: string;
    textSize: 'small' | 'medium' | 'large';
  };
}

// Estado para comunidade
export interface CommunityState extends PaginatedEntityState<CommunityPost> {
  following: string[]; // IDs dos usuários seguidos
  followers: string[]; // IDs dos seguidores
  feed: string[]; // IDs dos posts no feed
  trending: {
    recipes: string[];
    users: string[];
    tags: string[];
  };
  notifications: {
    items: Array<{
      id: string;
      type: string;
      title: string;
      message: string;
      read: boolean;
      createdAt: Date;
    }>;
    unreadCount: number;
  };
}

// Estado para configurações da aplicação
export interface AppState {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  onboardingCompleted: boolean;
  permissions: {
    camera: boolean;
    microphone: boolean;
    notifications: boolean;
    photos: boolean;
  };
  connectivity: {
    isConnected: boolean;
    isInternetReachable: boolean;
  };
  sync: {
    lastSyncTime: number | null;
    isSyncing: boolean;
    pendingChanges: number;
    conflicts: Array<{
      entity: string;
      id: string;
      type: 'update' | 'delete';
    }>;
  };
}

// Estado para UI
export interface UIState {
  activeScreen: string;
  modals: {
    importRecipe: boolean;
    createRecipe: boolean;
    editProfile: boolean;
    settings: boolean;
  };
  bottomSheet: {
    isOpen: boolean;
    content: 'filters' | 'sort' | 'share' | null;
    data?: any;
  };
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration: number;
  };
  loading: {
    global: boolean;
    screens: Record<string, boolean>;
    actions: Record<string, boolean>;
  };
}

// Estado raiz da aplicação
export interface RootState {
  auth: AuthState;
  recipes: RecipesState;
  planning: PlanningState;
  kitchen: KitchenState;
  community: CommunityState;
  app: AppState;
  ui: UIState;
}

// Tipos para actions
export interface BaseAction {
  type: string;
  payload?: any;
  meta?: any;
  error?: boolean;
}

export interface AsyncAction extends BaseAction {
  payload: {
    loading?: boolean;
    data?: any;
    error?: string;
  };
}

// Tipos para selectors
export type Selector<T> = (state: RootState) => T;
export type ParameterizedSelector<T, P> = (state: RootState, params: P) => T;

// Tipos para middleware
export interface ThunkAPI {
  dispatch: (action: any) => any;
  getState: () => RootState;
  rejectWithValue: (value: any) => any;
}

// Tipos para persistência
export interface PersistConfig {
  key: string;
  storage: any;
  whitelist?: string[];
  blacklist?: string[];
  transforms?: any[];
}
