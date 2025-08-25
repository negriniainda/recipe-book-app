import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useUserSubscription,
  useFeatureAccess,
  usePremiumNotifications,
} from '../../hooks/usePremium';
import {
  formatPrice,
  getSubscriptionStatusColor,
  getSubscriptionStatusLabel,
  getDaysUntilExpiry,
} from '../../types/premium';
import { PremiumBadge, FeatureUsageIndicator } from '../../components/premium/PremiumGate';
import { AccessibilityWrapper } from '../../components/accessibility/AccessibilityWrapper';
import { AccessibleButton } from '../../components/accessibility/AccessibleButton';
import { AccessibleText } from '../../components/accessibility/AccessibleText';

export const ManagePremiumScreen: React.FC = () => {
  const navigation = useNavigation();
  const {
    subscription,
    isPremium,
    isTrialUser,
    daysUntilExpiry,
    cancelSubscription,
    upgrade,
    downgrade,
    refetch,
    isCanceling,
    isUpgrading,
    isDowngrading,
  } = useUserSubscription();
  
  const { featureUsage } = useFeatureAccess();
  const { notifications, dismissNotification } = usePremiumNotifications();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleCancelSubscription = useCallback(async () => {
    Alert.alert(
      'Cancelar Assinatura',
      'Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso aos recursos premium até o final do período atual.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelSubscription(false);
            if (result.success) {
              Alert.alert('Assinatura Cancelada', 'Sua assinatura foi cancelada com sucesso.');
            } else {
              Alert.alert('Erro', result.error);
            }
          },
        },
      ]
    );
  }, [cancelSubscription]);

  const handleUpgrade = useCallback((planId: string) => {
    Alert.alert(
      'Fazer Upgrade',
      'Deseja fazer upgrade para este plano? A diferença será cobrada proporcionalmente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const result = await upgrade(planId);
            if (result.success) {
              Alert.alert('Upgrade Realizado', 'Seu plano foi atualizado com sucesso!');
            } else {
              Alert.alert('Erro', result.error);
            }
          },
        },
      ]
    );
  }, [upgrade]);

  const renderSubscriptionStatus = useCallback(() => {
    if (!subscription) {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon name="account-outline" size={24} color="#666" />
            <Text style={styles.statusTitle}>Usuário Gratuito</Text>
          </View>
          <Text style={styles.statusDescription}>
            Você está usando a versão gratuita do Recipe Book.
          </Text>
          <AccessibleButton
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('PremiumPlans' as never)}
            accessibilityLabel="Ver planos premium"
          >
            <Text style={styles.upgradeButtonText}>Ver Planos Premium</Text>
          </AccessibleButton>
        </View>
      );
    }

    const statusColor = getSubscriptionStatusColor(subscription.status);
    const statusLabel = getSubscriptionStatusLabel(subscription.status);

    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusIconContainer}>
            <Icon name="crown" size={24} color="#FFD700" />
            <PremiumBadge size="small" style={styles.statusBadge} />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>{subscription.plan.displayName}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusLabel}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.subscriptionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Preço:</Text>
            <Text style={styles.detailValue}>
              {formatPrice(subscription.plan.price)}/{subscription.plan.interval === 'monthly' ? 'mês' : 'ano'}
            </Text>
          </View>

          {subscription.currentPeriodEnd && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {subscription.status === 'trial' ? 'Teste termina em:' : 'Próxima cobrança:'}
              </Text>
              <Text style={styles.detailValue}>
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                {daysUntilExpiry !== null && (
                  <Text style={styles.daysRemaining}>
                    {' '}({daysUntilExpiry} dia{daysUntilExpiry !== 1 ? 's' : ''})
                  </Text>
                )}
              </Text>
            </View>
          )}

          {subscription.cancelAtPeriodEnd && (
            <View style={styles.cancelNotice}>
              <Icon name="information" size={16} color="#FF9800" />
              <Text style={styles.cancelNoticeText}>
                Sua assinatura será cancelada no final do período atual.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }, [subscription, daysUntilExpiry, navigation]);

  const renderNotifications = useCallback(() => {
    if (notifications.length === 0) return null;

    return (
      <View style={styles.notificationsSection}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <View style={styles.notificationContent}>
              <Icon
                name={
                  notification.type === 'trial_ending' ? 'clock-alert' :
                  notification.type === 'payment_failed' ? 'alert-circle' :
                  'information'
                }
                size={20}
                color={
                  notification.type === 'payment_failed' ? '#F44336' :
                  notification.type === 'trial_ending' ? '#FF9800' :
                  '#2196F3'
                }
              />
              <Text style={styles.notificationText}>{notification.message}</Text>
            </View>
            <TouchableOpacity
              onPress={() => dismissNotification(notification.id)}
              style={styles.dismissButton}
              accessibilityLabel="Dispensar notificação"
            >
              <Icon name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  }, [notifications, dismissNotification]);

  const renderFeatureUsage = useCallback(() => {
    if (!featureUsage || featureUsage.length === 0) return null;

    const limitedFeatures = featureUsage.filter(usage => !usage.unlimited);
    if (limitedFeatures.length === 0) return null;

    return (
      <View style={styles.usageSection}>
        <Text style={styles.sectionTitle}>Uso de Recursos</Text>
        {limitedFeatures.map((usage) => (
          <View key={usage.featureKey} style={styles.usageCard}>
            <Text style={styles.usageFeatureName}>
              {getFeatureName(usage.featureKey)}
            </Text>
            <FeatureUsageIndicator
              featureKey={usage.featureKey}
              showLabel={true}
            />
          </View>
        ))}
      </View>
    );
  }, [featureUsage]);

  const getFeatureName = (featureKey: string): string => {
    const featureNames: Record<string, string> = {
      unlimitedRecipes: 'Receitas',
      unlimitedMealPlans: 'Planejamentos de Refeição',
      cloudStorage: 'Armazenamento na Nuvem',
      aiSuggestions: 'Sugestões com IA',
      advancedFeaturesUsed: 'Recursos Avançados',
    };
    return featureNames[featureKey] || featureKey;
  };

  const renderManagementOptions = useCallback(() => {
    if (!subscription) return null;

    return (
      <View style={styles.managementSection}>
        <Text style={styles.sectionTitle}>Gerenciar Assinatura</Text>

        <TouchableOpacity
          style={styles.managementOption}
          onPress={() => navigation.navigate('PaymentMethods' as never)}
          accessibilityRole="button"
          accessibilityLabel="Gerenciar métodos de pagamento"
        >
          <Icon name="credit-card" size={24} color="#666" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Métodos de Pagamento</Text>
            <Text style={styles.optionDescription}>
              Adicionar ou alterar cartões e formas de pagamento
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.managementOption}
          onPress={() => navigation.navigate('BillingHistory' as never)}
          accessibilityRole="button"
          accessibilityLabel="Ver histórico de cobrança"
        >
          <Icon name="receipt" size={24} color="#666" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Histórico de Cobrança</Text>
            <Text style={styles.optionDescription}>
              Ver faturas e histórico de pagamentos
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.managementOption}
          onPress={() => navigation.navigate('PremiumPlans' as never)}
          accessibilityRole="button"
          accessibilityLabel="Alterar plano"
        >
          <Icon name="swap-horizontal" size={24} color="#666" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Alterar Plano</Text>
            <Text style={styles.optionDescription}>
              Fazer upgrade ou downgrade do seu plano
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
          <TouchableOpacity
            style={[styles.managementOption, styles.dangerOption]}
            onPress={handleCancelSubscription}
            disabled={isCanceling}
            accessibilityRole="button"
            accessibilityLabel="Cancelar assinatura"
          >
            <Icon name="cancel" size={24} color="#F44336" />
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, styles.dangerText]}>
                Cancelar Assinatura
              </Text>
              <Text style={styles.optionDescription}>
                Cancelar no final do período atual
              </Text>
            </View>
            {isCanceling ? (
              <ActivityIndicator color="#F44336" />
            ) : (
              <Icon name="chevron-right" size={24} color="#F44336" />
            )}
          </TouchableOpacity>
        )}

        {subscription.cancelAtPeriodEnd && (
          <TouchableOpacity
            style={styles.managementOption}
            onPress={() => {
              // Reativar assinatura
              Alert.alert(
                'Reativar Assinatura',
                'Deseja reativar sua assinatura? Ela continuará normalmente.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Reativar',
                    onPress: async () => {
                      // Implementar reativação
                      console.log('Reativar assinatura');
                    },
                  },
                ]
              );
            }}
            accessibilityRole="button"
            accessibilityLabel="Reativar assinatura"
          >
            <Icon name="refresh" size={24} color="#4CAF50" />
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: '#4CAF50' }]}>
                Reativar Assinatura
              </Text>
              <Text style={styles.optionDescription}>
                Continuar com sua assinatura premium
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#4CAF50" />
          </TouchableOpacity>
        )}
      </View>
    );
  }, [subscription, navigation, handleCancelSubscription, isCanceling]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        
        <AccessibleText style={styles.headerTitle}>
          Gerenciar Premium
        </AccessibleText>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FF6B35']}
          />
        }
      >
        {renderSubscriptionStatus()}
        {renderNotifications()}
        {renderFeatureUsage()}
        {renderManagementOptions()}

        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>Precisa de Ajuda?</Text>
          
          <TouchableOpacity
            style={styles.supportOption}
            onPress={() => {
              // Navegar para suporte
              console.log('Abrir suporte');
            }}
            accessibilityRole="button"
            accessibilityLabel="Entrar em contato com suporte"
          >
            <Icon name="headset" size={24} color="#FF6B35" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Suporte Premium</Text>
              <Text style={styles.optionDescription}>
                Atendimento prioritário para usuários premium
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportOption}
            onPress={() => {
              // Navegar para FAQ
              console.log('Abrir FAQ');
            }}
            accessibilityRole="button"
            accessibilityLabel="Ver perguntas frequentes"
          >
            <Icon name="help-circle" size={24} color="#FF6B35" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Perguntas Frequentes</Text>
              <Text style={styles.optionDescription}>
                Respostas para dúvidas comuns sobre o Premium
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dúvidas sobre cobrança? Entre em contato conosco em suporte@recipebook.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusBadge: {
    marginLeft: 8,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  subscriptionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  daysRemaining: {
    color: '#666',
    fontWeight: 'normal',
  },
  cancelNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  cancelNoticeText: {
    fontSize: 14,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notificationsSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  dismissButton: {
    padding: 4,
  },
  usageSection: {
    margin: 16,
    marginTop: 0,
  },
  usageCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  usageFeatureName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  managementSection: {
    margin: 16,
    marginTop: 0,
  },
  managementOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dangerOption: {
    backgroundColor: '#FFF5F5',
  },
  optionContent: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  dangerText: {
    color: '#F44336',
  },
  supportSection: {
    margin: 16,
    marginTop: 0,
  },
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});