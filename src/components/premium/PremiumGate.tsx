import React, { ReactNode, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePremiumGating, useFeatureAccess } from '../../hooks/usePremium';
import { AccessibleButton } from '../accessibility/AccessibleButton';
import { AccessibleText } from '../accessibility/AccessibleText';

interface PremiumGateProps {
  children: ReactNode;
  featureKey?: string;
  fallback?: ReactNode;
  showModal?: boolean;
  customMessage?: string;
  customTitle?: string;
  onUpgradePress?: () => void;
}

export const PremiumGate: React.FC<PremiumGateProps> = ({
  children,
  featureKey,
  fallback,
  showModal = true,
  customMessage,
  customTitle,
  onUpgradePress,
}) => {
  const navigation = useNavigation();
  const { isPremium, requirePremium } = usePremiumGating();
  const { canUseFeature, getRemainingUsage } = useFeatureAccess();

  const hasAccess = requirePremium(featureKey);
  const canUse = featureKey ? canUseFeature(featureKey) : hasAccess;
  const remainingUsage = featureKey ? getRemainingUsage(featureKey) : null;

  const handleUpgrade = useCallback(() => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      navigation.navigate('PremiumPlans' as never);
    }
  }, [onUpgradePress, navigation]);

  if (canUse) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showModal) {
    return null;
  }

  return (
    <PremiumUpgradePrompt
      visible={true}
      featureKey={featureKey}
      customMessage={customMessage}
      customTitle={customTitle}
      remainingUsage={remainingUsage}
      onUpgrade={handleUpgrade}
      onClose={() => {}}
    />
  );
};

interface PremiumUpgradePromptProps {
  visible: boolean;
  featureKey?: string;
  customMessage?: string;
  customTitle?: string;
  remainingUsage?: number | null;
  onUpgrade: () => void;
  onClose: () => void;
}

export const PremiumUpgradePrompt: React.FC<PremiumUpgradePromptProps> = ({
  visible,
  featureKey,
  customMessage,
  customTitle,
  remainingUsage,
  onUpgrade,
  onClose,
}) => {
  const getFeatureInfo = useCallback(() => {
    switch (featureKey) {
      case 'unlimitedRecipes':
        return {
          icon: 'infinity',
          title: 'Receitas Ilimitadas',
          description: 'Crie e salve quantas receitas quiser sem limites.',
        };
      case 'privateRecipes':
        return {
          icon: 'lock',
          title: 'Receitas Privadas',
          description: 'Mantenha suas receitas secretas apenas para você.',
        };
      case 'recipeCollections':
        return {
          icon: 'folder-multiple',
          title: 'Coleções de Receitas',
          description: 'Organize suas receitas em coleções personalizadas.',
        };
      case 'advancedSearch':
        return {
          icon: 'magnify-plus',
          title: 'Busca Avançada',
          description: 'Use filtros avançados para encontrar receitas rapidamente.',
        };
      case 'bulkImport':
        return {
          icon: 'upload-multiple',
          title: 'Importação em Lote',
          description: 'Importe múltiplas receitas de uma só vez.',
        };
      case 'unlimitedMealPlans':
        return {
          icon: 'calendar-multiple',
          title: 'Planejamentos Ilimitados',
          description: 'Crie quantos planejamentos de refeição precisar.',
        };
      case 'nutritionTracking':
        return {
          icon: 'chart-line',
          title: 'Acompanhamento Nutricional',
          description: 'Monitore calorias e nutrientes das suas refeições.',
        };
      case 'aiSuggestions':
        return {
          icon: 'robot',
          title: 'Sugestões com IA',
          description: 'Receba recomendações inteligentes baseadas no seu gosto.',
        };
      case 'cloudStorage':
        return {
          icon: 'cloud-upload',
          title: 'Armazenamento na Nuvem',
          description: 'Mantenha suas receitas seguras e sincronizadas.',
        };
      case 'videoRecipes':
        return {
          icon: 'video',
          title: 'Receitas em Vídeo',
          description: 'Adicione vídeos às suas receitas para melhor explicação.',
        };
      default:
        return {
          icon: 'star',
          title: 'Recurso Premium',
          description: 'Este recurso está disponível apenas para usuários premium.',
        };
    }
  }, [featureKey]);

  const featureInfo = getFeatureInfo();
  const title = customTitle || featureInfo.title;
  const message = customMessage || featureInfo.description;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Icon name={featureInfo.icon} size={48} color="#FF6B35" />
          </View>

          <AccessibleText style={styles.modalTitle}>
            {title}
          </AccessibleText>

          <AccessibleText style={styles.modalMessage}>
            {message}
          </AccessibleText>

          {remainingUsage !== null && remainingUsage >= 0 && (
            <View style={styles.usageContainer}>
              <Text style={styles.usageText}>
                Você ainda tem {remainingUsage} uso{remainingUsage !== 1 ? 's' : ''} restante{remainingUsage !== 1 ? 's' : ''} neste mês.
              </Text>
            </View>
          )}

          <View style={styles.premiumFeatures}>
            <Text style={styles.featuresTitle}>Com o Premium você também tem:</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Icon name="infinity" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Receitas ilimitadas</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="cloud-upload" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Backup na nuvem</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="robot" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Sugestões com IA</Text>
              </View>
              
              <View style={styles.featureItem}>
                <Icon name="headset" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Suporte prioritário</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <AccessibleButton
              style={styles.upgradeButton}
              onPress={onUpgrade}
              accessibilityLabel="Ver planos premium"
            >
              <Text style={styles.upgradeButtonText}>Ver Planos Premium</Text>
            </AccessibleButton>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              accessibilityLabel="Fechar"
              accessibilityRole="button"
            >
              <Text style={styles.closeButtonText}>Agora Não</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface PremiumBadgeProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  size = 'medium',
  style,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { container: 16, icon: 10, text: 8 };
      case 'large':
        return { container: 24, icon: 16, text: 12 };
      default:
        return { container: 20, icon: 12, text: 10 };
    }
  };

  const sizes = getSize();

  return (
    <View style={[styles.premiumBadge, { height: sizes.container }, style]}>
      <Icon name="crown" size={sizes.icon} color="#FFD700" />
      <Text style={[styles.premiumBadgeText, { fontSize: sizes.text }]}>
        PREMIUM
      </Text>
    </View>
  );
};

interface FeatureUsageIndicatorProps {
  featureKey: string;
  showLabel?: boolean;
  style?: any;
}

export const FeatureUsageIndicator: React.FC<FeatureUsageIndicatorProps> = ({
  featureKey,
  showLabel = true,
  style,
}) => {
  const { getFeatureUsage, getRemainingUsage } = useFeatureAccess();
  
  const usage = getFeatureUsage(featureKey);
  const remaining = getRemainingUsage(featureKey);

  if (!usage || usage.unlimited) {
    return null;
  }

  const percentage = (usage.used / usage.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = remaining === 0;

  return (
    <View style={[styles.usageIndicator, style]}>
      {showLabel && (
        <Text style={styles.usageLabel}>
          {usage.used} de {usage.limit} usado{usage.used !== 1 ? 's' : ''}
        </Text>
      )}
      
      <View style={styles.usageBar}>
        <View
          style={[
            styles.usageProgress,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: isAtLimit ? '#F44336' : isNearLimit ? '#FF9800' : '#4CAF50',
            },
          ]}
        />
      </View>

      {isNearLimit && (
        <Text style={[styles.usageWarning, isAtLimit && styles.usageError]}>
          {isAtLimit ? 'Limite atingido' : 'Próximo do limite'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  usageContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  usageText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
  },
  premiumFeatures: {
    width: '100%',
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  modalActions: {
    width: '100%',
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    color: '#FFD700',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  usageIndicator: {
    marginVertical: 8,
  },
  usageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  usageBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  usageProgress: {
    height: '100%',
    borderRadius: 2,
  },
  usageWarning: {
    fontSize: 10,
    color: '#FF9800',
    marginTop: 2,
  },
  usageError: {
    color: '#F44336',
  },
});