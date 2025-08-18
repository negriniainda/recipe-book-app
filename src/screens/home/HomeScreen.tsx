import React, {useCallback} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
import {Text, Card, Button, Chip, ActivityIndicator} from 'react-native-paper';
import {useAppSelector} from '@/store';
import {
  useGetRecipesQuery,
  useGetFavoriteRecipesQuery,
  useGetCategoriesQuery,
} from '@/services/recipesApi';
// Removed unused imports from recipesSlice
import {Recipe} from '@/types';
import RecipeCard from '@/components/recipe/RecipeCard';
import {theme} from '@/utils/theme';

const HomeScreen: React.FC = () => {
  const {user} = useAppSelector(state => state.auth);
  
  // API queries
  const {data: recipesData, isLoading: recipesLoading} = useGetRecipesQuery({
    page: 1,
    limit: 6, // Mostrar apenas as 6 mais recentes na home
  });
  
  const {data: favoritesData, isLoading: favoritesLoading} = useGetFavoriteRecipesQuery({
    page: 1,
    limit: 4, // Mostrar apenas 4 favoritas na home
  });
  
  const {data: categoriesData} = useGetCategoriesQuery();

  // Selectors
  const allRecipes = useAppSelector(state => Object.values(state.recipes.entities).filter(Boolean));
  const favoriteRecipes = useAppSelector(state => 
    state.recipes.favorites
      .map(id => state.recipes.entities[id])
      .filter(Boolean)
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleRecipePress = useCallback((recipe: Recipe) => {
    // TODO: Navegar para detalhes da receita
    // navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  }, []);

  const handleCategoryPress = useCallback((category: string) => {
    // TODO: Navegar para receitas da categoria
    // navigation.navigate('Recipes', { category });
  }, []);

  const handleAddRecipe = useCallback(() => {
    // TODO: Navegar para adicionar receita
    // navigation.navigate('AddRecipe');
  }, []);

  const handleImportRecipe = useCallback(() => {
    // TODO: Navegar para importar receita
    // navigation.navigate('ImportRecipe');
  }, []);

  const handleViewAllRecipes = useCallback(() => {
    // TODO: Navegar para tela de receitas
    // navigation.navigate('Recipes');
  }, []);

  const handleViewAllFavorites = useCallback(() => {
    // TODO: Navegar para favoritas
    // navigation.navigate('Favorites');
  }, []);

  const recentRecipes = recipesData?.items.slice(0, 6) || [];
  const recentFavorites = favoritesData?.items.slice(0, 4) || [];
  const categories = categoriesData?.slice(0, 6) || [
    'Doces',
    'Salgados',
    'Fitness',
    'Vegano',
    'Rápido',
    'Massas',
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header de boas-vindas */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.greeting}>
              {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Chef'}! 👋
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              O que vamos cozinhar hoje?
            </Text>
          </Card.Content>
        </Card>

        {/* Ações rápidas */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ações Rápidas
            </Text>
            <View style={styles.quickActions}>
              <Button
                mode="contained-tonal"
                icon="plus"
                style={styles.actionButton}
                onPress={handleAddRecipe}>
                Nova Receita
              </Button>
              <Button
                mode="contained-tonal"
                icon="import"
                style={styles.actionButton}
                onPress={handleImportRecipe}>
                Importar
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Estatísticas rápidas */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Suas Estatísticas
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {recipesData?.pagination.total || allRecipes.length || 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Receitas
                </Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  {favoritesData?.pagination.total || favoriteRecipes.length || 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Favoritas
                </Text>
              </View>
              <View style={styles.stat}>
                <Text variant="headlineMedium" style={styles.statNumber}>
                  0
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Planejadas
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Categorias populares */}
        <Card style={styles.categoriesCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Categorias Populares
            </Text>
            <View style={styles.categoriesContainer}>
              {categories.map(category => (
                <Chip
                  key={category}
                  mode="outlined"
                  style={styles.categoryChip}
                  onPress={() => handleCategoryPress(category)}>
                  {category}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Receitas recentes */}
        <Card style={styles.recentCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Receitas Recentes
              </Text>
              {recentRecipes.length > 0 && (
                <Button
                  mode="text"
                  compact
                  onPress={handleViewAllRecipes}>
                  Ver todas
                </Button>
              )}
            </View>
            
            {recipesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text variant="bodySmall" style={styles.loadingText}>
                  Carregando receitas...
                </Text>
              </View>
            ) : recentRecipes.length > 0 ? (
              <FlatList
                data={recentRecipes}
                renderItem={({item}) => (
                  <RecipeCard
                    recipe={item}
                    onPress={handleRecipePress}
                    variant="compact"
                  />
                )}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Você ainda não tem receitas.
                </Text>
                <Text variant="bodySmall" style={styles.emptySubtext}>
                  Comece adicionando sua primeira receita!
                </Text>
                <Button
                  mode="contained"
                  icon="plus"
                  style={styles.emptyButton}
                  onPress={handleAddRecipe}>
                  Adicionar Receita
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Receitas favoritas */}
        {(recentFavorites.length > 0 || favoritesLoading) && (
          <Card style={styles.favoritesCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Suas Favoritas
                </Text>
                {recentFavorites.length > 0 && (
                  <Button
                    mode="text"
                    compact
                    onPress={handleViewAllFavorites}>
                    Ver todas
                  </Button>
                )}
              </View>
              
              {favoritesLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text variant="bodySmall" style={styles.loadingText}>
                    Carregando favoritas...
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={recentFavorites}
                  renderItem={({item}) => (
                    <RecipeCard
                      recipe={item}
                      onPress={handleRecipePress}
                      variant="compact"
                    />
                  )}
                  keyExtractor={item => item.id}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              )}
            </Card.Content>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
  },
  greeting: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
  },
  quickActionsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
  categoriesCard: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 4,
  },
  recentCard: {
    marginBottom: 16,
  },
  favoritesCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    marginTop: 8,
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 160,
  },
});

export default HomeScreen;
