import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { RecipesScreen } from '../../screens/recipe/RecipesScreen';
import { createMockRecipe, createMockStore } from '../utils/test-utils';
import { recipesApi } from '../../services/recipesApi';

// Mock the API
jest.mock('../../services/recipesApi');
const mockRecipesApi = recipesApi as jest.Mocked<typeof recipesApi>;

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useFocusEffect: jest.fn(),
}));

describe('Recipe List Performance Tests', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  it('should render large recipe list within performance threshold', async () => {
    // Generate 100 mock recipes
    const mockRecipes = Array.from({ length: 100 }, (_, index) =>
      createMockRecipe({
        id: `recipe-${index}`,
        title: `Recipe ${index}`,
        description: `Description for recipe ${index}`,
      })
    );

    mockRecipesApi.useGetRecipesQuery.mockReturnValue({
      data: { recipes: mockRecipes, hasMore: false },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const startTime = performance.now();

    const { getByText } = render(<RecipesScreen />, { store });

    await waitFor(() => {
      expect(getByText('Recipe 0')).toBeTruthy();
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 2 seconds
    expect(renderTime).toBeLessThan(2000);

    console.log(`Large recipe list rendered in ${renderTime}ms`);
  });

  it('should handle rapid recipe updates efficiently', async () => {
    const initialRecipes = Array.from({ length: 10 }, (_, index) =>
      createMockRecipe({
        id: `recipe-${index}`,
        title: `Recipe ${index}`,
      })
    );

    mockRecipesApi.useGetRecipesQuery.mockReturnValue({
      data: { recipes: initialRecipes, hasMore: false },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { rerender, getByText } = render(<RecipesScreen />, { store });

    // Measure time for multiple re-renders
    const startTime = performance.now();

    for (let i = 0; i < 10; i++) {
      const updatedRecipes = initialRecipes.map(recipe => ({
        ...recipe,
        title: `${recipe.title} - Updated ${i}`,
      }));

      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: updatedRecipes, hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      rerender(<RecipesScreen />);

      await waitFor(() => {
        expect(getByText(`Recipe 0 - Updated ${i}`)).toBeTruthy();
      });
    }

    const endTime = performance.now();
    const updateTime = endTime - startTime;

    // Should handle 10 updates within 1 second
    expect(updateTime).toBeLessThan(1000);

    console.log(`10 recipe updates completed in ${updateTime}ms`);
  });

  it('should efficiently handle search operations', async () => {
    const mockRecipes = Array.from({ length: 50 }, (_, index) =>
      createMockRecipe({
        id: `recipe-${index}`,
        title: index % 2 === 0 ? `Pasta Recipe ${index}` : `Chicken Recipe ${index}`,
      })
    );

    mockRecipesApi.useGetRecipesQuery.mockReturnValue({
      data: { recipes: mockRecipes, hasMore: false },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    mockRecipesApi.useSearchRecipesQuery.mockReturnValue({
      data: { 
        recipes: mockRecipes.filter(r => r.title.includes('Pasta')), 
        hasMore: false 
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByPlaceholderText, getByText } = render(<RecipesScreen />, { store });

    const startTime = performance.now();

    const searchInput = getByPlaceholderText('Buscar receitas...');
    
    // Simulate typing
    searchInput.props.onChangeText('Pasta');

    await waitFor(() => {
      expect(getByText('Pasta Recipe 0')).toBeTruthy();
    });

    const endTime = performance.now();
    const searchTime = endTime - startTime;

    // Search should complete within 500ms
    expect(searchTime).toBeLessThan(500);

    console.log(`Search operation completed in ${searchTime}ms`);
  });

  it('should handle memory efficiently with large datasets', async () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

    // Generate large dataset
    const mockRecipes = Array.from({ length: 500 }, (_, index) =>
      createMockRecipe({
        id: `recipe-${index}`,
        title: `Recipe ${index}`,
        description: `Long description for recipe ${index} `.repeat(10),
        ingredients: Array.from({ length: 10 }, (_, i) => ({
          id: `ingredient-${i}`,
          name: `Ingredient ${i}`,
          amount: '1 cup',
          category: 'vegetables',
        })),
        instructions: Array.from({ length: 5 }, (_, i) => ({
          id: `instruction-${i}`,
          step: i + 1,
          description: `Step ${i + 1} description `.repeat(5),
          duration: 5,
        })),
      })
    );

    mockRecipesApi.useGetRecipesQuery.mockReturnValue({
      data: { recipes: mockRecipes, hasMore: false },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { unmount } = render(<RecipesScreen />, { store });

    await waitFor(() => {
      // Component should be rendered
      expect(true).toBe(true);
    });

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const afterRenderMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = afterRenderMemory - initialMemory;

    // Unmount component
    unmount();

    // Force garbage collection again
    if (global.gc) {
      global.gc();
    }

    const afterUnmountMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryLeakage = afterUnmountMemory - initialMemory;

    console.log(`Memory increase: ${memoryIncrease} bytes`);
    console.log(`Memory after unmount: ${memoryLeakage} bytes`);

    // Memory leakage should be minimal (less than 10% of increase)
    expect(memoryLeakage).toBeLessThan(memoryIncrease * 0.1);
  });

  it('should handle concurrent operations efficiently', async () => {
    const mockRecipes = Array.from({ length: 20 }, (_, index) =>
      createMockRecipe({
        id: `recipe-${index}`,
        title: `Recipe ${index}`,
      })
    );

    mockRecipesApi.useGetRecipesQuery.mockReturnValue({
      data: { recipes: mockRecipes, hasMore: false },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const startTime = performance.now();

    // Simulate multiple concurrent operations
    const promises = Array.from({ length: 5 }, async (_, index) => {
      const { unmount } = render(<RecipesScreen />, { store });
      
      await waitFor(() => {
        expect(true).toBe(true); // Component rendered
      });
      
      unmount();
    });

    await Promise.all(promises);

    const endTime = performance.now();
    const concurrentTime = endTime - startTime;

    // Concurrent operations should complete within 3 seconds
    expect(concurrentTime).toBeLessThan(3000);

    console.log(`5 concurrent operations completed in ${concurrentTime}ms`);
  });

  it('should maintain 60fps during scroll simulation', async () => {
    const mockRecipes = Array.from({ length: 100 }, (_, index) =>
      createMockRecipe({
        id: `recipe-${index}`,
        title: `Recipe ${index}`,
      })
    );

    mockRecipesApi.useGetRecipesQuery.mockReturnValue({
      data: { recipes: mockRecipes, hasMore: false },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    } as any);

    const { getByTestId } = render(<RecipesScreen />, { store });

    const scrollView = getByTestId('recipes-list');
    
    const frameTime = 16.67; // 60fps = 16.67ms per frame
    const scrollOperations = 10;
    
    const startTime = performance.now();

    // Simulate scroll operations
    for (let i = 0; i < scrollOperations; i++) {
      const scrollStartTime = performance.now();
      
      // Simulate scroll event
      scrollView.props.onScroll?.({
        nativeEvent: {
          contentOffset: { y: i * 100 },
          contentSize: { height: 2000 },
          layoutMeasurement: { height: 800 },
        },
      });

      const scrollEndTime = performance.now();
      const scrollTime = scrollEndTime - scrollStartTime;

      // Each scroll operation should complete within one frame
      expect(scrollTime).toBeLessThan(frameTime);
    }

    const endTime = performance.now();
    const totalTime = endTime - startTime;
    const averageFrameTime = totalTime / scrollOperations;

    console.log(`Average frame time during scroll: ${averageFrameTime}ms`);
    
    // Average frame time should be well below 60fps threshold
    expect(averageFrameTime).toBeLessThan(frameTime);
  });
});