import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  ProgressBar,
  Portal,
  Dialog,
} from 'react-native-paper';
import { useFeatureAccess } from '../../hooks/useSubscription';
import {
  PREMIUM_FEATURES,
  formatPrice,
  getFeatureUsagePercentage,
} from '../../types/subscription';

interface PremiumFeatureGateProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  onUpgradePress?: () => void;
  style?: any;
}

const PremiumFeatureGate: React.FC<PremiumFeatureGateProps> = ({
  featureId,
  children,
  fallback,
  showUpgradePrompt = true,
  onUpgradePress,
  style,
}) => {
  const {
    hasAccess,
    feature,
    usage,
    usagePercentage,
    remainingUsage,
    requiresUpgrade,
    trackUsage,
  } = useFeatureAccess(featureId);

  const [showUpgradeDialog, setShowUpgradeDialog] = React.useState(false);

  const handleFeatureUse = useCallback(async () => {
    if (hasAccess) {
      await trackUsage();
      return true;
    }
    
    if (showUpgradePrompt) {
      setShowUpgradeDialog(true);
    }
    
    return false;
  }, [hasAccess, trackUsage, showUpgradePrompt]);

  const handleUpgrade = useCallback(() => {
    setShowUpgradeDialog(false);
    if (onUpgradePress) {
      onUpgradePress();
    }
  }, [onUpgradePress]);

  // Se tem acesso, renderizar o conteúdo
  if (hasAccess) {
    return (
      <View style={style}>
        {children}
        {usage && !usage.unlimited && (
          <UsageIndicator
            feature={feature}
            usage={usage}
            usagePercentage={usagePercentage}
            remainingUsage={remainingUsage}
          />
        )}
      </View>
    );
  }

  // Se tem fallback personalizado, usar ele
  if (fallback) {
    return <View style={style}>{fallback}</View>;
  }

  // Renderizar prompt de upgrade padrão
  return (
    <View style={style}>
      <PremiumPrompt
        feature={feature}
        onUpgradePress={() => setShowUpgradeDialog(true)}
        onFeatureUse={handleFeatureUse}
      />
      
      <UpgradeDialog
        visible={showUpgradeDialog}
        feature={feature}
        onDismiss={() => setShowUpgradeDialog(false)}
        onUpgrade={handleUpgrade}
      />
    </View>
  );
};

interface UsageIndicatorProps {
  feature: any;
  usage: any;
  usagePercentage: number;
  remainingUsage: number | null;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  feature,
  usage,
  usagePercentage,
  remainingUsage,
}) => {
  if (!feature || !usage || usage.unlimited) return null;

  const isNearLimit = usagePercentage > 80;
  const color = usagePercentage > 90 ? '#f44336' : 
                usagePercentage > 80 ? '#ff9800' : '#4caf50';

  return (
    <Card style={styles.usageCard}>
      <Card.Content style={styles.usageContent}>
        <View style={styles.usageHeader}>
          <Text style={styles.usageTitle}>{feature.name}</Text>
          <Chip
            style={[styles.usageChip, { backgroundColor: color }]}
            textStyle={styles.usageChipText}
          >
            {usage.usageCount}/{usage.limit}
          </Chip>
        </View>
        
        <ProgressBar
          progress={usagePercentage / 100}
          color={color}
          style={styles.usageProgress}
        />
        
        {isNearLimit && (
          <Text style={styles.usageWarning}>
            ⚠️ Restam apenas {remainingUsage} usos este mês
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

interface PremiumPromptProps {
  feature: any;
  onUpgradePress: () => void;
  onFeatureUse: () => Promise<boolean>;
}

const PremiumPrompt: React.FC<PremiumPromptProps> = ({
  feature,
  onUpgradePress,
  onFeatureUse,
}) => {
  return (
    <Card style={styles.premiumCard}>
      <Card.Content style={styles.premiumContent}>
        <View style={styles.premiumHeader}>
          <Text style={styles.premiumIcon}>⭐</Text>
          <Text style={styles.premiumTitle}>Recurso Premium</Text>
        </View>
        
        <Text style={styles.premiumFeatureName}>
          {feature?.name || 'Recurso Premium'}
        </Text>
        
        <Text style={styles.premiumDescription}>
          {feature?.description || 'Este recurso está disponível apenas para usuários premium.'}
        </Text>
        
        <View style={styles.premiumActions}>
          <Button
            mode="contained"
            onPress={onUpgradePress}
            style={styles.upgradeButton}
            icon="star"
          >
            Upgrade Premium
          </Button>
          
          <Button
            mode="text"
            onPress={onFeatureUse}
            style={styles.tryButton}
          >
            Experimentar
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

interface UpgradeDialogProps {
  visible: boolean;
  feature: any;
  onDismiss: () => void;
  onUpgrade: () => void;
}

const UpgradeDialog: React.FC<UpgradeDialogProps> = ({
  visible,
  feature,
  onDismiss,
  onUpgrade,
}) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Upgrade para Premium</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.dialogText}>
            Para usar {feature?.name || 'este recurso'}, você precisa de uma assinatura premium.
          </Text>
          
          <View style={styles.dialogBenefits}>
            <Text style={styles.dialogBenefitsTitle}>Com o Premium você terá:</Text>
            <Text style={styles.dialogBenefit}>• Acesso ilimitado a todos os recursos</Text>
            <Text style={styles.dialogBenefit}>• Backup automático na nuvem</Text>
            <Text style={styles.dialogBenefit}>• Sugestões personalizadas com IA</Text>
            <Text style={styles.dialogBenefit}>• Suporte prioritário</Text>
          </View>
          
          <View style={styles.dialogPricing}>
            <Text style={styles.dialogPrice}>A partir de {formatPrice(14.90)}/mês</Text>
            <Text style={styles.dialogTrial}>7 dias grátis para testar</Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Agora Não</Button>
          <Button onPress={onUpgrade} mode="contained">
            Ver Planos
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

// Hook para usar o gate de forma programática
export const usePremiumFeatureGate = (featureId: string) => {
  const { hasAccess, trackUsage } = useFeatureAccess(featureId);
  
  const checkAccess = useCallback(async (): Promise<boolean> => {
    if (hasAccess) {
      await trackUsage();
      return true;
    }
    return false;
  }, [hasAccess, trackUsage]);
  
  return {
    hasAccess,
    checkAccess,
  };
};

// Componente HOC para proteger telas inteiras
export const withPremiumFeature = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  featureId: string,
  fallbackComponent?: React.ComponentType<P>
) => {
  return (props: P) => {
    const { hasAccess } = useFeatureAccess(featureId);
    
    if (hasAccess) {
      return <WrappedComponent {...props} />;
    }
    
    if (fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent {...props} />;
    }
    
    return (
      <PremiumFeatureGate featureId={featureId}>
        <WrappedComponent {...props} />
      </PremiumFeatureGate>
    );
  };
};

const styles = StyleSheet.create({
  usageCard: {
    marginTop: 8,
    backgroundColor: '#f8f9fa',
  },
  usageContent: {
    paddingVertical: 8,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageTitle: {
    fontSize: 12,
    color: '#666',
  },
  usageChip: {
    height: 20,
  },
  usageChipText: {
    fontSize: 10,
    color: '#fff',
  },
  usageProgress: {
    height: 4,
    borderRadius: 2,
  },
  usageWarning: {
    fontSize: 11,
    color: '#ff9800',
    marginTop: 4,
    textAlign: 'center',
  },
  premiumCard: {
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ffb74d',
  },
  premiumContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e65100',
  },
  premiumFeatureName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  premiumDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  premiumActions: {
    flexDirection: 'row',
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: '#ff9800',
  },
  tryButton: {
    // Estilo padrão
  },
  dialogText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  dialogBenefits: {
    marginBottom: 16,
  },
  dialogBenefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dialogBenefit: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dialogPricing: {
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  dialogPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  dialogTrial: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 4,
  },
});

export default PremiumFeatureGate;