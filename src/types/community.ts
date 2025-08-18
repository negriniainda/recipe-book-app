export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  recipeId?: string;
  content: string;
  images?: string[];
  videos?: string[];

  likes: number;
  comments: CommunityComment[];
  shares: number;

  isPublic: boolean;
  tags: string[];

  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;

  likes: number;
  replies: CommunityReply[];

  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityReply {
  id: string;
  commentId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;

  likes: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  recipeIds: string[];
  isPublic: boolean;
  coverImage?: string;

  likes: number;
  followers: number;

  createdAt: Date;
  updatedAt: Date;
}

// Tipos para interações sociais
export interface Like {
  id: string;
  userId: string;
  targetId: string; // pode ser recipeId, postId, commentId, etc.
  targetType: 'recipe' | 'post' | 'comment' | 'reply' | 'collection';
  createdAt: Date;
}

export interface Share {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'recipe' | 'post' | 'collection';
  platform?:
    | 'whatsapp'
    | 'instagram'
    | 'facebook'
    | 'twitter'
    | 'email'
    | 'link';
  createdAt: Date;
}

// Tipos para feed e descoberta
export interface FeedItem {
  id: string;
  type: 'recipe' | 'post' | 'collection' | 'user_follow' | 'achievement';
  userId: string;
  username: string;
  userAvatar?: string;
  content: any; // Recipe | CommunityPost | RecipeCollection | etc.
  timestamp: Date;
  isSponsored?: boolean;
}

export interface TrendingItem {
  id: string;
  type: 'recipe' | 'tag' | 'user' | 'collection';
  title: string;
  description?: string;
  image?: string;
  score: number; // pontuação de trending
  timeframe: '24h' | '7d' | '30d';
}

// Tipos para moderação
export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'recipe' | 'post' | 'comment' | 'user';
  reason: ReportReason;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';

  createdAt: Date;
  updatedAt: Date;
}

import {ReportReason} from './enums';

// Tipos para busca na comunidade
export interface CommunitySearchParams {
  query?: string;
  type?: 'recipes' | 'users' | 'posts' | 'collections';
  tags?: string[];
  userId?: string;
  timeframe?: '24h' | '7d' | '30d' | 'all';
  sortBy?: 'relevance' | 'recent' | 'popular' | 'trending';
  page?: number;
  limit?: number;
}
