import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { render, createMockRecipe, createMockStore } from '../utils/test-utils';
import { RecipesScreen } from '../../screens/recipe/RecipesScreen';
import { recipesApi } from '../../services/recipesApi';

// Mock the API
jest.mock('../../services/recipesApi');
const mockRecipesApi = recipesApi as jest.Mocked<typeof recipesApi>;

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useFocusEffect: jest.fn(),
}));

describe('Recipe Flow Integration', () => {
  let store: any;

  beforeEach(() => {
    store = createMockStore();
    jest.clearAllMocks();
  });

  describe('Recipe List and Search Flow', () => {
    it('should load recipes and allow search', async () => {
      const mockRecipes = [
        createMockRecipe({ id: '1', title: 'Pasta Carbonara' }),
        createMockRecipe({ id: '2', title: 'Chicken Curry' }),
        createMockRecipe({ id: '3', title: 'Pasta Bolognese' }),
      ];

      // Mock initial recipes load
      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: mockRecipes, hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      // Mock search results
      mockRecipesApi.useSearchRecipesQuery.mockReturnValue({
        data: { 
          recipes: [mockRecipes[0], mockRecipes[2]], // Only pasta recipes
          hasMore: false 
        },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { getByText, getByPlaceholderText, queryByText } = render(
        <RecipesScreen />,
        { store }
      );

      // Should show all recipes initially
      await waitFor(() => {
        expect(getByText('Pasta Carbonara')).toBeTruthy();
        expect(getByText('Chicken Curry')).toBeTruthy();
        expect(getByText('Pasta Bolognese')).toBeTruthy();
      });

      // Search for pasta recipes
      const searchInput = getByPlaceholderText('Buscar receitas...');
      fireEvent.changeText(searchInput, 'pasta');

      // Should show only pasta recipes
      await waitFor(() => {
        expect(getByText('Pasta Carbonara')).toBeTruthy();
        expect(getByText('Pasta Bolognese')).toBeTruthy();
        expect(queryByText('Chicken Curry')).toBeNull();
      });
    });

    it('should handle recipe loading error gracefully', async () => {
      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: { status: 500, data: { message: 'Server error' } },
        refetch: jest.fn(),
      } as any);

      const { getByText } = render(<RecipesScreen />, { store });

      await waitFor(() => {
        expect(getByText('Erro ao carregar receitas')).toBeTruthy();
      });
    });

    it('should show loading state', () => {
      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { getByText } = render(<RecipesScreen />, { store });

      expect(getByText('Carregando receitas...')).toBeTruthy();
    });
  });

  describe('Recipe Navigation Flow', () => {
    it('should navigate to recipe details when recipe is tapped', async () => {
      const mockRecipe = createMockRecipe({ 
        id: '1', 
        title: 'Test Recipe' 
      });

      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: [mockRecipe], hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { getByLabelText } = render(<RecipesScreen />, { store });

      await waitFor(() => {
        const recipeCard = getByLabelText('Receita Test Recipe');
        fireEvent.press(recipeCard);
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('RecipeDetails', {
        recipeId: '1',
      });
    });

    it('should navigate to add recipe screen', async () => {
      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: [], hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { getByLabelText } = render(<RecipesScreen />, { store });

      const addButton = getByLabelText('Adicionar receita');
      fireEvent.press(addButton);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('AddRecipe');
    });
  });

  describe('Recipe Filtering Flow', () => {
    it('should filter recipes by category', async () => {
      const mockRecipes = [
        createMockRecipe({ id: '1', title: 'Pasta', category: 'main-course' }),
        createMockRecipe({ id: '2', title: 'Cake', category: 'dessert' }),
        createMockRecipe({ id: '3', title: 'Salad', category: 'appetizer' }),
      ];

      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: mockRecipes, hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { getByText, getByLabelText } = render(<RecipesScreen />, { store });

      // Open filter menu
      const filterButton = getByLabelText('Filtrar receitas');
      fireEvent.press(filterButton);

      // Select dessert category
      const dessertFilter = getByText('Sobremesas');
      fireEvent.press(dessertFilter);

      // Should show only dessert recipes
      await waitFor(() => {
        expect(getByText('Cake')).toBeTruthy();
        expect(() => getByText('Pasta')).toThrow();
        expect(() => getByText('Salad')).toThrow();
      });
    });

    it('should filter recipes by difficulty', async () => {
      const mockRecipes = [
        createMockRecipe({ id: '1', title: 'Easy Recipe', difficulty: 'easy' }),
        createMockRecipe({ id: '2', title: 'Hard Recipe', difficulty: 'hard' }),
      ];

      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: mockRecipes, hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { getByText, getByLabelText } = render(<RecipesScreen />, { store });

      // Open filter menu
      const filterButton = getByLabelText('Filtrar receitas');
      fireEvent.press(filterButton);

      // Select easy difficulty
      const easyFilter = getByText('Fácil');
      fireEvent.press(easyFilter);

      // Should show only easy recipes
      await waitFor(() => {
        expect(getByText('Easy Recipe')).toBeTruthy();
        expect(() => getByText('Hard Recipe')).toThrow();
      });
    });
  });

  describe('Recipe Actions Flow', () => {
    it('should handle recipe favoriting', async () => {
      const mockRecipe = createMockRecipe({ id: '1', title: 'Test Recipe' });
      const mockFavorite = jest.fn();

      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: [mockRecipe], hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      mockRecipesApi.useFavoriteRecipeMutation.mockReturnValue([
        mockFavorite,
        { isLoading: false },
      ] as any);

      const { getByLabelText } = render(<RecipesScreen />, { store });

      await waitFor(() => {
        const favoriteButton = getByLabelText('Adicionar aos favoritos');
        fireEvent.press(favoriteButton);
      });

      expect(mockFavorite).toHaveBeenCalledWith('1');
    });

    it('should handle recipe sharing', async () => {
      const mockRecipe = createMockRecipe({ id: '1', title: 'Test Recipe' });
      const mockShare = jest.fn();

      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: [mockRecipe], hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      // Mock React Native Share
      jest.mock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Share: {
          share: mockShare,
        },
      }));

      const { getByLabelText } = render(<RecipesScreen />, { store });

      await waitFor(() => {
        const shareButton = getByLabelText('Compartilhar receita');
        fireEvent.press(shareButton);
      });

      // Should trigger share functionality
      // Implementation depends on how sharing is handled in the component
    });
  });

  describe('Infinite Scroll Flow', () => {
    it('should load more recipes when scrolling to bottom', async () => {
      const firstBatch = [
        createMockRecipe({ id: '1', title: 'Recipe 1' }),
        createMockRecipe({ id: '2', title: 'Recipe 2' }),
      ];

      const secondBatch = [
        createMockRecipe({ id: '3', title: 'Recipe 3' }),
        createMockRecipe({ id: '4', title: 'Recipe 4' }),
      ];

      // First load
      mockRecipesApi.useGetRecipesQuery.mockReturnValueOnce({
        data: { recipes: firstBatch, hasMore: true },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { getByText, getByTestId } = render(<RecipesScreen />, { store });

      // Should show first batch
      await waitFor(() => {
        expect(getByText('Recipe 1')).toBeTruthy();
        expect(getByText('Recipe 2')).toBeTruthy();
      });

      // Mock second load
      mockRecipesApi.useGetRecipesQuery.mockReturnValueOnce({
        data: { recipes: [...firstBatch, ...secondBatch], hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      // Trigger scroll to bottom
      const scrollView = getByTestId('recipes-list');
      fireEvent.scroll(scrollView, {
        nativeEvent: {
          contentOffset: { y: 1000 },
          contentSize: { height: 1200 },
          layoutMeasurement: { height: 800 },
        },
      });

      // Should show all recipes
      await waitFor(() => {
        expect(getByText('Recipe 3')).toBeTruthy();
        expect(getByText('Recipe 4')).toBeTruthy();
      });
    });
  });
});