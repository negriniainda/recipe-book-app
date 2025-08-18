import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, RefreshControl} from 'react-native';
import {FAB} from 'react-native-paper';
import {useAppSelector, useAppDispatch} from '@/store';
import {
  useGetRecipesQuery,
  useLazySearchRecipesQuery,
  useToggleFavoriteMutation,
  useGetCategoriesQuery,
  useGetPopularTagsQuery,
} from '@/services/recipesApi';
import {
  setSearchQuery,
  clearSearch,
  setPagination,
  setFilters,
  clearFilters,
} from '@/store/slices/recipesSlice';
import {Recipe, RecipeFilters} from '@/types';
import {SearchBar, FilterModal, SearchResults, QuickFilters} from '@/components/search';
import {useVoiceSearch} from '@/hooks/useVoiceSearch';
import {theme} from '@/utils/theme';

const RecipesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {searchQuery, pagination, filters} = useAppSelector(
    state => state.recipes,
  );
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // API hooks
  const {
    data: recipesData,
    isLoading: recipesLoading,
    isFetching: recipesFetching,
    refetch: refetchRecipes,
  } = useGetRecipesQuery({
    page: pagination.page,
    limit: pagination.limit,
    filters,
  });

  const [searchRecipes, {isLoading: searchLoading}] =
    useLazySearchRecipesQuery();

  const [toggleFavorite] = useToggleFavoriteMutation();

  const {data: categoriesData} = useGetCategoriesQuery();
  const {data: tagsData} = useGetPopularTagsQuery();

  // Voice search hook
  const {
    isListening,
    isAvailable: voiceAvailable,
    startListening,
    results: voiceResults,
    clearResults: clearVoiceResults,
  } = useVoiceSearch();

  // Selectors
  const filteredRecipes = useAppSelector(state => Object.values(state.recipes.entities).filter(Boolean));
  const searchResults = useAppSelector(state => 
    state.recipes.searchResults
      .map(id => state.recipes.entities[id])
      .filter(Boolean)
  );

  // Dados para exibição
  const displayRecipes = isSearchMode ? searchResults : filteredRecipes;
  const isLoading = recipesLoading || searchLoading || isListening;
  const isRefreshing = recipesFetching && !recipesLoading;

  // Efeitos
  useEffect(() => {
    if (recipesData) {
      dispatch(
        setPagination({
          total: recipesData.pagination.total,
          hasMore: recipesData.pagination.hasNext,
        }),
      );
    }
  }, [recipesData, dispatch]);

  // Processar resultados da busca por voz
  useEffect(() => {
    if (voiceResults.length > 0) {
      const bestResult = voiceResults[0];
      handleSearch(bestResult);
      clearVoiceResults();
    }
  }, [voiceResults, clearVoiceResults]);

  // Handlers
  const handleSearch = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
      dispatch(setSearchQuery(query));

      if (query.trim()) {
        setIsSearchMode(true);
        searchRecipes({
          query: query.trim(),
          page: 1,
          limit: pagination.limit,
        });
      } else {
        setIsSearchMode(false);
        dispatch(clearSearch());
      }
    },
    [dispatch, searchRecipes, pagination.limit],
  );

  const handleRefresh = useCallback(() => {
    if (isSearchMode && searchQuery) {
      searchRecipes({
        query: searchQuery,
        page: 1,
        limit: pagination.limit,
      });
    } else {
      refetchRecipes();
    }
  }, [isSearchMode, searchQuery, searchRecipes, refetchRecipes, pagination.limit]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !isLoading) {
      const nextPage = pagination.page + 1;
      dispatch(setPagination({page: nextPage}));

      if (isSearchMode && searchQuery) {
        searchRecipes({
          query: searchQuery,
          page: nextPage,
          limit: pagination.limit,
        });
      }
    }
  }, [
    pagination.hasMore,
    pagination.page,
    pagination.limit,
    isLoading,
    isSearchMode,
    searchQuery,
    dispatch,
    searchRecipes,
  ]);

  const handleRecipePress = useCallback((recipe: Recipe) => {
    // TODO: Navegar para detalhes da receita
    // navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  }, []);

  const handleFavoritePress = useCallback(
    async (recipeId: string) => {
      try {
        await toggleFavorite(recipeId).unwrap();
      } catch (error) {
        // TODO: Show error toast
        // showToast('Erro ao favoritar receita', 'error');
      }
    },
    [toggleFavorite],
  );

  const handleAddRecipe = useCallback(() => {
    // TODO: Navegar para adicionar receita
    // navigation.navigate('AddRecipe');
  }, []);

  const handleImportRecipe = useCallback(() => {
    // TODO: Navegar para importar receita
    // navigation.navigate('ImportRecipe');
  }, []);

  const handleVoiceSearch = useCallback(async () => {
    if (!voiceAvailable) {
      return;
    }
    await startListening();
  }, [voiceAvailable, startListening]);

  const handleFilterPress = useCallback(() => {
    setShowFilterModal(true);
  }, []);

  const handleApplyFilters = useCallback((newFilters: RecipeFilters) => {
    dispatch(setFilters(newFilters));
    // Se há busca ativa, refazer a busca com os novos filtros
    if (searchQuery) {
      searchRecipes({
        query: searchQuery,
        page: 1,
        limit: pagination.limit,
        // TODO: Implementar filtros na API
        // filters: newFilters,
      });
    }
  }, [dispatch, searchQuery, searchRecipes, pagination.limit]);

  const handleClearFilters = useCallback(() => {
    dispatch(clearFilters());
    // Se há busca ativa, refazer a busca sem filtros
    if (searchQuery) {
      searchRecipes({
        query: searchQuery,
        page: 1,
        limit: pagination.limit,
      });
    }
  }, [dispatch, searchQuery, searchRecipes, pagination.limit]);

  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    setIsSearchMode(false);
    dispatch(clearSearch());
  }, [dispatch]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.categories?.length) count++;
    if (filters.tags?.length) count++;
    if (filters.difficulty?.length) count++;
    if (filters.maxPrepTime) count++;
    if (filters.maxCookTime) count++;
    if (filters.ingredients?.length) count++;
    if (filters.minRating) count++;
    if (filters.isPublic !== undefined) count++;
    return count;
  }, [filters]);



  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Barra de busca avançada */}
        <SearchBar
          placeholder={isListening ? 'Ouvindo...' : 'Buscar receitas...'}
          value={localSearchQuery}
          onChangeText={handleSearch}
          onVoiceSearch={handleVoiceSearch}
          onFilterPress={handleFilterPress}
          loading={isLoading}
          showVoiceSearch={voiceAvailable}
          showFilters={true}
          activeFiltersCount={getActiveFiltersCount()}
          style={styles.searchbar}
        />

        {/* Filtros rápidos */}
        <QuickFilters
          onFilterSelect={handleApplyFilters}
          activeFilters={filters}
          style={styles.quickFilters}
        />

        {/* Resultados de busca */}
        <SearchResults
          query={searchQuery}
          results={displayRecipes}
          filters={filters}
          loading={isLoading}
          onRecipePress={handleRecipePress}
          onFavoritePress={handleFavoritePress}
          onClearSearch={handleClearSearch}
          onClearFilters={handleClearFilters}
          onLoadMore={handleLoadMore}
          hasMore={pagination.hasMore}
          style={styles.results}
        />
      </View>

      {/* Modal de filtros */}
      <FilterModal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        categories={categoriesData || []}
        tags={tagsData || []}
      />

      {/* FAB para adicionar receita */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddRecipe}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  quickFilters: {
    marginBottom: 16,
  },
  results: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default RecipesScreen;
