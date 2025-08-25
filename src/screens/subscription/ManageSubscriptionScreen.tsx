import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  List,
  Chip,
  Divider,
  ProgressBar,
  ActivityIndicator,
  Portal,
  Dialog,
} from 'react-native-paper';
import {
  useSubscription,
  useSubscriptionStatus,
  useSubscriptionInsights,
} from '../../hooks/useSubscription';
import {
  useGetPaymentMethodsQuery,
  useGetPaymentsQuery,
} from '../../services/subscriptionApi';
import {
  formatPrice,
  formatInterval,
  getFeatureUsagePercentage,
  PREMIUM_FEATURES,
} from '../../types/subscription';

interface ManageSubscriptionScreenProps {
  navigation: any;
}

const ManageSubscriptionScreen: React.FC<ManageSubscriptionScreenProps> = ({
  navigation,
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    currentSubscription,
    featureUsage,
    cancelSubscription,
    reactivateSubscription,
    isCanceling,
    isReactivating,
  } = useSubscription();

  const {
    status,
    statusMessage,
    statusColor,
    timeLeft,
    isPremium,
    isCanceled,
    needsPaymentUpdate,
  } = useSubscriptionStatus();

  const {
    insights,
    valuePerMonth,
    timesSavedPerWeek,
    engagementScore,
  } = useSubscriptionInsights();

  const { data: paymentMethods = [] } = useGetPaymentMethodsQuery();
  const { data: paymentsData } = useGetPaymentsQuery({ limit: 5 });

  const handleCancelSubscription = useCallback(async (immediate: boolean = false) => {
    const result = await cancelSubscription(immediate);
    if (result.success) {
      setShowCancelDialog(false);
    }
  }, [cancelSubscription]);

  const handleReactivateSubscription = useCallback(async () => {
    const result = await reactivateSubscription();
    if (result.success) {
      // Sucesso já é tratado no hook
    }
  }, [reactivateSubscription]);

  const renderSubscriptionStatus = () => (
    <Card style={styles.statusCard}>
      <Card.Content>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Status da Assinatura</Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: statusColor }]}
            textStyle={styles.statusChipText}
          >
            {statusMessage}
          </Chip>
        </View>

        {currentSubscription && (
          <View style={styles.subscriptionDetails}>
            <Text style={styles.planName}>
              {currentSubscription.plan.displayName}
            </Text>
            <Text style={styles.planPrice}>
              {formatPrice(currentSubscription.plan.price)} por{' '}
              {formatInterval(currentSubscription.plan.interval)}
            </Text>
            
            {timeLeft && (
              <Text style={styles.timeLeft}>{timeLeft}</Text>
            )}

            {currentSubscription.nextPayment && (
              <Text style={styles.nextPayment}>
                Próximo pagamento: {formatPrice(currentSubscription.nextPayment.amount)} em{' '}
                {new Date(currentSubscription.nextPayment.date).toLocaleDateString('pt-BR')}
              </Text>
            )}
          </View>
        )}

        {needsPaymentUpdate && (
          <View style={styles.paymentWarning}>
            <Text style={styles.warningText}>
              ⚠️ Ação necessária: Atualize seu método de pagamento
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('PaymentMethods')}
              style={styles.warningButton}
            >
              Atualizar Pagamento
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderFeatureUsage = () => (
    <Card style={styles.usageCard}>
      <Card.Content>
        <Text style={styles.usageTitle}>Uso de Recursos Premium</Text>
        
        {Object.entries(featureUsage).map(([featureId, usage]) => {
          const feature = PREMIUM_FEATURES[featureId];
          if (!feature || usage.unlimited) return null;

          const percentage = getFeatureUsagePercentage(featureId, usage);
          
          return (
            <View key={featureId} style={styles.usageItem}>
              <View style={styles.usageHeader}>
                <Text style={styles.usageFeatureName}>{feature.name}</Text>
                <Text style={styles.usageCount}>
                  {usage.usageCount} / {usage.limit}
                </Text>
              </View>
              <ProgressBar
                progress={percentage / 100}
                color={percentage > 80 ? '#f44336' : percentage > 60 ? '#ff9800' : '#4caf50'}
                style={styles.usageProgress}
              />
            </View>
          );
        })}

        {Object.keys(featureUsage).length === 0 && (
          <Text style={styles.noUsageText}>
            Nenhum uso de recursos premium registrado ainda
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  const renderInsights = () => (
    <Card style={styles.insightsCard}>
      <Card.Content>
        <Text style={styles.insightsTitle}>Seus Insights Premium</Text>
        
        <View style={styles.insightsGrid}>
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {formatPrice(valuePerMonth)}
            </Text>
            <Text style={styles.insightLabel}>Valor por mês</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {Math.round(timesSavedPerWeek)}min
            </Text>
            <Text style={styles.insightLabel}>Tempo poupado/semana</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {engagementScore}%
            </Text>
            <Text style={styles.insightLabel}>Engajamento</Text>
          </View>
          
          <View style={styles.insightItem}>
            <Text style={styles.insightValue}>
              {insights?.featuresUsed || 0}
            </Text>
            <Text style={styles.insightLabel}>Recursos usados</Text>
          </View>
        </View>

        {insights?.recommendations && insights.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recomendações</Text>
            {insights.recommendations.map((recommendation, index) => (
              <Text key={index} style={styles.recommendationText}>
                • {recommendation}
              </Text>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const renderActions = () => (
    <Card style={styles.actionsCard}>
      <Card.Content>
        <Text style={styles.actionsTitle}>Gerenciar Assinatura</Text>
        
        <List.Item
          title="Alterar Plano"
          description="Upgrade ou downgrade do seu plano"
          left={(props) => <List.Icon {...props} icon="swap-horizontal" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('SubscriptionPlans')}
        />

        <List.Item
          title="Métodos de Pagamento"
          description="Gerenciar cartões e formas de pagamento"
          left={(props) => <List.Icon {...props} icon="credit-card" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('PaymentMethods')}
        />

        <List.Item
          title="Histórico de Pagamentos"
          description="Ver faturas e recibos"
          left={(props) => <List.Icon {...props} icon="receipt" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('PaymentHistory')}
        />

        <List.Item
          title="Exportar Dados"
          description="Baixar seus dados de cobrança"
          left={(props) => <List.Icon {...props} icon="download" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('ExportData')}
        />

        <Divider style={styles.actionsDivider} />

        {isCanceled ? (
          <Button
            mode="contained"
            onPress={handleReactivateSubscription}
            loading={isReactivating}
            style={styles.reactivateButton}
            icon="refresh"
          >
            Reativar Assinatura
          </Button>
        ) : isPremium ? (
          <Button
            mode="outlined"
            onPress={() => setShowCancelDialog(true)}
            style={styles.cancelButton}
            textColor="#f44336"
            icon="cancel"
          >
            Cancelar Assinatura
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('SubscriptionPlans')}
            style={styles.upgradeButton}
            icon="star"
          >
            Upgrade para Premium
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderCancelDialog = () => (
    <Portal>
      <Dialog
        visible={showCancelDialog}
        onDismiss={() => setShowCancelDialog(false)}
      >
        <Dialog.Title>Cancelar Assinatura</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.cancelDialogText}>
            Tem certeza que deseja cancelar sua assinatura premium?
          </Text>
          <Text style={styles.cancelDialogSubtext}>
            Você perderá acesso aos recursos premium no final do período atual.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowCancelDialog(false)}>
            Manter Assinatura
          </Button>
          <Button
            onPress={() => handleCancelSubscription(false)}
            loading={isCanceling}
            textColor="#f44336"
          >
            Cancelar no Final do Período
          </Button>
          <Button
            onPress={() => handleCancelSubscription(true)}
            loading={isCanceling}
            textColor="#f44336"
          >
            Cancelar Imediatamente
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  if (!currentSubscription) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Gerenciar Assinatura" />
        </Appbar.Header>
        
        <View style={styles.noSubscriptionContainer}>
          <Text style={styles.noSubscriptionText}>
            Você não possui uma assinatura ativa
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('SubscriptionPlans')}
            style={styles.subscribeButton}
          >
            Ver Planos Premium
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Gerenciar Assinatura" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('SubscriptionHelp')}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {renderSubscriptionStatus()}
        {isPremium && renderFeatureUsage()}
        {isPremium && insights && renderInsights()}
        {renderActions()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderCancelDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  noSubscriptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noSubscriptionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  subscribeButton: {
    paddingHorizontal: 24,
  },
  statusCard: {
    margin: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 12,
    color: '#fff',
  },
  subscriptionDetails: {
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: '#2196f3',
    marginBottom: 8,
  },
  timeLeft: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  nextPayment: {
    fontSize: 14,
    color: '#666',
  },
  paymentWarning: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningText: {
    fontSize: 14,
    color: '#e65100',
    marginBottom: 12,
  },
  warningButton: {
    backgroundColor: '#ff9800',
  },
  usageCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  usageItem: {
    marginBottom: 16,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageFeatureName: {
    fontSize: 14,
    color: '#333',
  },
  usageCount: {
    fontSize: 12,
    color: '#666',
  },
  usageProgress: {
    height: 6,
    borderRadius: 3,
  },
  noUsageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  insightsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  insightLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  recommendationsContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  actionsDivider: {
    marginVertical: 16,
  },
  cancelButton: {
    borderColor: '#f44336',
  },
  reactivateButton: {
    backgroundColor: '#4caf50',
  },
  upgradeButton: {
    backgroundColor: '#2196f3',
  },
  cancelDialogText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  cancelDialogSubtext: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default ManageSubscriptionScreen;