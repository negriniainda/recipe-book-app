import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  SubscriptionPlan,
  UserSubscription,
  PaymentMethod,
  Payment,
  PremiumFeatureUsage,
  SubscriptionAnalytics,
  PromoCode,
  PromoCodeUsage,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreatePaymentMethodRequest,
  ValidatePromoCodeRequest,
  FeatureUsageRequest,
} from '../types/subscription';

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/subscription',
    prepareHeaders: (headers, { getState }) => {
      // Adicionar token de autenticação
      const token = (getState() as any).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Subscription', 'Plan', 'PaymentMethod', 'Payment', 'Usage', 'Analytics', 'PromoCode'],
  endpoints: (builder) => ({
    // Planos de assinatura
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
      query: () => '/plans',
      providesTags: ['Plan'],
    }),

    getSubscriptionPlan: builder.query<SubscriptionPlan, string>({
      query: (planId) => `/plans/${planId}`,
      providesTags: (result, error, id) => [{ type: 'Plan', id }],
    }),

    // Assinatura do usuário
    getCurrentSubscription: builder.query<UserSubscription | null, void>({
      query: () => '/current',
      providesTags: ['Subscription'],
    }),

    createSubscription: builder.mutation<UserSubscription, CreateSubscriptionRequest>({
      query: (data) => ({
        url: '/subscribe',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription', 'Usage'],
    }),

    updateSubscription: builder.mutation<UserSubscription, UpdateSubscriptionRequest>({
      query: (data) => ({
        url: '/update',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),

    cancelSubscription: builder.mutation<UserSubscription, { immediate?: boolean }>({
      query: ({ immediate = false }) => ({
        url: '/cancel',
        method: 'POST',
        body: { immediate },
      }),
      invalidatesTags: ['Subscription'],
    }),

    reactivateSubscription: builder.mutation<UserSubscription, void>({
      query: () => ({
        url: '/reactivate',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Métodos de pagamento
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => '/payment-methods',
      providesTags: ['PaymentMethod'],
    }),

    createPaymentMethod: builder.mutation<PaymentMethod, CreatePaymentMethodRequest>({
      query: (data) => ({
        url: '/payment-methods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    updatePaymentMethod: builder.mutation<
      PaymentMethod,
      { paymentMethodId: string; isDefault?: boolean }
    >({
      query: ({ paymentMethodId, ...data }) => ({
        url: `/payment-methods/${paymentMethodId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    deletePaymentMethod: builder.mutation<void, string>({
      query: (paymentMethodId) => ({
        url: `/payment-methods/${paymentMethodId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentMethod'],
    }),

    // Histórico de pagamentos
    getPayments: builder.query<
      { payments: Payment[]; hasMore: boolean },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 }) => ({
        url: '/payments',
        params: { page, limit },
      }),
      providesTags: ['Payment'],
    }),

    getPayment: builder.query<Payment, string>({
      query: (paymentId) => `/payments/${paymentId}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),

    retryPayment: builder.mutation<Payment, string>({
      query: (paymentId) => ({
        url: `/payments/${paymentId}/retry`,
        method: 'POST',
      }),
      invalidatesTags: ['Payment', 'Subscription'],
    }),

    downloadReceipt: builder.query<Blob, string>({
      query: (paymentId) => ({
        url: `/payments/${paymentId}/receipt`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Uso de recursos premium
    getFeatureUsage: builder.query<Record<string, PremiumFeatureUsage>, void>({
      query: () => '/usage',
      providesTags: ['Usage'],
    }),

    getFeatureUsageById: builder.query<PremiumFeatureUsage, string>({
      query: (featureId) => `/usage/${featureId}`,
      providesTags: (result, error, id) => [{ type: 'Usage', id }],
    }),

    trackFeatureUsage: builder.mutation<PremiumFeatureUsage, FeatureUsageRequest>({
      query: (data) => ({
        url: '/usage/track',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Usage'],
    }),

    resetFeatureUsage: builder.mutation<void, string>({
      query: (featureId) => ({
        url: `/usage/${featureId}/reset`,
        method: 'POST',
      }),
      invalidatesTags: ['Usage'],
    }),

    // Analytics de assinatura
    getSubscriptionAnalytics: builder.query<
      SubscriptionAnalytics,
      { period?: 'day' | 'week' | 'month' | 'year' }
    >({
      query: ({ period = 'month' }) => ({
        url: '/analytics',
        params: { period },
      }),
      providesTags: ['Analytics'],
    }),

    // Códigos promocionais
    validatePromoCode: builder.mutation<
      { valid: boolean; discount: number; promoCode?: PromoCode },
      ValidatePromoCodeRequest
    >({
      query: (data) => ({
        url: '/promo-codes/validate',
        method: 'POST',
        body: data,
      }),
    }),

    applyPromoCode: builder.mutation<
      { success: boolean; discount: number; usage: PromoCodeUsage },
      { code: string; subscriptionId?: string }
    >({
      query: (data) => ({
        url: '/promo-codes/apply',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription', 'Payment'],
    }),

    getPromoCodeUsage: builder.query<PromoCodeUsage[], void>({
      query: () => '/promo-codes/usage',
      providesTags: ['PromoCode'],
    }),

    // Verificações de recursos
    checkFeatureAccess: builder.query<
      { hasAccess: boolean; reason?: string; upgradeRequired?: boolean },
      string
    >({
      query: (featureId) => `/features/${featureId}/check`,
    }),

    getAvailableFeatures: builder.query<
      Array<{ featureId: string; available: boolean; usageLeft?: number }>,
      void
    >({
      query: () => '/features/available',
      providesTags: ['Usage'],
    }),

    // Configurações de cobrança
    getBillingInfo: builder.query<
      {
        nextBillingDate?: string;
        nextBillingAmount?: number;
        billingCycle: string;
        prorationAmount?: number;
      },
      void
    >({
      query: () => '/billing/info',
      providesTags: ['Subscription'],
    }),

    previewSubscriptionChange: builder.query<
      {
        immediateCharge?: number;
        prorationCredit?: number;
        nextBillingAmount: number;
        nextBillingDate: string;
      },
      { planId: string; promoCode?: string }
    >({
      query: ({ planId, promoCode }) => ({
        url: '/billing/preview',
        params: { planId, ...(promoCode && { promoCode }) },
      }),
    }),

    // Reembolsos
    requestRefund: builder.mutation<
      { success: boolean; refundId: string },
      { paymentId: string; reason: string; amount?: number }
    >({
      query: (data) => ({
        url: '/refunds/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment'],
    }),

    getRefunds: builder.query<
      Array<{
        id: string;
        paymentId: string;
        amount: number;
        status: string;
        reason: string;
        processedAt?: string;
      }>,
      void
    >({
      query: () => '/refunds',
    }),

    // Estatísticas e insights
    getSubscriptionInsights: builder.query<
      {
        valueReceived: number;
        timesSaved: number;
        featuresUsed: number;
        topFeatures: Array<{ featureId: string; usage: number }>;
        recommendations: string[];
      },
      void
    >({
      query: () => '/insights',
      providesTags: ['Analytics'],
    }),

    // Configurações de notificação de cobrança
    updateBillingNotifications: builder.mutation<
      void,
      {
        emailReminders: boolean;
        pushReminders: boolean;
        reminderDays: number[];
      }
    >({
      query: (data) => ({
        url: '/billing/notifications',
        method: 'PUT',
        body: data,
      }),
    }),

    // Exportar dados de cobrança
    exportBillingData: builder.query<
      Blob,
      { format: 'pdf' | 'csv'; year?: number }
    >({
      query: ({ format, year }) => ({
        url: '/billing/export',
        params: { format, ...(year && { year }) },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Webhooks para atualizações de pagamento
    handlePaymentWebhook: builder.mutation<
      { success: boolean },
      { event: string; data: any }
    >({
      query: (data) => ({
        url: '/webhooks/payment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription', 'Payment'],
    }),

    // Teste de integração de pagamento
    testPaymentIntegration: builder.mutation<
      { success: boolean; message: string },
      { provider: 'stripe' | 'paypal' | 'mercadopago' }
    >({
      query: (data) => ({
        url: '/test/payment',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionPlanQuery,
  useGetCurrentSubscriptionQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useReactivateSubscriptionMutation,
  useGetPaymentMethodsQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useRetryPaymentMutation,
  useLazyDownloadReceiptQuery,
  useGetFeatureUsageQuery,
  useGetFeatureUsageByIdQuery,
  useTrackFeatureUsageMutation,
  useResetFeatureUsageMutation,
  useGetSubscriptionAnalyticsQuery,
  useValidatePromoCodeMutation,
  useApplyPromoCodeMutation,
  useGetPromoCodeUsageQuery,
  useCheckFeatureAccessQuery,
  useGetAvailableFeaturesQuery,
  useGetBillingInfoQuery,
  usePreviewSubscriptionChangeQuery,
  useRequestRefundMutation,
  useGetRefundsQuery,
  useGetSubscriptionInsightsQuery,
  useUpdateBillingNotificationsMutation,
  useLazyExportBillingDataQuery,
  useHandlePaymentWebhookMutation,
  useTestPaymentIntegrationMutation,
} = subscriptionApi;