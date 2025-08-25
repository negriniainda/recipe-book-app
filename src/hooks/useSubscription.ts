import { useState, useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import {
  useGetCurrentSubscriptionQuery,
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useReactivateSubscriptionMutation,
  useGetFeatureUsageQuery,
  useTrackFeatureUsageMutation,
  useCheckFeatureAccessQuery,
  useGetAvailableFeaturesQuery,
  useValidatePromoCodeMutation,
  useApplyPromoCodeMutation,
  useGetSubscriptionInsightsQuery,
} from '../services/subscriptionApi';
import {
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  ValidatePromoCodeRequest,
  FeatureUsageRequest,
  isFeatureAvailable,
  isSubscriptionActive,
  getSubscriptionTimeLeft,
  PREMIUM_FEATURES,
  SUBSCRIPTION_PLANS,
} from '../types/subscription';

export const useSubscription = () => {
  const {
    data: currentSubscription,
    isLoading,
    error,
    refetch,
  } = useGetCurrentSubscriptionQuery();

  const { data: plans = SUBSCRIPTION_PLANS } = useGetSubscriptionPlansQuery();
  const { data: featureUsage = {} } = useGetFeatureUsageQuery();
  const { data: availableFeatures = [] } = useGetAvailableFeaturesQuery();

  const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
  const [updateSubscription, { isLoading: isUpdating }] = useUpdateSubscriptionMutation();
  const [cancelSubscription, { isLoading: isCanceling }] = useCancelSubscriptionMutation();
  const [reactivateSubscription, { isLoading: isReactivating }] = useReactivateSubscriptionMutation();

  const isActive = useMemo(() => {
    return isSubscriptionActive(currentSubscription);
  }, [currentSubscription]);

  const isPremium = useMemo(() => {
    return isActive && currentSubscription?.plan.id !== 'free';
  }, [isActive, currentSubscription]);

  const timeLeft = useMemo(() => {
    return getSubscriptionTimeLeft(currentSubscription);
  }, [currentSubscription]);

  const currentPlan = useMemo(() => {
    return currentSubscription?.plan || plans.find(p => p.id === 'free');
  }, [currentSubscription, plans]);

  const handleCreateSubscription = useCallback(async (data: CreateSubscriptionRequest) => {
    try {
      const result = await createSubscription(data).unwrap();
      Alert.alert(
        'Assinatura Criada!',
        'Sua assinatura premium foi ativada com sucesso.'
      );
      return { success: true, subscription: result };
    } catch (error: any) {
      const message = error.data?.message || 'Erro ao criar assinatura';
      Alert.alert('Erro', message);
      return { success: false, error: message };
    }
  }, [createSubscription]);

  const handleUpdateSubscription = useCallback(async (data: UpdateSubscriptionRequest) => {
    try {
      const result = await updateSubscription(data).unwrap();
      Alert.alert(
        'Assinatura Atualizada',
        'Suas alterações foram salvas com sucesso.'
      );
      return { success: true, subscription: result };
    } catch (error: any) {
      const message = error.data?.message || 'Erro ao atualizar assinatura';
      Alert.alert('Erro', message);
      return { success: false, error: message };
    }
  }, [updateSubscription]);

  const handleCancelSubscription = useCallback(async (immediate: boolean = false) => {
    try {
      const result = await cancelSubscription({ immediate }).unwrap();
      const message = immediate 
        ? 'Sua assinatura foi cancelada imediatamente.'
        : 'Sua assinatura será cancelada no final do período atual.';
      
      Alert.alert('Assinatura Cancelada', message);
      return { success: true, subscription: result };
    } catch (error: any) {
      const message = error.data?.message || 'Erro ao cancelar assinatura';
      Alert.alert('Erro', message);
      return { success: false, error: message };
    }
  }, [cancelSubscription]);

  const handleReactivateSubscription = useCallback(async () => {
    try {
      const result = await reactivateSubscription().unwrap();
      Alert.alert(
        'Assinatura Reativada',
        'Sua assinatura premium foi reativada com sucesso.'
      );
      return { success: true, subscription: result };
    } catch (error: any) {
      const message = error.data?.message || 'Erro ao reativar assinatura';
      Alert.alert('Erro', message);
      return { success: false, error: message };
    }
  }, [reactivateSubscription]);

  return {
    currentSubscription,
    plans,
    featureUsage,
    availableFeatures,
    isActive,
    isPremium,
    timeLeft,
    currentPlan,
    isLoading,
    error,
    refetch,
    createSubscription: handleCreateSubscription,
    updateSubscription: handleUpdateSubscription,
    cancelSubscription: handleCancelSubscription,
    reactivateSubscription: handleReactivateSubscription,
    isCreating,
    isUpdating,
    isCanceling,
    isReactivating,
  };
};

export const useFeatureAccess = (featureId: string) => {
  const { currentSubscription, featureUsage } = useSubscription();
  const { data: accessCheck } = useCheckFeatureAccessQuery(featureId);
  const [trackUsage] = useTrackFeatureUsageMutation();

  const hasAccess = useMemo(() => {
    if (accessCheck) {
      return accessCheck.hasAccess;
    }
    
    const usage = featureUsage[featureId];
    return isFeatureAvailable(featureId, currentSubscription, usage);
  }, [featureId, currentSubscription, featureUsage, accessCheck]);

  const feature = useMemo(() => {
    return PREMIUM_FEATURES[featureId];
  }, [featureId]);

  const usage = useMemo(() => {
    return featureUsage[featureId];
  }, [featureUsage, featureId]);

  const usagePercentage = useMemo(() => {
    if (!usage || usage.unlimited) return 0;
    return Math.min((usage.usageCount / usage.limit) * 100, 100);
  }, [usage]);

  const remainingUsage = useMemo(() => {
    if (!usage || usage.unlimited) return null;
    return Math.max(usage.limit - usage.usageCount, 0);
  }, [usage]);

  const handleTrackUsage = useCallback(async (increment: number = 1) => {
    if (!hasAccess) {
      return { success: false, error: 'Acesso negado ao recurso' };
    }

    try {
      await trackUsage({ featureId, increment }).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao registrar uso',
      };
    }
  }, [featureId, hasAccess, trackUsage]);

  const requiresUpgrade = useMemo(() => {
    return !hasAccess && accessCheck?.upgradeRequired;
  }, [hasAccess, accessCheck]);

  return {
    hasAccess,
    feature,
    usage,
    usagePercentage,
    remainingUsage,
    requiresUpgrade,
    trackUsage: handleTrackUsage,
  };
};

export const usePromoCode = () => {
  const [validatePromoCode, { isLoading: isValidating }] = useValidatePromoCodeMutation();
  const [applyPromoCode, { isLoading: isApplying }] = useApplyPromoCodeMutation();

  const handleValidatePromoCode = useCallback(async (data: ValidatePromoCodeRequest) => {
    try {
      const result = await validatePromoCode(data).unwrap();
      return {
        success: true,
        valid: result.valid,
        discount: result.discount,
        promoCode: result.promoCode,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || 'Erro ao validar código promocional',
      };
    }
  }, [validatePromoCode]);

  const handleApplyPromoCode = useCallback(async (code: string, subscriptionId?: string) => {
    try {
      const result = await applyPromoCode({ code, subscriptionId }).unwrap();
      Alert.alert(
        'Código Aplicado!',
        `Desconto de R$ ${result.discount.toFixed(2)} aplicado com sucesso.`
      );
      return {
        success: true,
        discount: result.discount,
        usage: result.usage,
      };
    } catch (error: any) {
      const message = error.data?.message || 'Erro ao aplicar código promocional';
      Alert.alert('Erro', message);
      return { success: false, error: message };
    }
  }, [applyPromoCode]);

  return {
    validatePromoCode: handleValidatePromoCode,
    applyPromoCode: handleApplyPromoCode,
    isValidating,
    isApplying,
  };
};

export const useSubscriptionInsights = () => {
  const {
    data: insights,
    isLoading,
    error,
    refetch,
  } = useGetSubscriptionInsightsQuery();

  const valuePerMonth = useMemo(() => {
    if (!insights) return 0;
    return insights.valueReceived / 12; // Assumindo valor anual
  }, [insights]);

  const timesSavedPerWeek = useMemo(() => {
    if (!insights) return 0;
    return insights.timesSaved / 52; // Assumindo valor anual
  }, [insights]);

  const mostUsedFeature = useMemo(() => {
    if (!insights?.topFeatures.length) return null;
    return insights.topFeatures[0];
  }, [insights]);

  const engagementScore = useMemo(() => {
    if (!insights) return 0;
    // Calcular score baseado no uso de features
    const maxFeatures = Object.keys(PREMIUM_FEATURES).length;
    return Math.round((insights.featuresUsed / maxFeatures) * 100);
  }, [insights]);

  return {
    insights,
    valuePerMonth,
    timesSavedPerWeek,
    mostUsedFeature,
    engagementScore,
    isLoading,
    error,
    refetch,
  };
};

export const useSubscriptionStatus = () => {
  const { currentSubscription, isActive, isPremium, timeLeft } = useSubscription();

  const status = useMemo(() => {
    if (!currentSubscription) return 'free';
    return currentSubscription.status;
  }, [currentSubscription]);

  const isTrialing = useMemo(() => {
    return status === 'trialing';
  }, [status]);

  const isCanceled = useMemo(() => {
    return status === 'canceled' || currentSubscription?.cancelAtPeriodEnd;
  }, [status, currentSubscription]);

  const isPastDue = useMemo(() => {
    return status === 'past_due';
  }, [status]);

  const needsPaymentUpdate = useMemo(() => {
    return ['past_due', 'incomplete', 'unpaid'].includes(status);
  }, [status]);

  const statusMessage = useMemo(() => {
    switch (status) {
      case 'active':
        return isPremium ? 'Assinatura ativa' : 'Plano gratuito';
      case 'trialing':
        return `Período de teste - ${timeLeft}`;
      case 'past_due':
        return 'Pagamento em atraso';
      case 'canceled':
        return isCanceled ? `Cancelada - ${timeLeft}` : 'Cancelada';
      case 'unpaid':
        return 'Pagamento pendente';
      case 'incomplete':
        return 'Pagamento incompleto';
      case 'incomplete_expired':
        return 'Pagamento expirado';
      default:
        return 'Status desconhecido';
    }
  }, [status, isPremium, timeLeft, isCanceled]);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'trialing':
        return '#2196f3';
      case 'past_due':
      case 'unpaid':
      case 'incomplete':
        return '#ff9800';
      case 'canceled':
      case 'incomplete_expired':
        return '#f44336';
      default:
        return '#757575';
    }
  }, [status]);

  return {
    status,
    isActive,
    isPremium,
    isTrialing,
    isCanceled,
    isPastDue,
    needsPaymentUpdate,
    statusMessage,
    statusColor,
    timeLeft,
  };
};