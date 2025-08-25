import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePremiumGating, useFeatureAccess } from '../../hooks/usePremium';
import { PremiumBadge, FeatureUsageIndicator } from './PremiumGate';
import { AccessibleButton } from '../accessibility/AccessibleButton';

interface PremiumUpgradeCardProps {
  featureKey?: string;
  title?: string;
  description?: string;
  benefits?: string[];
  style?: any;
}

export const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({
  featureKey,
  title = 'Desbloqueie Recursos Premium',
  description = 'Acesse funcionalidades exclusivas e organize suas receitas como nunca antes.',
  benefits = [
    'Receitas ilimitadas',
    'Backup na nuvem',
    'Sugestões com IA',
    'Suporte prioritário',
  ],
  style,
}) => {
  const navigation = useNavigation();
  const { isPremium } = usePremiumGating();

  const handleUpgrade = useCallback(() => {
    navigation.navigate('PremiumPlans' as never);
  }, [navigation]);

  if (isPremium) {
    return null;
  }

  return (
    <View style={[styles.upgradeCard, style]}>
      <View style={styles.upgradeHeader}>
        <Icon name="crown" size={32} color="#FFD700" />
        <Text style={styles.upgradeTitle}>{title}</Text>
      </View>

      <Text style={styles.upgradeDescription}>{description}</Text>

      <View style={styles.benefitsList}>
        {benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Icon name="check" size={16} color="#4CAF50" />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <AccessibleButton
        style={styles.upgradeButton}
        onPress={handleUpgrade}
        accessibilityLabel="Ver planos premium"
      >
        <Text style={styles.upgradeButtonText}>Ver Planos Premium</Text>
        <Icon name="arrow-right" size={16} color="#FFFFFF" />
      </AccessibleButton>
    </View>
  );
};

interface PremiumStatusBarProps {
  showUsage?: boolean;
  compact?: boolean;
  style?: any;
}

export const PremiumStatusBar: React.FC<PremiumStatusBarProps> = ({
  showUsage = true,
  compact = false,
  style,
}) => {
  const navigation = useNavigation();
  const { isPremium, subscription } = usePremiumGating();
  const { featureUsage } = useFeatureAccess();

  const handleManagePremium = useCallback(() => {
    if (isPremium) {
      navigation.navigate('ManagePremium' as never);
    } else {
      navigation.navigate('PremiumPlans' as never);
    }
  }, [isPremium, navigation]);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactStatusBar, style]}
        onPress={handleManagePremium}
        accessibilityRole="button"
        accessibilityLabel={isPremium ? 'Gerenciar premium' : 'Ver planos premium'}
      >
        {isPremium ? (
          <>
            <PremiumBadge size="small" />
            <Text style={styles.compactStatusText}>Premium Ativo</Text>
          </>
        ) : (
          <>
            <Icon name="crown-outline" size={16} color="#666" />
            <Text style={styles.compactStatusText}>Upgrade Premium</Text>
          </>
        )}
        <Icon name="chevron-right" size={16} color="#666" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.statusBar, style]}
      onPress={handleManagePremium}
      accessibilityRole="button"
      accessibilityLabel={isPremium ? 'Gerenciar premium' : 'Ver planos premium'}
    >
      <View style={styles.statusContent}>
        <View style={styles.statusHeader}>
          {isPremium ? (
            <>
              <PremiumBadge size="medium" />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Premium Ativo</Text>
                <Text style={styles.statusSubtitle}>
                  {subscription?.plan.displayName}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Icon name="crown-outline" size={24} color="#666" />
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Usuário Gratuito</Text>
                <Text style={styles.statusSubtitle}>
                  Faça upgrade para Premium
                </Text>
              </View>
            </>
          )}
        </View>

        {showUsage && isPremium && featureUsage && (
          <View style={styles.usageSection}>
            {featureUsage
              .filter(usage => !usage.unlimited && usage.limit > 0)
              .slice(0, 2)
              .map((usage) => (
                <FeatureUsageIndicator
                  key={usage.featureKey}
                  featureKey={usage.featureKey}
                  showLabel={false}
                  style={styles.usageIndicator}
                />
              ))}
          </View>
        )}
      </View>

      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );
};

interface FeatureLockOverlayProps {
  featureKey: string;
  title?: string;
  description?: string;
  onUpgrade?: () => void;
}

export const FeatureLockOverlay: React.FC<FeatureLockOverlayProps> = ({
  featureKey,
  title,
  description,
  onUpgrade,
}) => {
  const navigation = useNavigation();
  const { canUseFeature } = useFeatureAccess();

  const handleUpgrade = useCallback(() => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigation.navigate('PremiumPlans' as never);
    }
  }, [onUpgrade, navigation]);

  if (canUseFeature(featureKey)) {
    return null;
  }

  return (
    <View style={styles.lockOverlay}>
      <View style={styles.lockContent}>
        <Icon name="lock" size={48} color="#FF6B35" />
        
        <Text style={styles.lockTitle}>
          {title || 'Recurso Premium'}
        </Text>
        
        <Text style={styles.lockDescription}>
          {description || 'Este recurso está disponível apenas para usuários premium.'}
        </Text>

        <AccessibleButton
          style={styles.lockButton}
          onPress={handleUpgrade}
          accessibilityLabel="Fazer upgrade para premium"
        >
          <Text style={styles.lockButtonText}>Fazer Upgrade</Text>
        </AccessibleButton>
      </View>
    </View>
  );
};

interface PremiumTrialBannerProps {
  onStartTrial?: () => void;
  onDismiss?: () => void;
}

export const PremiumTrialBanner: React.FC<PremiumTrialBannerProps> = ({
  onStartTrial,
  onDismiss,
}) => {
  const navigation = useNavigation();
  const { isPremium, subscription } = usePremiumGating();

  const handleStartTrial = useCallback(() => {
    if (onStartTrial) {
      onStartTrial();
    } else {
      navigation.navigate('PremiumPlans' as never);
    }
  }, [onStartTrial, navigation]);

  // Não mostrar se já é premium ou já teve trial
  if (isPremium || subscription) {
    return null;
  }

  return (
    <View style={styles.trialBanner}>
      <View style={styles.trialContent}>
        <Icon name="gift" size={24} color="#4CAF50" />
        <View style={styles.trialInfo}>
          <Text style={styles.trialTitle}>Teste Grátis Premium</Text>
          <Text style={styles.trialDescription}>
            7 dias grátis • Cancele quando quiser
          </Text>
        </View>
      </View>

      <View style={styles.trialActions}>
        <TouchableOpacity
          style={styles.trialButton}
          onPress={handleStartTrial}
          accessibilityRole="button"
          accessibilityLabel="Iniciar teste grátis"
        >
          <Text style={styles.trialButtonText}>Iniciar</Text>
        </TouchableOpacity>

        {onDismiss && (
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dispensar"
          >
            <Icon name="close" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  upgradeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  upgradeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsList: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  upgradeButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  compactStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  compactStatusText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusContent: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  usageSection: {
    gap: 4,
  },
  usageIndicator: {
    marginVertical: 0,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  lockContent: {
    alignItems: 'center',
    padding: 32,
    maxWidth: 300,
  },
  lockTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  lockDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  lockButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  lockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  trialContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  trialDescription: {
    fontSize: 14,
    color: '#388E3C',
  },
  trialActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trialButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  trialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismissButton: {
    padding: 4,
  },
});