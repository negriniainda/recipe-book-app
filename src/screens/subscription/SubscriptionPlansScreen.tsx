import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Card,
  Text,
  Button,
  Chip,
  List,
  Divider,
  ActivityIndicator,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import { useSubscription, usePromoCode } from '../../hooks/useSubscription';
import {
  SubscriptionPlan,
  formatPrice,
  formatInterval,
  PREMIUM_FEATURES,
} from '../../types/subscription';

interface SubscriptionPlansScreenProps {
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

const SubscriptionPlansScreen: React.FC<SubscriptionPlansScreenProps> = ({
  navigation,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  const {
    plans,
    currentSubscription,
    isPremium,
    createSubscription,
    isCreating,
  } = useSubscription();

  const {
    validatePromoCode,
    applyPromoCode,
    isValidating,
    isApplying,
  } = usePromoCode();

  const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
  }, []);

  const handleSubscribe = useCallback(async () => {
    if (!selectedPlan) return;

    const result = await createSubscription({
      planId: selectedPlan.id,
      promoCode: promoCode || undefined,
    });

    if (result.success) {
      navigation.goBack();
    }
  }, [selectedPlan, promoCode, createSubscription, navigation]);

  const handleValidatePromoCode = useCallback(async () => {
    if (!promoCode.trim() || !selectedPlan) return;

    const result = await validatePromoCode({
      code: promoCode,
      planId: selectedPlan.id,
    });

    if (result.success && result.valid) {
      setPromoDiscount(result.discount);
    } else {
      setPromoDiscount(0);
    }
  }, [promoCode, selectedPlan, validatePromoCode]);

  const getDiscountedPrice = (plan: SubscriptionPlan): number => {
    if (promoDiscount > 0) {
      return Math.max(plan.price - promoDiscount, 0);
    }
    return plan.discount ? plan.price : plan.price;
  };

  const renderFeaturesList = (features: typeof PREMIUM_FEATURES) => (
    <View style={styles.featuresList}>
      {Object.values(features).slice(0, 8).map((feature) => (
        <View key={feature.id} style={styles.featureItem}>
          <List.Icon icon={feature.icon} size={20} />
          <View style={styles.featureText}>
            <Text style={styles.featureName}>{feature.name}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        </View>
      ))}
      {Object.values(features).length > 8 && (
        <Text style={styles.moreFeatures}>
          +{Object.values(features).length - 8} recursos adicionais
        </Text>
      )}
    </View>
  );

  const renderPlanCard = (plan: SubscriptionPlan) => {
    const isCurrentPlan = currentSubscription?.plan.id === plan.id;
    const isFree = plan.id === 'free';
    const discountedPrice = getDiscountedPrice(plan);
    const hasDiscount = discountedPrice < plan.price;

    return (
      <Card
        key={plan.id}
        style={[
          styles.planCard,
          plan.popular && styles.popularPlan,
          isCurrentPlan && styles.currentPlan,
        ]}
        onPress={() => handleSelectPlan(plan)}
      >
        {plan.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Mais Popular</Text>
          </View>
        )}

        <Card.Content style={styles.planContent}>
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{plan.displayName}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>
          </View>

          <View style={styles.priceContainer}>
            {!isFree ? (
              <>
                <View style={styles.priceRow}>
                  {hasDiscount && (
                    <Text style={styles.originalPrice}>
                      {formatPrice(plan.price)}
                    </Text>
                  )}
                  <Text style={styles.price}>
                    {formatPrice(discountedPrice)}
                  </Text>
                </View>
                <Text style={styles.interval}>
                  por {formatInterval(plan.interval, plan.intervalCount)}
                </Text>
                {plan.trialDays && (
                  <Chip style={styles.trialChip}>
                    {plan.trialDays} dias grátis
                  </Chip>
                )}
              </>
            ) : (
              <Text style={styles.freePrice}>Gratuito</Text>
            )}
          </View>

          {plan.discount && !hasDiscount && (
            <View style={styles.discountContainer}>
              <Chip style={styles.discountChip}>
                {plan.discount.percentage}% OFF
              </Chip>
              <Text style={styles.discountText}>
                Economize {formatPrice(plan.discount.originalPrice - plan.price)}
              </Text>
            </View>
          )}

          {!isFree && (
            <>
              <Divider style={styles.divider} />
              {renderFeaturesList(PREMIUM_FEATURES)}
            </>
          )}

          <View style={styles.planActions}>
            {isCurrentPlan ? (
              <Button
                mode="outlined"
                disabled
                style={styles.actionButton}
              >
                Plano Atual
              </Button>
            ) : isFree ? (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Settings')}
                style={styles.actionButton}
              >
                Gerenciar Conta
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => handleSelectPlan(plan)}
                style={styles.actionButton}
                disabled={isCreating}
              >
                {isPremium ? 'Alterar Plano' : 'Começar Agora'}
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderSubscriptionDialog = () => (
    <Portal>
      <Dialog
        visible={!!selectedPlan}
        onDismiss={() => setSelectedPlan(null)}
        style={styles.subscriptionDialog}
      >
        <Dialog.Title>Confirmar Assinatura</Dialog.Title>
        <Dialog.Content>
          {selectedPlan && (
            <>
              <Text style={styles.dialogPlanName}>
                {selectedPlan.displayName}
              </Text>
              <Text style={styles.dialogPrice}>
                {formatPrice(getDiscountedPrice(selectedPlan))} por{' '}
                {formatInterval(selectedPlan.interval)}
              </Text>

              {selectedPlan.trialDays && (
                <Text style={styles.trialInfo}>
                  Inclui {selectedPlan.trialDays} dias de teste gratuito
                </Text>
              )}

              <Button
                mode="outlined"
                onPress={() => setShowPromoDialog(true)}
                style={styles.promoButton}
              >
                Tenho um código promocional
              </Button>

              {promoDiscount > 0 && (
                <View style={styles.promoApplied}>
                  <Text style={styles.promoText}>
                    Código aplicado! Desconto: {formatPrice(promoDiscount)}
                  </Text>
                </View>
              )}
            </>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setSelectedPlan(null)}>
            Cancelar
          </Button>
          <Button
            onPress={handleSubscribe}
            loading={isCreating}
            disabled={!selectedPlan}
          >
            Confirmar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  const renderPromoDialog = () => (
    <Portal>
      <Dialog
        visible={showPromoDialog}
        onDismiss={() => setShowPromoDialog(false)}
      >
        <Dialog.Title>Código Promocional</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Código promocional"
            value={promoCode}
            onChangeText={setPromoCode}
            style={styles.promoInput}
            autoCapitalize="characters"
          />
          {promoDiscount > 0 && (
            <Text style={styles.promoValidText}>
              ✓ Código válido! Desconto: {formatPrice(promoDiscount)}
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowPromoDialog(false)}>
            Cancelar
          </Button>
          <Button
            onPress={handleValidatePromoCode}
            loading={isValidating}
            disabled={!promoCode.trim()}
          >
            Validar
          </Button>
          <Button
            onPress={() => {
              setShowPromoDialog(false);
              handleValidatePromoCode();
            }}
            disabled={!promoCode.trim() || promoDiscount === 0}
          >
            Aplicar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Planos Premium" />
        <Appbar.Action
          icon="help-circle"
          onPress={() => navigation.navigate('SubscriptionHelp')}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Header com benefícios */}
        <Card style={styles.benefitsCard}>
          <Card.Content>
            <Text style={styles.benefitsTitle}>
              Desbloqueie todo o potencial do Recipe Book
            </Text>
            <Text style={styles.benefitsDescription}>
              Acesso a recursos premium, backup ilimitado, sugestões de IA e muito mais
            </Text>
          </Card.Content>
        </Card>

        {/* Lista de planos */}
        <View style={styles.plansContainer}>
          {plans.map(renderPlanCard)}
        </View>

        {/* Informações adicionais */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>Informações Importantes</Text>
            <Text style={styles.infoText}>
              • Cancele a qualquer momento{'\n'}
              • Sem taxas ocultas{'\n'}
              • Suporte prioritário{'\n'}
              • Garantia de 30 dias{'\n'}
              • Sincronização entre dispositivos
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderSubscriptionDialog()}
      {renderPromoDialog()}
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
  benefitsCard: {
    margin: 16,
    elevation: 2,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitsDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    paddingHorizontal: 16,
  },
  planCard: {
    marginBottom: 16,
    elevation: 2,
    position: 'relative',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  currentPlan: {
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    right: 16,
    backgroundColor: '#2196f3',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    zIndex: 1,
    alignSelf: 'center',
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  planContent: {
    paddingTop: 24,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  freePrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  interval: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  trialChip: {
    backgroundColor: '#4caf50',
    marginTop: 8,
  },
  discountContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  discountChip: {
    backgroundColor: '#ff9800',
    marginBottom: 4,
  },
  discountText: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    flex: 1,
    marginLeft: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
  },
  moreFeatures: {
    fontSize: 12,
    color: '#2196f3',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  planActions: {
    marginTop: 8,
  },
  actionButton: {
    width: '100%',
  },
  infoCard: {
    margin: 16,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  subscriptionDialog: {
    maxWidth: screenWidth - 32,
  },
  dialogPlanName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  dialogPrice: {
    fontSize: 18,
    color: '#2196f3',
    textAlign: 'center',
    marginBottom: 16,
  },
  trialInfo: {
    fontSize: 14,
    color: '#4caf50',
    textAlign: 'center',
    marginBottom: 16,
  },
  promoButton: {
    marginBottom: 16,
  },
  promoApplied: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  promoText: {
    color: '#4caf50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  promoInput: {
    marginBottom: 16,
  },
  promoValidText: {
    color: '#4caf50',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 32,
  },
});

export default SubscriptionPlansScreen;