export interface CommunityPost {
  id: string;
  recipeId: string;
  userId: string;
  user: CommunityUser;
  recipe: CommunityRecipe;
  caption?: string;
  images: string[];
  videos?: string[];
  
  // Estatísticas sociais
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  
  // Estado do usuário atual
  isLiked: boolean;
  isBookmarked: boolean;
  
  // Moderação
  isReported: boolean;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  
  createdAt: string;
  updatedAt: string;
}

export interface CommunityUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  
  // Estatísticas públicas
  recipesCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  
  // Estado do usuário atual
  isFollowing: boolean;
  isBlocked: boolean;
  
  createdAt: string;
}

export interface CommunityRecipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  categories: string[];
  tags: string[];
  mainImage: string;
  
  // Estatísticas da comunidade
  likesCount: number;
  savesCount: number;
  triesCount: number;
  rating: number;
  reviewsCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: CommunityUser;
  content: string;
  parentId?: string; // Para respostas
  
  // Estatísticas
  likesCount: number;
  repliesCount: number;
  
  // Estado do usuário atual
  isLiked: boolean;
  
  // Moderação
  isReported: boolean;
  moderationStatus: 'approved' | 'pending' | 'rejected';
  
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  coverImage?: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  
  // Estatísticas
  recipesCount: number;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  totalViews: number;
  
  // Estado do usuário atual
  isFollowing: boolean;
  isBlocked: boolean;
  isOwnProfile: boolean;
  
  // Configurações de privacidade
  isPublic: boolean;
  showEmail: boolean;
  showStats: boolean;
  
  createdAt: string;
  joinedDate: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  recipeId?: string;
  type: 'post' | 'comment' | 'recipe';
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  reason: 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other';
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  
  createdAt: string;
  updatedAt: string;
}

export interface CommunityFeedFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  prepTime?: number; // máximo em minutos
  tags?: string[];
  following?: boolean; // apenas de quem segue
  trending?: boolean; // posts em alta
  recent?: boolean; // mais recentes
}

export interface CommunityStats {
  totalUsers: number;
  totalRecipes: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  activeUsers: number; // últimos 30 dias
  topCategories: Array<{
    category: string;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}

// Estados para gerenciamento
export interface CommunityState {
  feed: {
    posts: CommunityPost[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    filters: CommunityFeedFilters;
  };
  
  userProfile: {
    profile: UserProfile | null;
    posts: CommunityPost[];
    loading: boolean;
    error: string | null;
  };
  
  comments: {
    [postId: string]: {
      comments: Comment[];
      loading: boolean;
      error: string | null;
    };
  };
  
  following: {
    users: CommunityUser[];
    loading: boolean;
    error: string | null;
  };
  
  stats: CommunityStats | null;
}

// Tipos para APIs
export interface CreatePostRequest {
  recipeId: string;
  caption?: string;
  images: string[];
  videos?: string[];
}

export interface UpdatePostRequest {
  caption?: string;
  images?: string[];
  videos?: string[];
}

export interface CreateCommentRequest {
  postId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface FollowUserRequest {
  userId: string;
}

export interface ReportContentRequest {
  targetId: string;
  targetType: 'post' | 'comment' | 'user';
  reason: 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other';
  description?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  website?: string;
  isPublic?: boolean;
  showEmail?: boolean;
  showStats?: boolean;
}