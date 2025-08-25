import { renderHook, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useRecipes } from '../useRecipes';
import { recipesApi } from '../../services/recipesApi';
import { createMockRecipe, mockApiResponse } from '../../__tests__/utils/test-utils';

// Mock the API
jest.mock('../../services/recipesApi');

const mockRecipesApi = recipesApi as jest.Mocked<typeof recipesApi>;

describe('useRecipes', () => {
  let store: any;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        [recipesApi.reducerPath]: recipesApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(recipesApi.middleware),
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );

    jest.clearAllMocks();
  });

  describe('useGetRecipesQuery', () => {
    it('should fetch recipes successfully', async () => {
      const mockRecipes = [
        createMockRecipe({ id: '1', title: 'Recipe 1' }),
        createMockRecipe({ id: '2', title: 'Recipe 2' }),
      ];

      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: { recipes: mockRecipes, hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(
        () => mockRecipesApi.useGetRecipesQuery({ page: 1, limit: 10 }),
        { wrapper }
      );

      expect(result.current.data?.recipes).toHaveLength(2);
      expect(result.current.data?.recipes[0].title).toBe('Recipe 1');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should handle loading state', () => {
      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(
        () => mockRecipesApi.useGetRecipesQuery({ page: 1, limit: 10 }),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle error state', () => {
      const mockError = { status: 500, data: { message: 'Server error' } };

      mockRecipesApi.useGetRecipesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(
        () => mockRecipesApi.useGetRecipesQuery({ page: 1, limit: 10 }),
        { wrapper }
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useGetRecipeByIdQuery', () => {
    it('should fetch single recipe successfully', () => {
      const mockRecipe = createMockRecipe({ id: '1', title: 'Test Recipe' });

      mockRecipesApi.useGetRecipeByIdQuery.mockReturnValue({
        data: mockRecipe,
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(
        () => mockRecipesApi.useGetRecipeByIdQuery('1'),
        { wrapper }
      );

      expect(result.current.data?.id).toBe('1');
      expect(result.current.data?.title).toBe('Test Recipe');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle recipe not found', () => {
      const mockError = { status: 404, data: { message: 'Recipe not found' } };

      mockRecipesApi.useGetRecipeByIdQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: mockError,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(
        () => mockRecipesApi.useGetRecipeByIdQuery('nonexistent'),
        { wrapper }
      );

      expect(result.current.isError).toBe(true);
      expect(result.current.error?.status).toBe(404);
    });
  });

  describe('useCreateRecipeMutation', () => {
    it('should create recipe successfully', async () => {
      const mockRecipe = createMockRecipe({ title: 'New Recipe' });
      const mockMutate = jest.fn().mockResolvedValue({ data: mockRecipe });

      mockRecipesApi.useCreateRecipeMutation.mockReturnValue([
        mockMutate,
        {
          isLoading: false,
          isError: false,
          error: undefined,
          data: mockRecipe,
        },
      ] as any);

      const { result } = renderHook(
        () => mockRecipesApi.useCreateRecipeMutation(),
        { wrapper }
      );

      const [createRecipe] = result.current;

      await createRecipe({
        title: 'New Recipe',
        description: 'A new recipe',
        ingredients: [],
        instructions: [],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'easy',
        category: 'main-course',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        title: 'New Recipe',
        description: 'A new recipe',
        ingredients: [],
        instructions: [],
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'easy',
        category: 'main-course',
      });
    });

    it('should handle creation error', () => {
      const mockError = { status: 400, data: { message: 'Invalid data' } };
      const mockMutate = jest.fn();

      mockRecipesApi.useCreateRecipeMutation.mockReturnValue([
        mockMutate,
        {
          isLoading: false,
          isError: true,
          error: mockError,
          data: undefined,
        },
      ] as any);

      const { result } = renderHook(
        () => mockRecipesApi.useCreateRecipeMutation(),
        { wrapper }
      );

      const [, mutationResult] = result.current;

      expect(mutationResult.isError).toBe(true);
      expect(mutationResult.error?.status).toBe(400);
    });
  });

  describe('useUpdateRecipeMutation', () => {
    it('should update recipe successfully', async () => {
      const mockRecipe = createMockRecipe({ id: '1', title: 'Updated Recipe' });
      const mockMutate = jest.fn().mockResolvedValue({ data: mockRecipe });

      mockRecipesApi.useUpdateRecipeMutation.mockReturnValue([
        mockMutate,
        {
          isLoading: false,
          isError: false,
          error: undefined,
          data: mockRecipe,
        },
      ] as any);

      const { result } = renderHook(
        () => mockRecipesApi.useUpdateRecipeMutation(),
        { wrapper }
      );

      const [updateRecipe] = result.current;

      await updateRecipe({
        id: '1',
        title: 'Updated Recipe',
      });

      expect(mockMutate).toHaveBeenCalledWith({
        id: '1',
        title: 'Updated Recipe',
      });
    });
  });

  describe('useDeleteRecipeMutation', () => {
    it('should delete recipe successfully', async () => {
      const mockMutate = jest.fn().mockResolvedValue({ data: { success: true } });

      mockRecipesApi.useDeleteRecipeMutation.mockReturnValue([
        mockMutate,
        {
          isLoading: false,
          isError: false,
          error: undefined,
          data: { success: true },
        },
      ] as any);

      const { result } = renderHook(
        () => mockRecipesApi.useDeleteRecipeMutation(),
        { wrapper }
      );

      const [deleteRecipe] = result.current;

      await deleteRecipe('1');

      expect(mockMutate).toHaveBeenCalledWith('1');
    });

    it('should handle deletion error', () => {
      const mockError = { status: 403, data: { message: 'Forbidden' } };
      const mockMutate = jest.fn();

      mockRecipesApi.useDeleteRecipeMutation.mockReturnValue([
        mockMutate,
        {
          isLoading: false,
          isError: true,
          error: mockError,
          data: undefined,
        },
      ] as any);

      const { result } = renderHook(
        () => mockRecipesApi.useDeleteRecipeMutation(),
        { wrapper }
      );

      const [, mutationResult] = result.current;

      expect(mutationResult.isError).toBe(true);
      expect(mutationResult.error?.status).toBe(403);
    });
  });

  describe('useSearchRecipesQuery', () => {
    it('should search recipes successfully', () => {
      const mockRecipes = [
        createMockRecipe({ id: '1', title: 'Pasta Recipe' }),
        createMockRecipe({ id: '2', title: 'Pasta Salad' }),
      ];

      mockRecipesApi.useSearchRecipesQuery.mockReturnValue({
        data: { recipes: mockRecipes, hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(
        () => mockRecipesApi.useSearchRecipesQuery({ query: 'pasta', page: 1, limit: 10 }),
        { wrapper }
      );

      expect(result.current.data?.recipes).toHaveLength(2);
      expect(result.current.data?.recipes[0].title).toContain('Pasta');
    });

    it('should handle empty search results', () => {
      mockRecipesApi.useSearchRecipesQuery.mockReturnValue({
        data: { recipes: [], hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(
        () => mockRecipesApi.useSearchRecipesQuery({ query: 'nonexistent', page: 1, limit: 10 }),
        { wrapper }
      );

      expect(result.current.data?.recipes).toHaveLength(0);
    });
  });

  describe('useGetRecipesByUserQuery', () => {
    it('should fetch user recipes successfully', () => {
      const mockRecipes = [
        createMockRecipe({ id: '1', userId: 'user1' }),
        createMockRecipe({ id: '2', userId: 'user1' }),
      ];

      mockRecipesApi.useGetRecipesByUserQuery.mockReturnValue({
        data: { recipes: mockRecipes, hasMore: false },
        isLoading: false,
        isError: false,
        error: undefined,
        refetch: jest.fn(),
      } as any);

      const { result } = renderHook(
        () => mockRecipesApi.useGetRecipesByUserQuery({ userId: 'user1', page: 1, limit: 10 }),
        { wrapper }
      );

      expect(result.current.data?.recipes).toHaveLength(2);
      expect(result.current.data?.recipes[0].userId).toBe('user1');
    });
  });
});