export interface PrivacySettings {
  id: string;
  userId: string;
  
  // Configurações de perfil
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showRealName: boolean;
  showLocation: boolean;
  showJoinDate: boolean;
  showStats: boolean;
  
  // Configurações de receitas
  defaultRecipeVisibility: 'public' | 'private' | 'friends';
  allowRecipeComments: boolean;
  allowRecipeRatings: boolean;
  allowRecipeSaves: boolean;
  
  // Configurações de atividade
  showActivity: boolean;
  showFollowing: boolean;
  showFollowers: boolean;
  showLikedPosts: boolean;
  showSavedRecipes: boolean;
  
  // Configurações de notificações
  emailNotifications: boolean;
  pushNotifications: boolean;
  followNotifications: boolean;
  commentNotifications: boolean;
  likeNotifications: boolean;
  mentionNotifications: boolean;
  
  // Configurações de comunicação
  allowDirectMessages: 'everyone' | 'following' | 'none';
  allowTagging: boolean;
  allowSharing: boolean;
  
  // Configurações de dados
  dataCollection: boolean;
  analyticsTracking: boolean;
  personalizedAds: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface BlockedUser {
  id: string;
  userId: string; // Quem bloqueou
  blockedUserId: string; // Quem foi bloqueado
  blockedUser: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  reason?: string;
  createdAt: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  type: 'full' | 'recipes' | 'profile' | 'activity';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  reason?: string;
  scheduledFor: string; // Data agendada para exclusão (30 dias)
  status: 'pending' | 'cancelled' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface RecipePrivacySettings {
  recipeId: string;
  visibility: 'public' | 'private' | 'friends';
  allowComments: boolean;
  allowRatings: boolean;
  allowSaves: boolean;
  allowSharing: boolean;
  updatedAt: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  
  // Tipos de notificação
  email: {
    enabled: boolean;
    frequency: 'immediate' | 'daily' | 'weekly' | 'never';
    types: {
      follows: boolean;
      comments: boolean;
      likes: boolean;
      mentions: boolean;
      recipes: boolean;
      community: boolean;
      marketing: boolean;
    };
  };
  
  push: {
    enabled: boolean;
    types: {
      follows: boolean;
      comments: boolean;
      likes: boolean;
      mentions: boolean;
      recipes: boolean;
      community: boolean;
      reminders: boolean;
    };
  };
  
  // Configurações de horário
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
  
  updatedAt: string;
}

// Tipos para APIs
export interface UpdatePrivacySettingsRequest {
  profileVisibility?: 'public' | 'private' | 'friends';
  showEmail?: boolean;
  showRealName?: boolean;
  showLocation?: boolean;
  showJoinDate?: boolean;
  showStats?: boolean;
  defaultRecipeVisibility?: 'public' | 'private' | 'friends';
  allowRecipeComments?: boolean;
  allowRecipeRatings?: boolean;
  allowRecipeSaves?: boolean;
  showActivity?: boolean;
  showFollowing?: boolean;
  showFollowers?: boolean;
  showLikedPosts?: boolean;
  showSavedRecipes?: boolean;
  allowDirectMessages?: 'everyone' | 'following' | 'none';
  allowTagging?: boolean;
  allowSharing?: boolean;
  dataCollection?: boolean;
  analyticsTracking?: boolean;
  personalizedAds?: boolean;
}

export interface UpdateNotificationSettingsRequest {
  email?: {
    enabled?: boolean;
    frequency?: 'immediate' | 'daily' | 'weekly' | 'never';
    types?: {
      follows?: boolean;
      comments?: boolean;
      likes?: boolean;
      mentions?: boolean;
      recipes?: boolean;
      community?: boolean;
      marketing?: boolean;
    };
  };
  push?: {
    enabled?: boolean;
    types?: {
      follows?: boolean;
      comments?: boolean;
      likes?: boolean;
      mentions?: boolean;
      recipes?: boolean;
      community?: boolean;
      reminders?: boolean;
    };
  };
  quietHours?: {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
  };
}

export interface UpdateRecipePrivacyRequest {
  recipeId: string;
  visibility?: 'public' | 'private' | 'friends';
  allowComments?: boolean;
  allowRatings?: boolean;
  allowSaves?: boolean;
  allowSharing?: boolean;
}

export interface BlockUserRequest {
  userId: string;
  reason?: string;
}

export interface RequestDataExportRequest {
  type: 'full' | 'recipes' | 'profile' | 'activity';
}

export interface RequestAccountDeletionRequest {
  reason?: string;
  password: string; // Confirmação de senha
}

// Estados para gerenciamento
export interface PrivacyState {
  settings: PrivacySettings | null;
  notifications: NotificationSettings | null;
  blockedUsers: BlockedUser[];
  dataExports: DataExportRequest[];
  accountDeletion: AccountDeletionRequest | null;
  loading: boolean;
  error: string | null;
}

// Constantes
export const PRIVACY_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Público', description: 'Visível para todos' },
  { value: 'friends', label: 'Amigos', description: 'Visível apenas para quem você segue' },
  { value: 'private', label: 'Privado', description: 'Visível apenas para você' },
] as const;

export const MESSAGE_PERMISSION_OPTIONS = [
  { value: 'everyone', label: 'Todos', description: 'Qualquer pessoa pode enviar mensagens' },
  { value: 'following', label: 'Seguindo', description: 'Apenas pessoas que você segue' },
  { value: 'none', label: 'Ninguém', description: 'Desabilitar mensagens diretas' },
] as const;

export const NOTIFICATION_FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Imediato', description: 'Receber notificações instantaneamente' },
  { value: 'daily', label: 'Diário', description: 'Resumo diário das notificações' },
  { value: 'weekly', label: 'Semanal', description: 'Resumo semanal das notificações' },
  { value: 'never', label: 'Nunca', description: 'Não receber notificações por email' },
] as const;