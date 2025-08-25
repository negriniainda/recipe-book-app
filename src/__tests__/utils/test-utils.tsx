import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureStore, Store } from '@reduxjs/toolkit';

// Import your reducers
import { recipesApi } from '../../services/recipesApi';
import { mealPlanApi } from '../../services/mealPlanApi';
import { communityApi } from '../../services/communityApi';
import { premiumApi } from '../../services/premiumApi';

// Mock store configuration
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      [recipesApi.reducerPath]: recipesApi.reducer,
      [mealPlanApi.reducerPath]: mealPlanApi.reducer,
      [communityApi.reducerPath]: communityApi.reducer,
      [premiumApi.reducerPath]: premiumApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'persist/REHYDRATE',
            'persist/REGISTER',
          ],
        },
      })
        .concat(recipesApi.middleware)
        .concat(mealPlanApi.middleware)
        .concat(communityApi.middleware)
        .concat(premiumApi.middleware),
    preloadedState: initialState,
  });
};

// All the providers wrapper
interface AllTheProvidersProps {
  children: React.ReactNode;
  store?: Store;
  initialEntries?: string[];
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  store = createMockStore(),
  initialEntries = ['/'],
}) => {
  return (
    <Provider store={store}>
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 375, height: 812 },
          insets: { top: 44, left: 0, right: 0, bottom: 34 },
        }}
      >
        <PaperProvider>
          <NavigationContainer>
            {children}
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  store?: Store;
  initialEntries?: string[];
}

const customRender = (
  ui: ReactElement,
  {
    store = createMockStore(),
    initialEntries = ['/'],
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders store={store} initialEntries={initialEntries}>
      {children}
    </AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock data generators
export const createMockRecipe = (overrides = {}) => ({
  id: '1',
  title: 'Test Recipe',
  description: 'A test recipe description',
  ingredients: [
    { id: '1', name: 'Ingredient 1', amount: '1 cup', category: 'vegetables' },
    { id: '2', name: 'Ingredient 2', amount: '2 tbsp', category: 'spices' },
  ],
  instructions: [
    { id: '1', step: 1, description: 'First step', duration: 5 },
    { id: '2', step: 2, description: 'Second step', duration: 10 },
  ],
  prepTime: 15,
  cookTime: 30,
  servings: 4,
  difficulty: 'medium' as const,
  category: 'main-course',
  tags: ['healthy', 'quick'],
  nutrition: {
    calories: 250,
    protein: 15,
    carbs: 30,
    fat: 8,
    fiber: 5,
  },
  images: ['https://example.com/image1.jpg'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  userId: 'user1',
  isPublic: true,
  rating: 4.5,
  reviewCount: 10,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'user1',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/avatar.jpg',
  bio: 'Test user bio',
  location: 'Test City',
  website: 'https://example.com',
  followersCount: 100,
  followingCount: 50,
  recipesCount: 25,
  isVerified: false,
  isPremium: false,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockMealPlan = (overrides = {}) => ({
  id: '1',
  userId: 'user1',
  name: 'Weekly Meal Plan',
  description: 'A test meal plan',
  startDate: '2024-01-01',
  endDate: '2024-01-07',
  meals: [
    {
      id: '1',
      date: '2024-01-01',
      type: 'breakfast',
      recipeId: '1',
      recipe: createMockRecipe(),
      servings: 2,
    },
  ],
  shoppingList: {
    id: '1',
    items: [
      {
        id: '1',
        name: 'Ingredient 1',
        amount: '2 cups',
        category: 'vegetables',
        checked: false,
      },
    ],
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockSubscription = (overrides = {}) => ({
  id: 'sub1',
  userId: 'user1',
  planId: 'premium',
  plan: {
    id: 'premium',
    name: 'premium',
    displayName: 'Premium',
    description: 'Premium plan',
    price: 19.90,
    currency: 'BRL',
    interval: 'monthly' as const,
    intervalCount: 1,
    features: [],
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  status: 'active' as const,
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-02-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, delay = 0) => {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const mockApiError = (message = 'API Error', status = 500, delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        status,
        data: { message },
        message,
      });
    }, delay);
  });
};

// Test helpers
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

export const createMockNavigation = (overrides = {}) => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(() => 'test-id'),
  getParent: jest.fn(),
  getState: jest.fn(() => ({})),
  reset: jest.fn(),
  setParams: jest.fn(),
  ...overrides,
});

export const createMockRoute = (overrides = {}) => ({
  key: 'test-key',
  name: 'TestScreen',
  params: {},
  ...overrides,
});

// Accessibility testing helpers
export const findByAccessibilityLabel = (container: any, label: string) => {
  return container.findByLabelText(label);
};

export const findByAccessibilityHint = (container: any, hint: string) => {
  return container.findByHintText(hint);
};

export const findByAccessibilityRole = (container: any, role: string) => {
  return container.findByRole(role);
};

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitForLoadingToFinish();
  const end = performance.now();
  return end - start;
};

// Re-export everything
export * from '@testing-library/react-native';
export { customRender as render, createMockStore };
export { AllTheProviders };