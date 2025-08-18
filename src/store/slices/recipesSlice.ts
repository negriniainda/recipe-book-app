import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import {Recipe, RecipeFilters} from '@/types';
import {RecipesState} from '@/types/store';
import {RootState} from '@/types/store';

// Entity adapter para gerenciar receitas de forma normalizada
const recipesAdapter = createEntityAdapter<Recipe>();

// Estado inicial
const initialState: RecipesState = {
  ...recipesAdapter.getInitialState(),
  loading: false,
  error: null,
  lastFetch: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  favorites: [],
  categories: [],
  tags: [],
  filters: {},
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  importLoading: false,
  importError: null,
};

// Slice
const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSearchLoading: (state, action: PayloadAction<boolean>) => {
      state.searchLoading = action.payload;
    },
    setImportLoading: (state, action: PayloadAction<boolean>) => {
      state.importLoading = action.payload;
    },
    setImportError: (state, action: PayloadAction<string | null>) => {
      state.importError = action.payload;
    },

    // Receitas
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      recipesAdapter.setAll(state, action.payload);
      state.lastFetch = Date.now();
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      recipesAdapter.addOne(state, action.payload);
    },
    updateRecipe: (
      state,
      action: PayloadAction<{id: string; changes: Partial<Recipe>}>,
    ) => {
      recipesAdapter.updateOne(state, action.payload);
    },
    removeRecipe: (state, action: PayloadAction<string>) => {
      recipesAdapter.removeOne(state, action.payload);
      // Remover dos favoritos se estiver lá
      state.favorites = state.favorites.filter(id => id !== action.payload);
      // Remover dos resultados de busca se estiver lá
      state.searchResults = state.searchResults.filter(
        id => id !== action.payload,
      );
    },
    addRecipes: (state, action: PayloadAction<Recipe[]>) => {
      recipesAdapter.addMany(state, action.payload);
      state.lastFetch = Date.now();
    },

    // Paginação
    setPagination: (
      state,
      action: PayloadAction<Partial<RecipesState['pagination']>>,
    ) => {
      state.pagination = {...state.pagination, ...action.payload};
    },
    resetPagination: state => {
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },

    // Favoritos
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const recipeId = action.payload;
      const index = state.favorites.indexOf(recipeId);

      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(recipeId);
      }

      // Atualizar a receita no estado
      const recipe = state.entities[recipeId];
      if (recipe) {
        recipe.isFavorite = !recipe.isFavorite;
      }
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },

    // Categorias e tags
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<string>) => {
      if (!state.categories.includes(action.payload)) {
        state.categories.push(action.payload);
      }
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload;
    },
    addTag: (state, action: PayloadAction<string>) => {
      if (!state.tags.includes(action.payload)) {
        state.tags.push(action.payload);
      }
    },

    // Filtros
    setFilters: (state, action: PayloadAction<RecipeFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<RecipeFilters>>) => {
      state.filters = {...state.filters, ...action.payload};
    },
    clearFilters: state => {
      state.filters = {};
    },

    // Busca
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<string[]>) => {
      state.searchResults = action.payload;
    },
    clearSearch: state => {
      state.searchQuery = '';
      state.searchResults = [];
      state.searchLoading = false;
    },

    // Avaliação
    rateRecipe: (
      state,
      action: PayloadAction<{recipeId: string; rating: number}>,
    ) => {
      const {recipeId, rating} = action.payload;
      const recipe = state.entities[recipeId];
      if (recipe) {
        recipe.rating = rating;
      }
    },

    // Notas pessoais
    updateRecipeNotes: (
      state,
      action: PayloadAction<{recipeId: string; notes: string}>,
    ) => {
      const {recipeId, notes} = action.payload;
      const recipe = state.entities[recipeId];
      if (recipe) {
        recipe.notes = notes;
      }
    },

    // Reset
    resetRecipes: () => {
      return initialState;
    },
  },
});

// Selectors usando entity adapter
export const {
  selectAll: selectAllRecipes,
  selectById: selectRecipeById,
  selectIds: selectRecipeIds,
  selectEntities: selectRecipeEntities,
  selectTotal: selectTotalRecipes,
} = recipesAdapter.getSelectors((state: RootState) => state.recipes);

// Selectors customizados
export const selectFavoriteRecipes = (state: RootState) => {
  return state.recipes.favorites
    .map(id => state.recipes.entities[id])
    .filter(Boolean) as Recipe[];
};

export const selectRecipesByCategory = (state: RootState, category: string) => {
  return selectAllRecipes(state).filter(recipe =>
    recipe.categories.includes(category),
  );
};

export const selectRecipesByTag = (state: RootState, tag: string) => {
  return selectAllRecipes(state).filter(recipe => recipe.tags.includes(tag));
};

export const selectFilteredRecipes = (state: RootState) => {
  const recipes = selectAllRecipes(state);
  const {filters} = state.recipes;

  return recipes.filter(recipe => {
    // Filtro por categoria
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.some(cat => recipe.categories.includes(cat))) {
        return false;
      }
    }

    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some(tag => recipe.tags.includes(tag))) {
        return false;
      }
    }

    // Filtro por dificuldade
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(recipe.difficulty)) {
        return false;
      }
    }

    // Filtro por tempo de preparo
    if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) {
      return false;
    }

    // Filtro por tempo de cozimento
    if (filters.maxCookTime && recipe.cookTime > filters.maxCookTime) {
      return false;
    }

    // Filtro por ingredientes
    if (filters.ingredients && filters.ingredients.length > 0) {
      const recipeIngredients = recipe.ingredients.map(ing =>
        ing.name.toLowerCase(),
      );
      if (
        !filters.ingredients.some(ing =>
          recipeIngredients.some(recipeIng =>
            recipeIng.includes(ing.toLowerCase()),
          ),
        )
      ) {
        return false;
      }
    }

    // Filtro por usuário
    if (filters.userId && recipe.userId !== filters.userId) {
      return false;
    }

    // Filtro por visibilidade
    if (
      filters.isPublic !== undefined &&
      recipe.isPublic !== filters.isPublic
    ) {
      return false;
    }

    return true;
  });
};

export const selectSearchResults = (state: RootState) => {
  return state.recipes.searchResults
    .map(id => state.recipes.entities[id])
    .filter(Boolean) as Recipe[];
};

export const {
  setLoading,
  setError,
  setSearchLoading,
  setImportLoading,
  setImportError,
  setRecipes,
  addRecipe,
  updateRecipe,
  removeRecipe,
  addRecipes,
  setPagination,
  resetPagination,
  toggleFavorite,
  setFavorites,
  setCategories,
  addCategory,
  setTags,
  addTag,
  setFilters,
  updateFilters,
  clearFilters,
  setSearchQuery,
  setSearchResults,
  clearSearch,
  rateRecipe,
  updateRecipeNotes,
  resetRecipes,
} = recipesSlice.actions;

export default recipesSlice.reducer;
