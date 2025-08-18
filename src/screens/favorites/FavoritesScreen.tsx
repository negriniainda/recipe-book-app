import React, {useCallback, useState} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem} from 'react-native';
import {
  Text,
  Card,
  Button,
  Searchbar,
  FAB,
  Menu,
  IconButton,
  Chip,
} from 'react-native-paper';
import {useAppSelector, useAppDispatch} from '@/store';
import {
  useGetFavoriteRecipesQuery,
  useToggleFavoriteMutation,
} from '@/services/recipesApi';
import {Recipe} from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import {theme} from '@/utils/theme';

type SortOption = 'dateAdded' | 'alphabetical' | 'rating' | 'prepTime';
type ViewMode = 'grid' | 'list';

const FavoritesScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  // API hooks
  const {
    data: favoritesData,
    isLoading,
    isFetching,
    refetch,
  } = useGetFavoriteRecipesQuery({
    page: 1,
    limit: 50, // Carregar mais favoritos de uma vez
  });

  const [toggleFavorite] = useToggleFavoriteMutation();

  const favorites = favoritesData?.items || [];

  // Filtrar e ordenar favoritos
  const filteredAndSortedFavorites = React.useMemo(() => {
    let filtered = favorites;

    // Filtrar por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = favorites.filter(recipe =>
        recipe.title.toLowerCase().includes(query) ||
        recipe.description?.toLowerCase().includes(query) ||
        recipe.categories.some(cat => cat.toLowerCase().includes(query)) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Ordenar
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'prepTime':
          return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
        case 'dateAdded':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return sorted;
  }, [favorites, searchQuery, sortBy]);

  const handleRecipePress = useCallback((recipe: Recipe) => {
    // TODO: Navegar para detalhes da receita
    // navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  }, []);

  const handleToggleFavorite = useCallback(
    async (recipeId: string) => {
      try {
        await toggleFavorite(recipeId).unwrap();
      } catch (error) {
        // TODO: Mostrar toast de erro
      }
    },
    [toggleFavorite],
  );

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
    setSortMenuVisible(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleAddRecipe = useCallback(() => {
    // TODO: Navegar para adicionar receita
    // navigation.navigate('AddRecipe');
  }, []);

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case 'alphabetical': return 'Alfabética';
      case 'rating': return 'Avaliação';
      case 'prepTime': return 'Tempo de Preparo';
      case 'dateAdded': return 'Adicionado Recentemente';
      default: return 'Ordenar';
    }
  };

  const renderRecipe: ListRenderItem<Recipe> = useCallback(
    ({item}) => (
      <RecipeCard
        recipe={item}
        onPress={handleRecipePress}
        onFavorite={handleToggleFavorite}
        variant={viewMode === 'grid' ? 'compact' : 'default'}
      />
    ),
    [handleRecipePress, handleToggleFavorite, viewMode],
  );

  const renderHeader = useCallback(() => {
    if (filteredAndSortedFavorites.length === 0) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text variant="titleMedium" style={styles.headerTitle}>
            {searchQuery ? (
              <>
                {filteredAndSortedFavorites.length} resultado{filteredAndSortedFavorites.length !== 1 ? 's' : ''} 
                {' '}para "{searchQuery}"
              </>
            ) : (
              <>
                {filteredAndSortedFavorites.length} receita{filteredAndSortedFavorites.length !== 1 ? 's' : ''} favorita{filteredAndSortedFavorites.length !== 1 ? 's' : ''}
              </>
            )}
          </Text>
          
          {searchQuery && (
            <Chip
              mode="outlined"
              icon="close"
              onPress={handleClearSearch}
              style={styles.clearSearchChip}>
              Limpar busca
            </Chip>
          )}
        </View>

        <View style={styles.headerActions}>
          {/* Ordenação */}
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                icon="sort"
                onPress={() => setSortMenuVisible(true)}
                compact>
                {getSortLabel(sortBy)}
              </Button>
            }>
            <Menu.Item
              onPress={() => handleSortChange('dateAdded')}
              title="Adicionado Recentemente"
              leadingIcon={sortBy === 'dateAdded' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleSortChange('alphabetical')}
              title="Alfabética"
              leadingIcon={sortBy === 'alphabetical' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleSortChange('rating')}
              title="Avaliação"
              leadingIcon={sortBy === 'rating' ? 'check' : undefined}
            />
            <Menu.Item
              onPress={() => handleSortChange('prepTime')}
              title="Tempo de Preparo"
              leadingIcon={sortBy === 'prepTime' ? 'check' : undefined}
            />
          </Menu>

          {/* Modo de visualização */}
          <IconButton
            icon={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            mode="outlined"
          />
        </View>
      </View>
    );
  }, [
    filteredAndSortedFavorites.length,
    searchQuery,
    sortBy,
    sortMenuVisible,
    viewMode,
    handleClearSearch,
    handleSortChange,
  ]);

  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;

    if (searchQuery) {
      return (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              Nenhuma receita encontrada
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Não encontramos receitas favoritas para "{searchQuery}"
            </Text>
            <Button
              mode="outlined"
              onPress={handleClearSearch}
              style={styles.emptyButton}>
              Limpar Busca
            </Button>
          </Card.Content>
        </Card>
      );
    }

    return (
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Nenhuma receita favorita
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Suas receitas favoritas aparecerão aqui
          </Text>
          <Text variant="bodySmall" style={styles.emptySubtext}>
            Toque no ❤️ nas receitas para adicioná-las aos favoritos
          </Text>
          <Button
            mode="contained"
            icon="magnify"
            onPress={handleAddRecipe}
            style={styles.emptyButton}>
            Explorar Receitas
          </Button>
        </Card.Content>
      </Card>
    );
  }, [isLoading, searchQuery, handleClearSearch, handleAddRecipe]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Barra de busca */}
        <Searchbar
          placeholder="Buscar nos favoritos..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {/* Lista de receitas favoritas */}
        <FlatList
          data={filteredAndSortedFavorites}
          renderItem={renderRecipe}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshing={isFetching && !isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredAndSortedFavorites.length === 0 ? styles.emptyContainer : undefined
          }
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Força re-render quando muda o modo
        />
      </View>

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
  header: {
    marginBottom: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitle: {
    fontWeight: '500',
    opacity: 0.8,
    flex: 1,
  },
  clearSearchChip: {
    height: 32,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  emptyButton: {
    minWidth: 160,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default FavoritesScreen;