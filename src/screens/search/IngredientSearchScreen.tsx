import React, {useState, useCallback} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card, Button, Divider} from 'react-native-paper';
import {useAppDispatch} from '@/store';
import {
  useGetRecipesByIngredientsQuery,
} from '@/services/recipesApi';
import {setFilters} from '@/store/slices/recipesSlice';
import {Recipe} from '@/types';
import {IngredientSearch, SearchResults} from '@/components/search';
import RecipeCard from '@/components/recipe/RecipeCard';
import {theme} from '@/utils/theme';

const IngredientSearchScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const {data: searchData, isLoading: searchLoading, refetch: searchByIngredients} = 
    useGetRecipesByIngredientsQuery({
      ingredients: selectedIngredients,
      page: 1,
      limit: 20,
    }, {
      skip: selectedIngredients.length === 0,
    });

  const handleIngredientsChange = useCallback((ingredients: string[]) => {
    setSelectedIngredients(ingredients);
  }, []);

  const handleSearch = useCallback(async (ingredients: string[]) => {
    if (ingredients.length === 0) return;

    setSelectedIngredients(ingredients);
    setHasSearched(true);
  }, []);

  const handleRecipePress = useCallback((recipe: Recipe) => {
    // TODO: Navegar para detalhes da receita
    // navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  }, []);

  const handleFavoritePress = useCallback(async (recipeId: string) => {
    // TODO: Implementar toggle de favorito
  }, []);

  const handleClearSearch = useCallback(() => {
    setSelectedIngredients([]);
    setHasSearched(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    // Não há filtros adicionais nesta tela
  }, []);

  const handleViewAllRecipes = useCallback(() => {
    // Aplicar filtro de ingredientes na tela principal
    dispatch(setFilters({ingredients: selectedIngredients}));
    // TODO: Navegar para tela de receitas
    // navigation.navigate('Recipes');
  }, [dispatch, selectedIngredients]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Componente de busca por ingredientes */}
        <IngredientSearch
          selectedIngredients={selectedIngredients}
          onIngredientsChange={handleIngredientsChange}
          onSearch={handleSearch}
          style={styles.ingredientSearch}
        />

        {/* Dicas e informações */}
        {!hasSearched && (
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.infoTitle}>
                Como funciona a busca por ingredientes?
              </Text>
              <View style={styles.infoList}>
                <Text variant="bodyMedium" style={styles.infoItem}>
                  🔍 <Text style={styles.infoBold}>Busca inteligente:</Text> Encontramos receitas que usam os ingredientes que você tem
                </Text>
                <Text variant="bodyMedium" style={styles.infoItem}>
                  📊 <Text style={styles.infoBold}>Compatibilidade:</Text> Receitas são ordenadas por quantos ingredientes você possui
                </Text>
                <Text variant="bodyMedium" style={styles.infoItem}>
                  ✨ <Text style={styles.infoBold}>Sugestões:</Text> Mostramos o que está faltando para completar cada receita
                </Text>
                <Text variant="bodyMedium" style={styles.infoItem}>
                  🎯 <Text style={styles.infoBold}>Flexibilidade:</Text> Encontre receitas mesmo sem todos os ingredientes
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Resultados da busca */}
        {hasSearched && (
          <>
            <Divider style={styles.divider} />
            
            {searchLoading ? (
              <Card style={styles.loadingCard}>
                <Card.Content style={styles.loadingContent}>
                  <Text variant="bodyMedium">
                    Buscando receitas com seus ingredientes...
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <>
                {/* Header dos resultados */}
                <View style={styles.resultsHeader}>
                  <Text variant="titleMedium" style={styles.resultsTitle}>
                    {searchData?.items.length || 0} receita{(searchData?.items.length || 0) !== 1 ? 's' : ''} encontrada{(searchData?.items.length || 0) !== 1 ? 's' : ''}
                  </Text>
                  <Text variant="bodySmall" style={styles.resultsSubtitle}>
                    Com {selectedIngredients.length} ingrediente{selectedIngredients.length !== 1 ? 's' : ''} disponível{selectedIngredients.length !== 1 ? 'eis' : ''}
                  </Text>
                </View>

                {/* Lista de receitas */}
                {searchData?.items && searchData.items.length > 0 ? (
                  <View style={styles.recipesList}>
                    {searchData.items.map(recipe => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onPress={handleRecipePress}
                        onFavorite={handleFavoritePress}
                        variant="detailed"
                      />
                    ))}
                    
                    {/* Botão para ver mais */}
                    <Card style={styles.moreCard}>
                      <Card.Content style={styles.moreContent}>
                        <Text variant="bodyMedium" style={styles.moreText}>
                          Quer ver mais receitas com esses ingredientes?
                        </Text>
                        <Button
                          mode="contained"
                          onPress={handleViewAllRecipes}
                          icon="arrow-right"
                          style={styles.moreButton}>
                          Ver Todas as Receitas
                        </Button>
                      </Card.Content>
                    </Card>
                  </View>
                ) : (
                  <Card style={styles.emptyCard}>
                    <Card.Content style={styles.emptyContent}>
                      <Text variant="headlineSmall" style={styles.emptyTitle}>
                        Nenhuma receita encontrada
                      </Text>
                      <Text variant="bodyMedium" style={styles.emptyText}>
                        Não encontramos receitas que usem esses ingredientes específicos.
                      </Text>
                      <Text variant="bodySmall" style={styles.emptySubtext}>
                        Tente adicionar ingredientes mais básicos como ovos, leite, farinha ou temperos.
                      </Text>
                      <Button
                        mode="outlined"
                        onPress={handleClearSearch}
                        icon="refresh"
                        style={styles.emptyButton}>
                        Tentar Novamente
                      </Button>
                    </Card.Content>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
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
  ingredientSearch: {
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 16,
    elevation: 1,
  },
  infoTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
  },
  divider: {
    marginVertical: 16,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  resultsSubtitle: {
    opacity: 0.7,
  },
  recipesList: {
    gap: 16,
  },
  loadingCard: {
    elevation: 1,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  moreCard: {
    elevation: 1,
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
  },
  moreContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  moreText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  moreButton: {
    minWidth: 200,
  },
  emptyCard: {
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  emptyButton: {
    minWidth: 160,
  },
});

export default IngredientSearchScreen;