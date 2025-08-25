import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePremiumPlans, useUserSubscription, useCoupons } from '../../hooks/usePremium';
import { PremiumPlan, formatPrice } from '../../types/premium';
import { AccessibilityWrapper } from '../../components/accessibility/AccessibilityWrapper';
import { AccessibleButton } from '../../components/accessibility/AccessibleButton';
import { AccessibleText } from '../../components/accessibility/AccessibleText';

interface PremiumPlansScreenProps {}

export const PremiumPlansScreen: React.FC<PremiumPlansScreenProps> = () => {
  const navigation = useNavigation();
  const { plans, offers, popularPlan, isLoading } = usePremiumPlans();
  const { subscription, isPremium, startTrial, createSubscription } = useUserSubscription();
  const { applyCoupon, currentCoupon, couponValidation } = useCoupons();
  
  const [selectedPlan, setSelectedPlan] = useState<PremiumPlan | null>(null);
  const [showAnnual, setShowAnnual] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredPlans = plans.filter(plan => 
    showAnnual ? plan.interval === 'yearly' : plan.interval === 'monthly'
  );

  const handlePlanSelect = useCallback((plan: PremiumPlan) => {
    setSelectedPlan(plan);
  }, []);

  const handleStartTrial = useCallback(async (planId: string) => {
    setIsProcessing(true);
    try {
      const result = await startTrial(planId);
      if (result.success) {
        Alert.alert(
          'Período de Teste Iniciado!',
          'Você agora tem acesso a todos os recursos premium por 7 dias.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível iniciar o período de teste.');
    } finally {
      setIsProcessing(false);
    }
  }, [startTrial, navigation]);

  const handleSubscribe = useCallback(async (planId: string) => {
    setIsProcessing(true);
    try {
      const result = await createSubscription({
        planId,
        couponCode: currentCoupon || undefined,
      });
      
      if (result.success) {
        Alert.alert(
          'Assinatura Criada!',
          'Bem-vindo ao Recipe Book Premium!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar a assinatura.');
    } finally {
      setIsProcessing(false);
    }
  }, [createSubscription, currentCoupon, navigation]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    
    const result = await applyCoupon({
      code: couponCode.trim(),
      planId: selectedPlan?.id,
    });
    
    if (result.success && result.validation?.valid) {
      Alert.alert('Cupom Aplicado!', `Desconto de ${result.validation.discountPercentage}% aplicado.`);
    } else {
      Alert.alert('Cupom Inválido', result.validation?.error || 'Cupom não encontrado ou expirado.');
    }
  }, [couponCode, selectedPlan, applyCoupon]);

  const calculateDiscountedPrice = useCallback((plan: PremiumPlan) => {
    if (!couponValidation?.valid || !couponValidation.discountPercentage) {
      return plan.price;
    }
    return plan.price * (1 - couponValidation.discountPercentage / 100);
  }, [couponValidation]);

  const renderPlanCard = useCallback((plan: PremiumPlan) => {
    const isSelected = selectedPlan?.id === plan.id;
    const discountedPrice = calculateDiscountedPrice(plan);
    const hasDiscount = discountedPrice !== plan.price;
    
    return (
      <AccessibilityWrapper
        key={plan.id}
        accessibilityRole="button"
        accessibilityLabel={`Plano ${plan.displayName}, ${formatPrice(plan.price)} por ${plan.interval === 'monthly' ? 'mês' : 'ano'}`}
        accessibilityHint="Toque para selecionar este plano"
      >
        <TouchableOpacity
          style={[
            styles.planCard,
            isSelected && styles.selectedPlan,
            plan.popular && styles.popularPlan,
          ]}
          onPress={() => handlePlanSelect(plan)}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>MAIS POPULAR</Text>
            </View>
          )}
          
          <View style={styles.planHeader}>
            <AccessibleText style={styles.planName}>
              {plan.displayName}
            </AccessibleText>
            <AccessibleText style={styles.planDescription}>
              {plan.description}
            </AccessibleText>
          </View>

          <View style={styles.priceContainer}>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatPrice(plan.price)}
              </Text>
            )}
            <Text style={styles.price}>
              {formatPrice(discountedPrice)}
            </Text>
            <Text style={styles.interval}>
              /{plan.interval === 'monthly' ? 'mês' : 'ano'}
            </Text>
          </View>

          {plan.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {plan.discount.percentage}% OFF
              </Text>
            </View>
          )}

          <View style={styles.featuresContainer}>
            {plan.features.slice(0, 4).map((feature) => (
              <View key={feature.id} style={styles.featureItem}>
                <Icon name="check" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>{feature.name}</Text>
              </View>
            ))}
            {plan.features.length > 4 && (
              <Text style={styles.moreFeatures}>
                +{plan.features.length - 4} recursos adicionais
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </AccessibilityWrapper>
    );
  }, [selectedPlan, calculateDiscountedPrice, handlePlanSelect]);

  const renderActionButton = useCallback((plan: PremiumPlan) => {
    if (isPremium && subscription?.planId === plan.id) {
      return (
        <View style={styles.currentPlanButton}>
          <Text style={styles.currentPlanText}>Plano Atual</Text>
        </View>
      );
    }

    const canStartTrial = !isPremium && !subscription && plan.trialDays;
    
    return (
      <AccessibleButton
        style={[
          styles.actionButton,
          plan.popular && styles.popularActionButton,
        ]}
        onPress={() => {
          if (canStartTrial) {
            handleStartTrial(plan.id);
          } else {
            handleSubscribe(plan.id);
          }
        }}
        disabled={isProcessing}
        accessibilityLabel={canStartTrial ? `Iniciar teste grátis de ${plan.trialDays} dias` : `Assinar plano ${plan.displayName}`}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.actionButtonText}>
            {canStartTrial ? `Teste Grátis ${plan.trialDays} Dias` : 'Assinar Agora'}
          </Text>
        )}
      </AccessibleButton>
    );
  }, [isPremium, subscription, isProcessing, handleStartTrial, handleSubscribe]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Carregando planos...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Planos Premium
        </AccessibleText>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <AccessibleText style={styles.heroTitle}>
            Desbloqueie Todo o Potencial
          </AccessibleText>
          <AccessibleText style={styles.heroSubtitle}>
            Acesse recursos exclusivos e organize suas receitas como nunca antes
          </AccessibleText>
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, !showAnnual && styles.activeToggle]}
            onPress={() => setShowAnnual(false)}
            accessibilityRole="button"
            accessibilityLabel="Ver planos mensais"
          >
            <Text style={[styles.toggleText, !showAnnual && styles.activeToggleText]}>
              Mensal
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.toggleButton, showAnnual && styles.activeToggle]}
            onPress={() => setShowAnnual(true)}
            accessibilityRole="button"
            accessibilityLabel="Ver planos anuais"
          >
            <Text style={[styles.toggleText, showAnnual && styles.activeToggleText]}>
              Anual
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Economize 17%</Text>
            </View>
          </TouchableOpacity>
        </View>

        {offers.length > 0 && (
          <View style={styles.offersContainer}>
            <Text style={styles.offersTitle}>🎉 Ofertas Especiais</Text>
            {offers.map((offer) => (
              <View key={offer.id} style={styles.offerCard}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerDescription}>{offer.description}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.plansContainer}>
          {filteredPlans.map(renderPlanCard)}
        </View>

        <View style={styles.couponContainer}>
          <Text style={styles.couponTitle}>Tem um cupom de desconto?</Text>
          <View style={styles.couponInputContainer}>
            <TextInput
              style={styles.couponInput}
              placeholder="Digite o código do cupom"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              accessibilityLabel="Campo para código do cupom"
            />
            <TouchableOpacity
              style={styles.couponButton}
              onPress={handleApplyCoupon}
              disabled={!couponCode.trim()}
              accessibilityLabel="Aplicar cupom"
              accessibilityRole="button"
            >
              <Text style={styles.couponButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
          
          {couponValidation?.valid && (
            <View style={styles.couponSuccess}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.couponSuccessText}>
                Cupom aplicado! Desconto de {couponValidation.discountPercentage}%
              </Text>
            </View>
          )}
        </View>

        {selectedPlan && (
          <View style={styles.actionContainer}>
            {renderActionButton(selectedPlan)}
          </View>
        )}

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Por que escolher o Premium?</Text>
          
          <View style={styles.benefitItem}>
            <Icon name="infinity" size={24} color="#FF6B35" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Receitas Ilimitadas</Text>
              <Text style={styles.benefitDescription}>
                Crie e salve quantas receitas quiser, sem limites
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Icon name="cloud-upload" size={24} color="#FF6B35" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Backup na Nuvem</Text>
              <Text style={styles.benefitDescription}>
                Suas receitas sempre seguras e sincronizadas
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Icon name="robot" size={24} color="#FF6B35" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Sugestões com IA</Text>
              <Text style={styles.benefitDescription}>
                Recomendações inteligentes baseadas no seu gosto
              </Text>
            </View>
          </View>

          <View style={styles.benefitItem}>
            <Icon name="headset" size={24} color="#FF6B35" />
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Suporte Prioritário</Text>
              <Text style={styles.benefitDescription}>
                Atendimento rápido e personalizado
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Perguntas Frequentes</Text>
          
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Posso cancelar a qualquer momento?</Text>
            <Text style={styles.faqAnswer}>
              Sim! Você pode cancelar sua assinatura a qualquer momento. 
              Continuará tendo acesso aos recursos premium até o final do período pago.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>O que acontece com minhas receitas se eu cancelar?</Text>
            <Text style={styles.faqAnswer}>
              Suas receitas ficam salvas! Você só perde acesso aos recursos premium, 
              mas todas as suas receitas continuam disponíveis.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Posso mudar de plano depois?</Text>
            <Text style={styles.faqAnswer}>
              Claro! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento 
              nas configurações da sua conta.
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao assinar, você concorda com nossos Termos de Uso e Política de Privacidade.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  heroSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeToggleText: {
    color: '#333',
  },
  saveBadge: {
    marginLeft: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  offersContainer: {
    margin: 16,
    marginTop: 0,
  },
  offersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  offerCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 8,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#BF360C',
  },
  plansContainer: {
    paddingHorizontal: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  selectedPlan: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF8F6',
  },
  popularPlan: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planHeader: {
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
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  interval: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  currentPlanButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  popularActionButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  couponContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  couponInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  couponButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    justifyContent: 'center',
  },
  couponButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  couponSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  couponSuccessText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  benefitsSection: {
    padding: 16,
    backgroundColor: '#F8F9FA',
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  faqSection: {
    padding: 16,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: 20,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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