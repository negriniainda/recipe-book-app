import React, {useCallback} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem} from 'react-native';
import {Text, Card, Button, Chip, ActivityIndicator} from 'react-native-paper';
import {Recipe, RecipeFilters} from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import {theme} from '@/utils/theme';

interface SearchResultsProps {
  query: string;
  results: Recipe[];
  filters: RecipeFilters;
  loading: boolean;
  onRecipePress: (recipe: Recipe) => void;
  onFavoritePress: (recipeId: string) => void;
  onClearSearch: () => void;
  onClearFilters: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  style?: any;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  filters,
  loading,
  onRecipePress,
  onFavoritePress,
  onClearSearch,
  onClearFilters,
  onLoadMore,
  hasMore = false,
  style,
}) => {
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

  const getFilterSummary = useCallback(() => {
    const summary: string[] = [];
    
    if (filters.categories?.length) {
      summary.push(`${filters.categories.length} categoria${filters.categories.length > 1 ? 's' : ''}`);
    }
    
    if (filters.difficulty?.length) {
      summary.push(`${filters.difficulty.length} dificuldade${filters.difficulty.length > 1 ? 's' : ''}`);
    }
    
    if (filters.maxPrepTime) {
      summary.push(`até ${filters.maxPrepTime}min preparo`);
    }
    
    if (filters.ingredients?.length) {
      summary.push(`${filters.ingredients.length} ingrediente${filters.ingredients.length > 1 ? 's' : ''}`);
    }

    return summary.slice(0, 2).join(', ');
  }, [filters]);

  const renderRecipe: ListRenderItem<Recipe> = useCallback(
    ({item}) => (
      <RecipeCard
        recipe={item}
        onPress={onRecipePress}
        onFavorite={onFavoritePress}
        variant="default"
      />
    ),
    [onRecipePress, onFavoritePress],
  );

  const renderHeader = useCallback(() => {
    const activeFiltersCount = getActiveFiltersCount();
    const filterSummary = getFilterSummary();

    return (
      <View style={styles.header}>
        {/* Resultado da busca */}
        <View style={styles.searchInfo}>
          <Text variant="titleMedium" style={styles.resultsTitle}>
            {loading ? 'Buscando...' : (
              <>
                {results.length} resultado{results.length !== 1 ? 's' : ''} 
                {query && ` para "${query}"`}
              </>
            )}
          </Text>
          
          {!loading && query && (
            <Chip
              mode="outlined"
              icon="close"
              onPress={onClearSearch}
              style={styles.clearChip}>
              Limpar busca
            </Chip>
          )}
        </View>

        {/* Filtros ativos */}
        {activeFiltersCount > 0 && (
          <View style={styles.filtersInfo}>
            <Text variant="bodySmall" style={styles.filtersText}>
              {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
              {filterSummary && `: ${filterSummary}`}
            </Text>
            <Chip
              mode="outlined"
              icon="close"
              onPress={onClearFilters}
              style={styles.clearFiltersChip}
              compact>
              Limpar filtros
            </Chip>
          </View>
        )}
      </View>
    );
  }, [query, results.length, loading, getActiveFiltersCount, getFilterSummary, onClearSearch, onClearFilters]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text variant="bodySmall" style={styles.footerText}>
          Carregando mais resultados...
        </Text>
      </View>
    );
  }, [hasMore]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Buscando receitas...
          </Text>
        </View>
      );
    }

    const activeFiltersCount = getActiveFiltersCount();

    return (
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Nenhuma receita encontrada
          </Text>
          
          {query && (
            <Text variant="bodyMedium" style={styles.emptyText}>
              Não encontramos receitas para "{query}"
              {activeFiltersCount > 0 && ' com os filtros aplicados'}
            </Text>
          )}
          
          {!query && activeFiltersCount > 0 && (
            <Text variant="bodyMedium" style={styles.emptyText}>
              Nenhuma receita corresponde aos filtros aplicados
            </Text>
          )}

          <Text variant="bodySmall" style={styles.emptySubtext}>
            Tente usar termos diferentes ou ajustar os filtros
          </Text>

          <View style={styles.emptyActions}>
            {query && (
              <Button
                mode="outlined"
                onPress={onClearSearch}
                style={styles.emptyButton}>
                Limpar Busca
              </Button>
            )}
            {activeFiltersCount > 0 && (
              <Button
                mode="outlined"
                onPress={onClearFilters}
                style={styles.emptyButton}>
                Limpar Filtros
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  }, [loading, query, getActiveFiltersCount, onClearSearch, onClearFilters]);

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={results}
        renderItem={renderRecipe}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          results.length === 0 ? styles.emptyContainer : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  searchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  resultsTitle: {
    fontWeight: '500',
    opacity: 0.8,
    flex: 1,
  },
  clearChip: {
    height: 32,
  },
  filtersInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
    padding: 12,
    borderRadius: theme.roundness,
    flexWrap: 'wrap',
    gap: 8,
  },
  filtersText: {
    opacity: 0.8,
    flex: 1,
  },
  clearFiltersChip: {
    height: 28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emptyButton: {
    minWidth: 120,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginTop: 8,
    opacity: 0.7,
  },
});

export default SearchResults;