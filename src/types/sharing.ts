// Types for sharing functionality

export type SharePlatform = 
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'telegram'
  | 'email'
  | 'sms'
  | 'copy-link'
  | 'more';

export type ShareContentType = 
  | 'recipe'
  | 'meal-plan'
  | 'shopping-list'
  | 'cooking-session'
  | 'recipe-collection';

export type ShareFormat = 
  | 'text'
  | 'image'
  | 'pdf'
  | 'link'
  | 'story'
  | 'post';

export interface ShareableContent {
  id: string;
  type: ShareContentType;
  title: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  data: any; // The actual content data
}

export interface ShareTemplate {
  id: string;
  name: string;
  platform: SharePlatform;
  format: ShareFormat;
  contentType: ShareContentType;
  template: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    layout: 'card' | 'story' | 'post' | 'minimal';
    showLogo: boolean;
    showQRCode: boolean;
    showIngredients: boolean;
    showSteps: boolean;
    showNutrition: boolean;
    showRating: boolean;
    showCookTime: boolean;
    showServings: boolean;
    customText?: string;
    watermark?: string;
  };
  dimensions: {
    width: number;
    height: number;
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShareLink {
  id: string;
  contentId: string;
  contentType: ShareContentType;
  shortUrl: string;
  fullUrl: string;
  qrCodeUrl: string;
  expiresAt?: Date;
  clickCount: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  lastAccessedAt?: Date;
  metadata: {
    title: string;
    description: string;
    imageUrl?: string;
    tags: string[];
  };
}

export interface ShareStats {
  contentId: string;
  contentType: ShareContentType;
  totalShares: number;
  sharesByPlatform: Record<SharePlatform, number>;
  sharesByFormat: Record<ShareFormat, number>;
  linkClicks: number;
  uniqueViews: number;
  lastSharedAt?: Date;
  topPlatforms: {
    platform: SharePlatform;
    count: number;
    percentage: number;
  }[];
}

export interface ShareActivity {
  id: string;
  contentId: string;
  contentType: ShareContentType;
  platform: SharePlatform;
  format: ShareFormat;
  sharedBy: string;
  sharedAt: Date;
  recipientCount?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface SharePreferences {
  userId: string;
  defaultPlatforms: SharePlatform[];
  defaultFormat: ShareFormat;
  includePersonalInfo: boolean;
  includeAppBranding: boolean;
  autoGenerateQRCode: boolean;
  linkExpirationDays: number;
  allowPublicSharing: boolean;
  watermarkText?: string;
  customTemplates: string[];
  notifyOnShare: boolean;
  trackingEnabled: boolean;
}

// API Request/Response types
export interface CreateShareLinkRequest {
  contentId: string;
  contentType: ShareContentType;
  expirationDays?: number;
  isPublic?: boolean;
  customSlug?: string;
}

export interface ShareContentRequest {
  contentId: string;
  contentType: ShareContentType;
  platform: SharePlatform;
  format: ShareFormat;
  templateId?: string;
  customMessage?: string;
  recipients?: string[];
}

export interface GenerateShareImageRequest {
  contentId: string;
  contentType: ShareContentType;
  templateId: string;
  customizations?: {
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    customText?: string;
    showElements?: {
      ingredients?: boolean;
      steps?: boolean;
      nutrition?: boolean;
      rating?: boolean;
      cookTime?: boolean;
      servings?: boolean;
    };
  };
}

export interface ExportPDFRequest {
  contentId: string;
  contentType: ShareContentType;
  includeImages: boolean;
  includeNutrition: boolean;
  includeNotes: boolean;
  format: 'standard' | 'compact' | 'detailed';
  language: string;
}

export interface ShareAnalyticsRequest {
  contentId?: string;
  contentType?: ShareContentType;
  dateRange: {
    start: Date;
    end: Date;
  };
  groupBy?: 'day' | 'week' | 'month';
}

// UI State types
export interface ShareModalState {
  isVisible: boolean;
  content: ShareableContent | null;
  selectedPlatforms: SharePlatform[];
  selectedFormat: ShareFormat;
  selectedTemplate?: ShareTemplate;
  customMessage: string;
  isGeneratingImage: boolean;
  isGeneratingPDF: boolean;
  isCreatingLink: boolean;
  generatedImageUrl?: string;
  generatedPDFUrl?: string;
  shareLink?: ShareLink;
}

export interface ShareButtonConfig {
  platform: SharePlatform;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
  isEnabled: boolean;
  requiresAuth: boolean;
  supportedFormats: ShareFormat[];
}

// Utility types
export type ShareResult = {
  success: boolean;
  platform: SharePlatform;
  format: ShareFormat;
  shareId?: string;
  errorMessage?: string;
  analytics?: {
    recipientCount: number;
    estimatedReach: number;
  };
};

export type ShareImageDimensions = {
  instagram_post: {width: 1080; height: 1080};
  instagram_story: {width: 1080; height: 1920};
  facebook_post: {width: 1200; height: 630};
  twitter_post: {width: 1200; height: 675};
  whatsapp_status: {width: 1080; height: 1920};
  generic: {width: 1200; height: 800};
};

export interface ShareTemplateCustomization {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  showLogo: boolean;
  showQRCode: boolean;
  customText?: string;
  watermark?: string;
  elements: {
    title: boolean;
    description: boolean;
    ingredients: boolean;
    steps: boolean;
    nutrition: boolean;
    rating: boolean;
    cookTime: boolean;
    servings: boolean;
    image: boolean;
  };
}

export interface QRCodeOptions {
  size: number;
  backgroundColor: string;
  foregroundColor: string;
  logo?: string;
  logoSize?: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface ShareNotification {
  id: string;
  type: 'share_received' | 'link_accessed' | 'share_expired' | 'share_popular';
  title: string;
  message: string;
  contentId: string;
  contentType: ShareContentType;
  data: any;
  read: boolean;
  createdAt: Date;
}

export interface SocialMediaIntegration {
  platform: SharePlatform;
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  permissions: string[];
  profileInfo?: {
    id: string;
    username: string;
    displayName: string;
    profilePicture?: string;
    followerCount?: number;
  };
}

export interface ShareCampaign {
  id: string;
  name: string;
  description: string;
  contentIds: string[];
  platforms: SharePlatform[];
  startDate: Date;
  endDate: Date;
  targetAudience?: {
    demographics: string[];
    interests: string[];
    location?: string[];
  };
  goals: {
    shares: number;
    clicks: number;
    conversions: number;
  };
  performance: {
    actualShares: number;
    actualClicks: number;
    actualConversions: number;
    engagement: number;
    reach: number;
  };
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}