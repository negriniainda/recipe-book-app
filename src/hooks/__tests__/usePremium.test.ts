import { renderHook, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { 
  useUserSubscription, 
  usePremiumPlans, 
  useFeatureAccess,
  usePremiumGating 
} from '../usePremium';
import { premiumApi } from '../../services/premiumApi';
import { createMockSubscription, mockApiResponse } from '../../__tests__/utils/test-utils';

// Mock the API
jest.mock('../../services/premiumApi');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

const mockPremiumApi = premiumApi as jest.Mocked<typeof premiumApi>;

describe('usePremium hooks', () => {
  let store: any;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [premiumApi.reducerPath]: premiumApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(premiumApi.middleware),
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    jest.clearAllMocks();
  });

  describe('useUserSubscription', () => {
    it('should return subscription data for premium user', () => {
      const mockSubscription = createMockSubscription({
        status: 'active',
        plan: {
          id: 'premium',
          name: 'premium',
          displayName: 'Premium',
          description: 'Premium plan',
          price: 19.90,
          currency: 'BRL',
          interval: 'monthly',
          intervalCount: 1,
          features: [],
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      });

      mockPremiumApi.useGetUserSubscriptionQuery.mockReturnValue({
        data: mockSubscription,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useCreateSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useUpdateSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useCancelSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useStartFreeTrialMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useUpgradeSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useDowngradeSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      const { result } = renderHook(() => useUserSubscription(), { wrapper });

      expect(result.current.subscription).toEqual(mockSubscription);
      expect(result.current.isPremium).toBe(true);
      expect(result.current.isTrialUser).toBe(false);
      expect(result.current.isExpired).toBe(false);
    });

    it('should return null for free user', () => {
      mockPremiumApi.useGetUserSubscriptionQuery.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useCreateSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useUpdateSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useCancelSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useStartFreeTrialMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useUpgradeSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useDowngradeSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      const { result } = renderHook(() => useUserSubscription(), { wrapper });

      expect(result.current.subscription).toBeNull();
      expect(result.current.isPremium).toBe(false);
      expect(result.current.isTrialUser).toBe(false);
      expect(result.current.isExpired).toBe(false);
    });

    it('should identify trial user correctly', () => {
      const mockSubscription = createMockSubscription({
        status: 'trial',
        trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      mockPremiumApi.useGetUserSubscriptionQuery.mockReturnValue({
        data: mockSubscription,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useCreateSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useUpdateSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useCancelSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useStartFreeTrialMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useUpgradeSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useDowngradeSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      const { result } = renderHook(() => useUserSubscription(), { wrapper });

      expect(result.current.subscription).toEqual(mockSubscription);
      expect(result.current.isPremium).toBe(true);
      expect(result.current.isTrialUser).toBe(true);
      expect(result.current.trialExpired).toBe(false);
    });

    it('should handle subscription creation', async () => {
      const mockCreateSubscription = jest.fn().mockResolvedValue({
        unwrap: () => Promise.resolve(createMockSubscription()),
      });

      mockPremiumApi.useGetUserSubscriptionQuery.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useCreateSubscriptionMutation.mockReturnValue([
        mockCreateSubscription,
        { isLoading: false },
      ] as any);

      mockPremiumApi.useUpdateSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useCancelSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useStartFreeTrialMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useUpgradeSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      mockPremiumApi.useDowngradeSubscriptionMutation.mockReturnValue([
        jest.fn(),
        { isLoading: false },
      ] as any);

      const { result } = renderHook(() => useUserSubscription(), { wrapper });

      await act(async () => {
        const response = await result.current.createSubscription({
          planId: 'premium',
        });
        expect(response.success).toBe(true);
      });

      expect(mockCreateSubscription).toHaveBeenCalledWith({
        planId: 'premium',
      });
    });
  });

  describe('usePremiumPlans', () => {
    it('should return premium plans', () => {
      const mockPlans = [
        {
          id: 'basic',
          name: 'basic',
          displayName: 'Básico',
          description: 'Plano básico',
          price: 9.90,
          currency: 'BRL',
          interval: 'monthly' as const,
          intervalCount: 1,
          features: [],
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'premium',
          name: 'premium',
          displayName: 'Premium',
          description: 'Plano premium',
          price: 19.90,
          currency: 'BRL',
          interval: 'monthly' as const,
          intervalCount: 1,
          features: [],
          popular: true,
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      const mockOffers = [
        {
          id: 'offer1',
          planId: 'premium',
          type: 'discount' as const,
          title: 'Desconto Especial',
          description: '50% off no primeiro mês',
          discountPercentage: 50,
          validFrom: '2024-01-01T00:00:00Z',
          validUntil: '2024-12-31T00:00:00Z',
          targetAudience: 'new_users' as const,
          currentRedemptions: 0,
          active: true,
        },
      ];

      mockPremiumApi.useGetPremiumPlansQuery.mockReturnValue({
        data: { plans: mockPlans, offers: mockOffers },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(() => usePremiumPlans(), { wrapper });

      expect(result.current.plans).toHaveLength(2);
      expect(result.current.offers).toHaveLength(1);
      expect(result.current.popularPlan?.id).toBe('premium');
      expect(result.current.monthlyPlans).toHaveLength(2);
      expect(result.current.yearlyPlans).toHaveLength(0);
    });

    it('should filter plans by interval', () => {
      const mockPlans = [
        {
          id: 'monthly',
          name: 'monthly',
          displayName: 'Mensal',
          description: 'Plano mensal',
          price: 19.90,
          currency: 'BRL',
          interval: 'monthly' as const,
          intervalCount: 1,
          features: [],
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'yearly',
          name: 'yearly',
          displayName: 'Anual',
          description: 'Plano anual',
          price: 199.90,
          currency: 'BRL',
          interval: 'yearly' as const,
          intervalCount: 1,
          features: [],
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockPremiumApi.useGetPremiumPlansQuery.mockReturnValue({
        data: { plans: mockPlans, offers: [] },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(() => usePremiumPlans(), { wrapper });

      expect(result.current.monthlyPlans).toHaveLength(1);
      expect(result.current.yearlyPlans).toHaveLength(1);
      expect(result.current.monthlyPlans[0].interval).toBe('monthly');
      expect(result.current.yearlyPlans[0].interval).toBe('yearly');
    });
  });

  describe('useFeatureAccess', () => {
    it('should check feature access for premium user', () => {
      const mockSubscription = createMockSubscription({
        status: 'active',
        plan: {
          id: 'premium',
          name: 'premium',
          displayName: 'Premium',
          description: 'Premium plan',
          price: 19.90,
          currency: 'BRL',
          interval: 'monthly',
          intervalCount: 1,
          features: [
            {
              id: 'unlimited_recipes',
              key: 'unlimitedRecipes',
              name: 'Receitas Ilimitadas',
              description: 'Crie quantas receitas quiser',
              icon: 'infinity',
              category: 'recipes',
              unlimited: true,
              enabled: true,
            },
          ],
          active: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      });

      mockPremiumApi.useGetUserSubscriptionQuery.mockReturnValue({
        data: mockSubscription,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useGetFeatureUsageQuery.mockReturnValue({
        data: [
          {
            featureKey: 'unlimitedRecipes',
            used: 10,
            limit: -1,
            unlimited: true,
          },
        ],
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useIncrementFeatureUsageMutation.mockReturnValue([
        jest.fn(),
      ] as any);

      const { result } = renderHook(() => useFeatureAccess(), { wrapper });

      expect(result.current.checkFeatureAccess('unlimitedRecipes')).toBe(true);
      expect(result.current.canUseFeature('unlimitedRecipes')).toBe(true);
      expect(result.current.getRemainingUsage('unlimitedRecipes')).toBe(-1);
    });

    it('should deny feature access for free user', () => {
      mockPremiumApi.useGetUserSubscriptionQuery.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useGetFeatureUsageQuery.mockReturnValue({
        data: [],
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useIncrementFeatureUsageMutation.mockReturnValue([
        jest.fn(),
      ] as any);

      const { result } = renderHook(() => useFeatureAccess(), { wrapper });

      expect(result.current.checkFeatureAccess('unlimitedRecipes')).toBe(false);
      expect(result.current.canUseFeature('unlimitedRecipes')).toBe(false);
      expect(result.current.getRemainingUsage('unlimitedRecipes')).toBeNull();
    });
  });

  describe('usePremiumGating', () => {
    it('should allow access for premium user', () => {
      const mockSubscription = createMockSubscription({ status: 'active' });

      mockPremiumApi.useGetUserSubscriptionQuery.mockReturnValue({
        data: mockSubscription,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useGetFeatureUsageQuery.mockReturnValue({
        data: [],
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useIncrementFeatureUsageMutation.mockReturnValue([
        jest.fn(),
      ] as any);

      const { result } = renderHook(() => usePremiumGating(), { wrapper });

      expect(result.current.isPremium).toBe(true);
      expect(result.current.requirePremium()).toBe(true);
    });

    it('should block access for free user', () => {
      mockPremiumApi.useGetUserSubscriptionQuery.mockReturnValue({
        data: null,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useGetFeatureUsageQuery.mockReturnValue({
        data: [],
        refetch: jest.fn(),
      } as any);

      mockPremiumApi.useIncrementFeatureUsageMutation.mockReturnValue([
        jest.fn(),
      ] as any);

      const { result } = renderHook(() => usePremiumGating(), { wrapper });

      expect(result.current.isPremium).toBe(false);
      expect(result.current.requirePremium()).toBe(false);
    });
  });
});