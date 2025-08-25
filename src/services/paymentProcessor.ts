import { Alert } from 'react-native';
import { PaymentMethod, CreatePaymentMethodRequest } from '../types/premium';

// Tipos para diferentes processadores de pagamento
export interface PaymentProcessorConfig {
  stripe?: {
    publishableKey: string;
    merchantId?: string;
  };
  mercadoPago?: {
    publicKey: string;
  };
  paypal?: {
    clientId: string;
    environment: 'sandbox' | 'production';
  };
  applePay?: {
    merchantId: string;
    supportedNetworks: string[];
  };
  googlePay?: {
    merchantId: string;
    environment: 'TEST' | 'PRODUCTION';
  };
}

export interface PaymentResult {
  success: boolean;
  token?: string;
  error?: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  clientSecret?: string;
}

class PaymentProcessorService {
  private config: PaymentProcessorConfig = {};
  private initialized = false;

  async initialize(config: PaymentProcessorConfig): Promise<void> {
    this.config = config;
    
    try {
      // Inicializar Stripe se configurado
      if (config.stripe) {
        await this.initializeStripe(config.stripe);
      }

      // Inicializar Mercado Pago se configurado
      if (config.mercadoPago) {
        await this.initializeMercadoPago(config.mercadoPago);
      }

      // Inicializar PayPal se configurado
      if (config.paypal) {
        await this.initializePayPal(config.paypal);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar processadores de pagamento:', error);
      throw error;
    }
  }

  private async initializeStripe(config: { publishableKey: string; merchantId?: string }): Promise<void> {
    try {
      // Importar e inicializar Stripe
      const { initStripe } = await import('@stripe/stripe-react-native');
      await initStripe({
        publishableKey: config.publishableKey,
        merchantIdentifier: config.merchantId,
        urlScheme: 'recipebook',
      });
    } catch (error) {
      console.error('Erro ao inicializar Stripe:', error);
    }
  }

  private async initializeMercadoPago(config: { publicKey: string }): Promise<void> {
    try {
      // Inicializar Mercado Pago SDK
      // Implementar quando necessário
      console.log('Inicializando Mercado Pago com chave:', config.publicKey);
    } catch (error) {
      console.error('Erro ao inicializar Mercado Pago:', error);
    }
  }

  private async initializePayPal(config: { clientId: string; environment: string }): Promise<void> {
    try {
      // Inicializar PayPal SDK
      // Implementar quando necessário
      console.log('Inicializando PayPal:', config);
    } catch (error) {
      console.error('Erro ao inicializar PayPal:', error);
    }
  }

  // Stripe Payment Methods
  async createStripePaymentMethod(cardDetails: {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    holderName?: string;
  }): Promise<PaymentResult> {
    if (!this.config.stripe) {
      return { success: false, error: 'Stripe não configurado' };
    }

    try {
      const { createPaymentMethod } = await import('@stripe/stripe-react-native');
      
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        card: {
          number: cardDetails.number,
          expMonth: cardDetails.expMonth,
          expYear: cardDetails.expYear,
          cvc: cardDetails.cvc,
        },
        billingDetails: {
          name: cardDetails.holderName,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        token: paymentMethod?.id,
        paymentMethod: {
          id: paymentMethod?.id || '',
          type: 'card',
          brand: paymentMethod?.card?.brand,
          last4: paymentMethod?.card?.last4,
          expiryMonth: paymentMethod?.card?.expMonth,
          expiryYear: paymentMethod?.card?.expYear,
          default: false,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async confirmStripePayment(paymentIntentClientSecret: string, paymentMethodId?: string): Promise<PaymentResult> {
    if (!this.config.stripe) {
      return { success: false, error: 'Stripe não configurado' };
    }

    try {
      const { confirmPayment } = await import('@stripe/stripe-react-native');
      
      const { paymentIntent, error } = await confirmPayment(paymentIntentClientSecret, {
        paymentMethodType: 'Card',
        paymentMethodId,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: paymentIntent?.status === 'Succeeded',
        token: paymentIntent?.id,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Apple Pay
  async isApplePaySupported(): Promise<boolean> {
    try {
      const { isApplePaySupported } = await import('@stripe/stripe-react-native');
      return await isApplePaySupported();
    } catch {
      return false;
    }
  }

  async presentApplePay(amount: number, currency: string = 'BRL'): Promise<PaymentResult> {
    if (!this.config.stripe || !this.config.applePay) {
      return { success: false, error: 'Apple Pay não configurado' };
    }

    try {
      const { presentApplePay, confirmApplePayPayment } = await import('@stripe/stripe-react-native');
      
      const { error } = await presentApplePay({
        cartItems: [
          {
            label: 'Recipe Book Premium',
            amount: (amount / 100).toFixed(2),
            paymentType: 'Immediate',
          },
        ],
        country: 'BR',
        currency: currency.toUpperCase(),
        requiredShippingAddressFields: [],
        requiredBillingContactFields: ['emailAddress', 'name'],
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Confirmar pagamento
      const { paymentMethod, error: confirmError } = await confirmApplePayPayment();
      
      if (confirmError) {
        return { success: false, error: confirmError.message };
      }

      return {
        success: true,
        token: paymentMethod?.id,
        paymentMethod: {
          id: paymentMethod?.id || '',
          type: 'apple_pay',
          default: false,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Google Pay
  async isGooglePaySupported(): Promise<boolean> {
    try {
      const { isGooglePaySupported } = await import('@stripe/stripe-react-native');
      return await isGooglePaySupported({
        testEnv: this.config.googlePay?.environment === 'TEST',
      });
    } catch {
      return false;
    }
  }

  async presentGooglePay(amount: number, currency: string = 'BRL'): Promise<PaymentResult> {
    if (!this.config.stripe || !this.config.googlePay) {
      return { success: false, error: 'Google Pay não configurado' };
    }

    try {
      const { initGooglePay, presentGooglePay, createGooglePayPaymentMethod } = await import('@stripe/stripe-react-native');
      
      // Inicializar Google Pay
      const { error: initError } = await initGooglePay({
        testEnv: this.config.googlePay.environment === 'TEST',
        merchantName: 'Recipe Book',
        countryCode: 'BR',
        billingAddressConfig: {
          format: 'FULL',
          isRequired: true,
        },
        existingPaymentMethodRequired: false,
      });

      if (initError) {
        return { success: false, error: initError.message };
      }

      // Apresentar Google Pay
      const { error: presentError } = await presentGooglePay({
        clientSecret: '', // Será fornecido pelo backend
        forSetupIntent: false,
      });

      if (presentError) {
        return { success: false, error: presentError.message };
      }

      // Criar método de pagamento
      const { paymentMethod, error: createError } = await createGooglePayPaymentMethod({
        amount: amount,
        currencyCode: currency.toUpperCase(),
      });

      if (createError) {
        return { success: false, error: createError.message };
      }

      return {
        success: true,
        token: paymentMethod?.id,
        paymentMethod: {
          id: paymentMethod?.id || '',
          type: 'google_pay',
          default: false,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // PIX (Mercado Pago ou outro processador brasileiro)
  async createPixPayment(amount: number, description: string): Promise<PaymentResult> {
    try {
      // Implementar integração com processador que suporte PIX
      // Por exemplo, Mercado Pago, PagSeguro, etc.
      
      const response = await fetch('/api/payments/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          payment_method_id: 'pix',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message };
      }

      return {
        success: true,
        token: data.id,
        // PIX geralmente retorna um QR code ou chave PIX
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Boleto
  async createBoletoPayment(amount: number, description: string, payerInfo: {
    name: string;
    email: string;
    cpf: string;
    address: {
      street: string;
      number: string;
      city: string;
      state: string;
      zipCode: string;
    };
  }): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/boleto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          payment_method_id: 'boleto',
          payer: payerInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message };
      }

      return {
        success: true,
        token: data.id,
        // Boleto geralmente retorna URL para download
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // PayPal
  async createPayPalPayment(amount: number, currency: string = 'BRL'): Promise<PaymentResult> {
    if (!this.config.paypal) {
      return { success: false, error: 'PayPal não configurado' };
    }

    try {
      // Implementar integração com PayPal SDK
      // Isso dependeria do SDK específico do PayPal para React Native
      
      const response = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          return_url: 'recipebook://payment/success',
          cancel_url: 'recipebook://payment/cancel',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message };
      }

      return {
        success: true,
        token: data.id,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Validação de cartão de crédito
  validateCardNumber(cardNumber: string): boolean {
    // Algoritmo de Luhn
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    if (month < 1 || month > 12) return false;

    return true;
  }

  validateCVC(cvc: string, cardBrand?: string): boolean {
    const digits = cvc.replace(/\D/g, '');
    
    if (cardBrand === 'amex') {
      return digits.length === 4;
    }
    
    return digits.length === 3;
  }

  getCardBrand(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits)) return 'discover';
    if (/^(?:2131|1800|35\d{3})\d{11}$/.test(digits)) return 'jcb';
    
    return 'unknown';
  }

  formatCardNumber(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    const brand = this.getCardBrand(digits);
    
    if (brand === 'amex') {
      return digits.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
    }
    
    return digits.replace(/(\d{4})/g, '$1 ').trim();
  }

  formatExpiryDate(expiry: string): string {
    const digits = expiry.replace(/\D/g, '');
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4);
    }
    return digits;
  }

  // Utilitários para tratamento de erros
  getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    
    // Mensagens específicas por tipo de erro
    if (error?.code) {
      switch (error.code) {
        case 'card_declined':
          return 'Cartão recusado. Verifique os dados ou tente outro cartão.';
        case 'insufficient_funds':
          return 'Saldo insuficiente.';
        case 'expired_card':
          return 'Cartão expirado.';
        case 'incorrect_cvc':
          return 'Código de segurança incorreto.';
        case 'processing_error':
          return 'Erro no processamento. Tente novamente.';
        case 'rate_limit':
          return 'Muitas tentativas. Aguarde alguns minutos.';
        default:
          return 'Erro no pagamento. Tente novamente.';
      }
    }
    
    return 'Erro desconhecido no pagamento.';
  }

  showPaymentError(error: any): void {
    const message = this.getErrorMessage(error);
    Alert.alert('Erro no Pagamento', message);
  }
}

export const paymentProcessor = new PaymentProcessorService();
export default paymentProcessor;