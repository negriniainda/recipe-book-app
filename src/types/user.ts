export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;

  preferences: UserPreferences;

  // Estatísticas
  recipesCount: number;
  followersCount: number;
  followingCount: number;

  // Configurações
  isPublic: boolean;
  notifications: NotificationSettings;

  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteCategories: string[];
  defaultServings: number;
  measurementSystem: 'metric' | 'imperial';
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationSettings {
  mealReminders: boolean;
  communityActivity: boolean;
  newFollowers: boolean;
  recipeComments: boolean;
  recipeLikes: boolean;
  kitchenTimers: boolean;
  weeklyDigest: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
}

// Tipos para autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface SocialLoginData {
  provider: 'google' | 'apple' | 'facebook';
  token: string;
  email?: string;
  name?: string;
  avatar?: string;
}

// Tipos para perfil
export type UpdateUserInput = Partial<
  Omit<
    User,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'recipesCount'
    | 'followersCount'
    | 'followingCount'
  >
>;

// Tipos para relacionamentos sociais
export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface UserStats {
  recipesCount: number;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  totalViews: number;
}
