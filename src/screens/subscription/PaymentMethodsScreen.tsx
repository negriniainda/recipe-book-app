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
  FAB,
  ActivityIndicator,
  Portal,
  Dialog,
  TextInput,
  SegmentedButtons,
} from 'react-native-paper';
import {
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
} from '../../services/subscriptionApi';
import { PaymentMethod, CreatePaymentMethodRequest } from '../../types/subscription';

interface PaymentMethodsScreenProps {
  navigation: any;
}

const PaymentMethodsScreen: React.FC<PaymentMethodsScreenProps> = ({
  navigation,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [paymentType, setPaymentType] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const {
    data: paymentMethods = [],
    isLoading,
    refetch,
  } = useGetPaymentMethodsQuery();

  const [createPaymentMethod, { isLoading: isCreating }] = useCreatePaymentMethodMutation();
  const [updatePaymentMethod, { isLoading: isUpdating }] = useUpdatePaymentMethodMutation();
  const [deletePaymentMethod, { isLoading: isDeleting }] = useDeletePaymentMethodMutation();

  const handleCreatePaymentMethod = useCallback(async () => {
    if (paymentType === 'card') {
      if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
        Alert.alert('Erro', 'Preencha todos os campos do cartão');
        return;
      }
    }

    try {
      const data: CreatePaymentMethodRequest = {
        type: paymentType as any,
        token: `mock_token_${Date.now()}`, // Em produção, usar token real do processador
        isDefault: paymentMethods.length === 0,
        metadata: paymentType === 'card' ? {
          last4: cardNumber.slice(-4),
          brand: 'visa', // Detectar automaticamente
          expiryMonth: parseInt(expiryDate.split('/')[0]),
          expiryYear: parseInt(expiryDate.split('/')[1]),
          cardholderName,
        } : {},
      };

      const result = await createPaymentMethod(data).unwrap();
      
      Alert.alert(
        'Método Adicionado',
        'Seu método de pagamento foi adicionado com sucesso.'
      );
      
      setShowAddDialog(false);
      resetForm();
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao adicionar método de pagamento');
    }
  }, [paymentType, cardNumber, expiryDate, cvv, cardholderName, paymentMethods.length, createPaymentMethod]);

  const handleSetDefault = useCallback(async (paymentMethodId: string) => {
    try {
      await updatePaymentMethod({
        paymentMethodId,
        isDefault: true,
      }).unwrap();
      
      Alert.alert('Sucesso', 'Método de pagamento padrão atualizado');
    } catch (error: any) {
      Alert.alert('Erro', error.data?.message || 'Erro ao atualizar método de pagamento');
    }
  }, [updatePaymentMethod]);

  const handleDeletePaymentMethod = useCallback(async (paymentMethodId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja remover este método de pagamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePaymentMethod(paymentMethodId).unwrap();
              Alert.alert('Sucesso', 'Método de pagamento removido');
            } catch (error: any) {
              Alert.alert('Erro', error.data?.message || 'Erro ao remover método de pagamento');
            }
          },
        },
      ]
    );
  }, [deletePaymentMethod]);

  const resetForm = () => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setPaymentType('card');
  };

  const formatCardNumber = (text: string) => {
    // Formatar número do cartão (XXXX XXXX XXXX XXXX)
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    // Formatar data de expiração (MM/YY)
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const getPaymentMethodIcon = (method: PaymentMethod): string => {
    switch (method.type) {
      case 'card':
        return method.brand === 'visa' ? 'credit-card' : 
               method.brand === 'mastercard' ? 'credit-card' : 'credit-card';
      case 'paypal':
        return 'paypal';
      case 'apple_pay':
        return 'apple';
      case 'google_pay':
        return 'google-pay';
      case 'pix':
        return 'bank';
      default:
        return 'credit-card';
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method.type) {
      case 'card':
        return `**** ${method.last4} (${method.brand?.toUpperCase()})`;
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      case 'pix':
        return 'PIX';
      default:
        return method.type;
    }
  };

  const renderPaymentMethodCard = (method: PaymentMethod) => (
    <Card key={method.id} style={styles.paymentMethodCard}>
      <Card.Content>
        <View style={styles.paymentMethodHeader}>
          <View style={styles.paymentMethodInfo}>
            <List.Icon icon={getPaymentMethodIcon(method)} size={32} />
            <View style={styles.paymentMethodText}>
              <Text style={styles.paymentMethodLabel}>
                {getPaymentMethodLabel(method)}
              </Text>
              {method.expiryMonth && method.expiryYear && (
                <Text style={styles.paymentMethodExpiry}>
                  Expira em {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                </Text>
              )}
            </View>
          </View>
          
          {method.isDefault && (
            <Chip style={styles.defaultChip}>
              Padrão
            </Chip>
          )}
        </View>

        <View style={styles.paymentMethodActions}>
          {!method.isDefault && (
            <Button
              mode="outlined"
              onPress={() => handleSetDefault(method.id)}
              disabled={isUpdating}
              style={styles.methodActionButton}
            >
              Tornar Padrão
            </Button>
          )}
          
          <Button
            mode="text"
            onPress={() => handleDeletePaymentMethod(method.id)}
            disabled={isDeleting}
            textColor="#f44336"
            style={styles.methodActionButton}
          >
            Remover
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderAddDialog = () => (
    <Portal>
      <Dialog
        visible={showAddDialog}
        onDismiss={() => setShowAddDialog(false)}
        style={styles.addDialog}
      >
        <Dialog.Title>Adicionar Método de Pagamento</Dialog.Title>
        <Dialog.Content>
          <SegmentedButtons
            value={paymentType}
            onValueChange={setPaymentType}
            buttons={[
              { value: 'card', label: 'Cartão', icon: 'credit-card' },
              { value: 'pix', label: 'PIX', icon: 'bank' },
              { value: 'paypal', label: 'PayPal', icon: 'paypal' },
            ]}
            style={styles.paymentTypeSelector}
          />

          {paymentType === 'card' && (
            <>
              <TextInput
                label="Número do Cartão"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                style={styles.input}
                maxLength={19}
              />
              
              <View style={styles.cardRow}>
                <TextInput
                  label="MM/AA"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  maxLength={5}
                />
                
                <TextInput
                  label="CVV"
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                  maxLength={4}
                  secureTextEntry
                />
              </View>
              
              <TextInput
                label="Nome no Cartão"
                value={cardholderName}
                onChangeText={setCardholderName}
                style={styles.input}
                autoCapitalize="words"
              />
            </>
          )}

          {paymentType === 'pix' && (
            <Text style={styles.pixInfo}>
              O PIX será configurado no momento do pagamento
            </Text>
          )}

          {paymentType === 'paypal' && (
            <Text style={styles.paypalInfo}>
              Você será redirecionado para o PayPal para autorizar o pagamento
            </Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowAddDialog(false)}>
            Cancelar
          </Button>
          <Button
            onPress={handleCreatePaymentMethod}
            loading={isCreating}
            disabled={paymentType === 'card' && (!cardNumber || !expiryDate || !cvv || !cardholderName)}
          >
            Adicionar
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Métodos de Pagamento" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Carregando métodos de pagamento...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Métodos de Pagamento" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {paymentMethods.length > 0 ? (
          paymentMethods.map(renderPaymentMethodCard)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                Nenhum método de pagamento cadastrado
              </Text>
              <Text style={styles.emptySubtext}>
                Adicione um método de pagamento para assinar o plano premium
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        label="Adicionar"
        onPress={() => setShowAddDialog(true)}
      />

      {renderAddDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  paymentMethodCard: {
    marginBottom: 16,
    elevation: 2,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodText: {
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  paymentMethodExpiry: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  defaultChip: {
    backgroundColor: '#4caf50',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  methodActionButton: {
    flex: 1,
  },
  emptyCard: {
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  addDialog: {
    maxHeight: '80%',
  },
  paymentTypeSelector: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  pixInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  paypalInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default PaymentMethodsScreen;