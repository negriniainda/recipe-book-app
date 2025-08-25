export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly' | 'lifetime';
  intervalCount: number;
  trialDays?: number;
  features: PremiumFeature[];
  popular?: boolean;
  discount?: {
    percentage: number;
    originalPrice: number;
    validUntil?: string;
  };
  metadata?: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  icon: string;
  enabled: boolean;
  limit?: number;
  unlimited?: boolean;
}

export type FeatureCategory = 
  | 'recipes'
  | 'planning'
  | 'backup'
  | 'community'
  | 'ai'
  | 'customization'
  | 'analytics'
  | 'support';

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  paymentMethod?: PaymentMethod;
  lastPayment?: Payment;
  nextPayment?: {
    amount: number;
    date: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'pix';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId: string;
  paymentMethod: PaymentMethod;
  paidAt?: string;
  failureReason?: string;
  receiptUrl?: string;
  refunded?: boolean;
  refundedAt?: string;
  refundAmount?: number;
  createdAt: string;
}

export type PaymentStatus = 
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'refunded';

export interface PremiumFeatureUsage {
  userId: string;
  featureId: string;
  feature: PremiumFeature;
  usageCount: number;
  limit: number;
  unlimited: boolean;
  resetDate: string;
  lastUsed?: string;
}

export interface SubscriptionAnalytics {
  userId: string;
  period: 'day' | 'week' | 'month' | 'year';
  periodStart: string;
  periodEnd: string;
  
  // Métricas de uso
  recipesCreated: number;
  recipesImported: number;
  mealPlansCreated: number;
  backupsCreated: number;
  aiSuggestionsUsed: number;
  communityInteractions: number;
  
  // Métricas de engajamento
  sessionsCount: number;
  totalTimeSpent: number; // em minutos
  featuresUsed: string[];
  mostUsedFeature: string;
  
  // Valor percebido
  timesSaved: number; // em minutos
  moneySaved: number; // estimativa
  
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial';
  value: number;
  currency?: string;
  planIds?: string[];
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface PromoCodeUsage {
  id: string;
  promoCodeId: string;
  promoCode: PromoCode;
  userId: string;
  subscriptionId?: string;
  discountAmount: number;
  usedAt: string;
}

// Tipos para APIs
export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId?: string;
  promoCode?: string;
  trialDays?: number;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
  promoCode?: string;
}

export interface CreatePaymentMethodRequest {
  type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'pix';
  token: string;
  isDefault?: boolean;
  metadata?: Record<string, any>;
}

export interface ValidatePromoCodeRequest {
  code: string;
  planId?: string;
}

export interface FeatureUsageRequest {
  featureId: string;
  increment?: number;
}

// Estados para gerenciamento
export interface SubscriptionState {
  currentSubscription: UserSubscription | null;
  plans: SubscriptionPlan[];
  paymentMethods: PaymentMethod[];
  payments: Payment[];
  featureUsage: Record<string, PremiumFeatureUsage>;
  analytics: SubscriptionAnalytics | null;
  promoCodes: PromoCode[];
  loading: boolean;
  error: string | null;
}

// Constantes
export const PREMIUM_FEATURES: Record<string, PremiumFeature> = {
  unlimited_recipes: {
    id: 'unlimited_recipes',
    name: 'Receitas Ilimitadas',
    description: 'Crie e salve quantas receitas quiser',
    category: 'recipes',
    icon: 'book-plus',
    enabled: true,
    unlimited: true,
  },
  advanced_filters: {
    id: 'advanced_filters',
    name: 'Filtros Avançados',
    description: 'Filtros por ingredientes, tempo, dificuldade e mais',
    category: 'recipes',
    icon: 'filter-variant',
    enabled: true,
  },
  meal_planning_pro: {
    id: 'meal_planning_pro',
    name: 'Planejamento Avançado',
    description: 'Planejamento de refeições para até 3 meses',
    category: 'planning',
    icon: 'calendar-star',
    enabled: true,
  },
  auto_shopping_lists: {
    id: 'auto_shopping_lists',
    name: 'Listas Automáticas',
    description: 'Geração automática de listas de compras',
    category: 'planning',
    icon: 'cart-plus',
    enabled: true,
  },
  cloud_backup: {
    id: 'cloud_backup',
    name: 'Backup na Nuvem',
    description: 'Backup automático e ilimitado na nuvem',
    category: 'backup',
    icon: 'cloud-upload',
    enabled: true,
    unlimited: true,
  },
  export_recipes: {
    id: 'export_recipes',
    name: 'Exportar Receitas',
    description: 'Exporte receitas em PDF, Word e outros formatos',
    category: 'backup',
    icon: 'file-export',
    enabled: true,
  },
  ai_suggestions: {
    id: 'ai_suggestions',
    name: 'Sugestões IA',
    description: 'Sugestões personalizadas de receitas com IA',
    category: 'ai',
    icon: 'robot',
    enabled: true,
    limit: 50,
  },
  nutrition_analysis: {
    id: 'nutrition_analysis',
    name: 'Análise Nutricional',
    description: 'Análise nutricional detalhada das receitas',
    category: 'ai',
    icon: 'nutrition',
    enabled: true,
  },
  custom_themes: {
    id: 'custom_themes',
    name: 'Temas Personalizados',
    description: 'Personalize a aparência do app',
    category: 'customization',
    icon: 'palette',
    enabled: true,
  },
  priority_support: {
    id: 'priority_support',
    name: 'Suporte Prioritário',
    description: 'Suporte técnico com prioridade',
    category: 'support',
    icon: 'headset',
    enabled: true,
  },
  community_pro: {
    id: 'community_pro',
    name: 'Comunidade Pro',
    description: 'Recursos exclusivos da comunidade',
    category: 'community',
    icon: 'account-group',
    enabled: true,
  },
  detailed_analytics: {
    id: 'detailed_analytics',
    name: 'Analytics Detalhados',
    description: 'Relatórios detalhados de uso e progresso',
    category: 'analytics',
    icon: 'chart-line',
    enabled: true,
  },
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'free',
    displayName: 'Gratuito',
    description: 'Recursos básicos para começar',
    price: 0,
    currency: 'BRL',
    interval: 'monthly',
    intervalCount: 1,
    features: [],
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'premium_monthly',
    name: 'premium_monthly',
    displayName: 'Premium Mensal',
    description: 'Todos os recursos premium por mês',
    price: 14.90,
    currency: 'BRL',
    interval: 'monthly',
    intervalCount: 1,
    trialDays: 7,
    features: Object.values(PREMIUM_FEATURES),
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'premium_yearly',
    name: 'premium_yearly',
    displayName: 'Premium Anual',
    description: 'Todos os recursos premium por ano (2 meses grátis)',
    price: 149.90,
    currency: 'BRL',
    interval: 'yearly',
    intervalCount: 1,
    trialDays: 14,
    features: Object.values(PREMIUM_FEATURES),
    popular: true,
    discount: {
      percentage: 17,
      originalPrice: 178.80,
    },
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'premium_lifetime',
    name: 'premium_lifetime',
    displayName: 'Premium Vitalício',
    description: 'Acesso vitalício a todos os recursos premium',
    price: 299.90,
    currency: 'BRL',
    interval: 'lifetime',
    intervalCount: 1,
    features: Object.values(PREMIUM_FEATURES),
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Utilitários
export const isFeatureAvailable = (
  featureId: string,
  subscription: UserSubscription | null,
  usage?: PremiumFeatureUsage
): boolean => {
  // Se não tem assinatura, apenas recursos gratuitos
  if (!subscription || subscription.status !== 'active') {
    return false;
  }

  // Verificar se o plano inclui a feature
  const feature = subscription.plan.features.find(f => f.id === featureId);
  if (!feature || !feature.enabled) {
    return false;
  }

  // Se é ilimitado, sempre disponível
  if (feature.unlimited) {
    return true;
  }

  // Verificar limite de uso
  if (feature.limit && usage) {
    return usage.usageCount < feature.limit;
  }

  return true;
};

export const getFeatureUsagePercentage = (
  featureId: string,
  usage: PremiumFeatureUsage
): number => {
  if (usage.unlimited) return 0;
  return Math.min((usage.usageCount / usage.limit) * 100, 100);
};

export const formatPrice = (price: number, currency: string = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(price);
};

export const formatInterval = (interval: string, intervalCount: number = 1): string => {
  const intervals = {
    monthly: intervalCount === 1 ? 'mês' : `${intervalCount} meses`,
    yearly: intervalCount === 1 ? 'ano' : `${intervalCount} anos`,
    lifetime: 'vitalício',
  };
  
  return intervals[interval as keyof typeof intervals] || interval;
};

export const calculateDiscount = (originalPrice: number, discountedPrice: number): number => {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

export const isSubscriptionActive = (subscription: UserSubscription | null): boolean => {
  if (!subscription) return false;
  
  const activeStatuses: SubscriptionStatus[] = ['active', 'trialing'];
  return activeStatuses.includes(subscription.status);
};

export const getSubscriptionTimeLeft = (subscription: UserSubscription | null): string => {
  if (!subscription || !isSubscriptionActive(subscription)) return '';
  
  const endDate = new Date(subscription.currentPeriodEnd);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'Expirado';
  if (diffDays === 1) return '1 dia restante';
  if (diffDays < 30) return `${diffDays} dias restantes`;
  
  const diffMonths = Math.ceil(diffDays / 30);
  if (diffMonths === 1) return '1 mês restante';
  return `${diffMonths} meses restantes`;
};

export const generateSubscriptionId = (): string => {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

export const generatePaymentId = (): string => {
  return `pay_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};