import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, ScrollView, Image, Share, Alert} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Button,
  Chip,
  Divider,
  FAB,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import {useAppSelector, useAppDispatch} from '@/store';
import {
  useGetRecipeQuery,
  useToggleFavoriteMutation,
  useRateRecipeMutation,
  useDeleteRecipeMutation,
} from '@/services/recipesApi';
import {useGetListsWithRecipeQuery} from '@/services/listsApi';
import {Recipe} from '@/types';
import {AddToListModal} from '@/components/lists';
import ServingAdjuster from '@/components/recipe/ServingAdjuster';
import RatingModal from '@/components/recipe/RatingModal';
import NutritionInfo from '@/components/recipe/NutritionInfo';
import RecipeInteractions from '@/components/recipe/RecipeInteractions';
import {theme} from '@/utils/theme';

interface RecipeDetailsScreenProps {
  recipeId: string;
  onEdit?: (recipe: Recipe) => void;
  onBack?: () => void;
}

const RecipeDetailsScreen: React.FC<RecipeDetailsScreenProps> = ({
  recipeId,
  onEdit,
  onBack,
}) => {
  const dispatch = useAppDispatch();
  const {user} = useAppSelector(state => state.auth);
  
  const [servings, setServings] = useState<number>(1);
  const [showAddToList, setShowAddToList] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showNutrition, setShowNutrition] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  // API hooks
  const {
    data: recipe,
    isLoading,
    error,
    refetch,
  } = useGetRecipeQuery(recipeId);

  const {data: listsWithRecipe} = useGetListsWithRecipeQuery(recipeId, {
    skip: !recipe,
  });

  const [toggleFavorite, {isLoading: favLoading}] = useToggleFavoriteMutation();
  const [rateRecipe, {isLoading: ratingLoading}] = useRateRecipeMutation();
  const [deleteRecipe, {isLoading: deleteLoading}] = useDeleteRecipeMutation();

  // Inicializar porções quando a receita carregar
  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings);
    }
  }, [recipe]);

  const handleToggleFavorite = useCallback(async () => {
    if (!recipe) return;
    
    try {
      await toggleFavorite(recipe.id).unwrap();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os favoritos');
    }
  }, [recipe, toggleFavorite]);

  const handleShare = useCallback(async () => {
    if (!recipe) return;

    try {
      const message = `Confira esta receita: ${recipe.title}\n\n${recipe.description || ''}\n\nCompartilhado via Recipe Book`;
      
      await Share.share({
        message,
        title: recipe.title,
        url: recipe.sourceUrl,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  }, [recipe]);

  const handleEdit = useCallback(() => {
    if (recipe && onEdit) {
      setMenuVisible(false);
      onEdit(recipe);
    }
  }, [recipe, onEdit]);

  const handleDelete = useCallback(() => {
    if (!recipe) return;

    Alert.alert(
      'Excluir Receita',
      `Tem certeza que deseja excluir "${recipe.title}"? Esta ação não pode ser desfeita.`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe(recipe.id).unwrap();
              onBack?.();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a receita');
            }
          },
        },
      ]
    );
  }, [recipe, deleteRecipe, onBack]);

  const handleRating = useCallback(async (rating: number) => {
    if (!recipe) return;

    try {
      await rateRecipe({recipeId: recipe.id, rating}).unwrap();
      setShowRating(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível avaliar a receita');
    }
  }, [recipe, rateRecipe]);

  const formatTime = useCallback((minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }, []);

  const getDifficultyLabel = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  }, []);

  const getDifficultyColor = useCallback((difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return theme.colors.primary;
    }
  }, []);

  const adjustIngredientQuantity = useCallback((originalQuantity: number, originalServings: number) => {
    if (originalServings === 0) return originalQuantity;
    return (originalQuantity * servings) / originalServings;
  }, [servings]);

  const formatQuantity = useCallback((quantity: number) => {
    // Formatar números decimais de forma mais legível
    if (quantity % 1 === 0) {
      return quantity.toString();
    }
    
    // Converter para frações comuns quando possível
    const fractions: {[key: string]: string} = {
      '0.25': '1/4',
      '0.33': '1/3',
      '0.5': '1/2',
      '0.67': '2/3',
      '0.75': '3/4',
    };
    
    const rounded = Math.round(quantity * 100) / 100;
    const fractionKey = rounded.toString();
    
    if (fractions[fractionKey]) {
      return fractions[fractionKey];
    }
    
    return rounded.toString();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Carregando receita...
        </Text>
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall" style={styles.errorTitle}>
          Receita não encontrada
        </Text>
        <Text variant="bodyMedium" style={styles.errorText}>
          Não foi possível carregar os detalhes da receita.
        </Text>
        <Button mode="contained" onPress={refetch} style={styles.retryButton}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  const totalTime = recipe.prepTime + recipe.cookTime;
  const isOwner = user?.id === recipe.userId;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header com imagem */}
        {recipe.images && recipe.images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image 
              source={{uri: recipe.images[imageIndex]}} 
              style={styles.headerImage}
            />
            
            {/* Overlay com ações */}
            <View style={styles.imageOverlay}>
              <View style={styles.imageActions}>
                <IconButton
                  icon="arrow-left"
                  iconColor="white"
                  style={styles.backButton}
                  onPress={onBack}
                />
                
                <View style={styles.rightActions}>
                  <IconButton
                    icon={recipe.isFavorite ? 'heart' : 'heart-outline'}
                    iconColor={recipe.isFavorite ? '#FF6B6B' : 'white'}
                    style={styles.actionButton}
                    onPress={handleToggleFavorite}
                    disabled={favLoading}
                  />
                  <IconButton
                    icon="share"
                    iconColor="white"
                    style={styles.actionButton}
                    onPress={handleShare}
                  />
                  {isOwner && (
                    <Menu
                      visible={menuVisible}
                      onDismiss={() => setMenuVisible(false)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          iconColor="white"
                          style={styles.actionButton}
                          onPress={() => setMenuVisible(true)}
                        />
                      }>
                      <Menu.Item
                        onPress={handleEdit}
                        title="Editar"
                        leadingIcon="pencil"
                      />
                      <Menu.Item
                        onPress={handleDelete}
                        title="Excluir"
                        leadingIcon="delete"
                        titleStyle={{color: theme.colors.error}}
                      />
                    </Menu>
                  )}
                </View>
              </View>
              
              {/* Indicadores de imagem */}
              {recipe.images.length > 1 && (
                <View style={styles.imageIndicators}>
                  {recipe.images.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.indicator,
                        index === imageIndex && styles.activeIndicator,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Navegação de imagens */}
            {recipe.images.length > 1 && (
              <>
                {imageIndex > 0 && (
                  <IconButton
                    icon="chevron-left"
                    iconColor="white"
                    style={styles.prevButton}
                    onPress={() => setImageIndex(imageIndex - 1)}
                  />
                )}
                {imageIndex < recipe.images.length - 1 && (
                  <IconButton
                    icon="chevron-right"
                    iconColor="white"
                    style={styles.nextButton}
                    onPress={() => setImageIndex(imageIndex + 1)}
                  />
                )}
              </>
            )}
          </View>
        )}

        <View style={styles.content}>
          {/* Título e descrição */}
          <Card style={styles.titleCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                {recipe.title}
              </Text>
              
              {recipe.description && (
                <Text variant="bodyLarge" style={styles.description}>
                  {recipe.description}
                </Text>
              )}

              {/* Metadados de origem */}
              {(recipe.originalAuthor || recipe.sourceUrl) && (
                <View style={styles.sourceInfo}>
                  {recipe.originalAuthor && (
                    <Text variant="bodySmall" style={styles.sourceText}>
                      Por: {recipe.originalAuthor}
                    </Text>
                  )}
                  {recipe.sourceUrl && (
                    <Text variant="bodySmall" style={styles.sourceText}>
                      Fonte: {recipe.sourceUrl}
                    </Text>
                  )}
                </View>
              )}

              {/* Avaliação e listas */}
              <View style={styles.metaInfo}>
                <View style={styles.rating}>
                  {recipe.rating && (
                    <View style={styles.ratingDisplay}>
                      <IconButton icon="star" size={16} iconColor="#FFC107" />
                      <Text variant="bodySmall">{recipe.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  <Button
                    mode="text"
                    compact
                    onPress={() => setShowRating(true)}>
                    Avaliar
                  </Button>
                </View>

                {listsWithRecipe && listsWithRecipe.length > 0 && (
                  <View style={styles.listsInfo}>
                    <Text variant="bodySmall" style={styles.listsText}>
                      Em {listsWithRecipe.length} lista{listsWithRecipe.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>

          {/* Informações básicas com ajuste de porções */}
          <ServingAdjuster
            recipe={recipe}
            servings={servings}
            onServingsChange={setServings}
            style={styles.servingAdjuster}
          />

          {/* Categorias e Tags */}
          {(recipe.categories.length > 0 || recipe.tags.length > 0) && (
            <Card style={styles.tagsCard}>
              <Card.Content>
                {recipe.categories.length > 0 && (
                  <View style={styles.tagSection}>
                    <Text variant="titleSmall" style={styles.tagSectionTitle}>
                      Categorias:
                    </Text>
                    <View style={styles.tagContainer}>
                      {recipe.categories.map((category, index) => (
                        <Chip
                          key={index}
                          mode="flat"
                          style={styles.categoryChip}>
                          {category}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {recipe.tags.length > 0 && (
                  <View style={styles.tagSection}>
                    <Text variant="titleSmall" style={styles.tagSectionTitle}>
                      Tags:
                    </Text>
                    <View style={styles.tagContainer}>
                      {recipe.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          style={styles.tagChip}>
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Ingredientes */}
          <Card style={styles.ingredientsCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Ingredientes
                </Text>
                {servings !== recipe.servings && (
                  <Chip mode="outlined" compact style={styles.adjustedChip}>
                    Ajustado para {servings} porç{servings !== 1 ? 'ões' : 'ão'}
                  </Chip>
                )}
              </View>
              
              {recipe.ingredients.map((ingredient, index) => {
                const adjustedQuantity = adjustIngredientQuantity(
                  ingredient.quantity,
                  recipe.servings
                );
                
                return (
                  <View key={ingredient.id} style={styles.ingredientItem}>
                    <Text variant="bodyMedium" style={styles.ingredientText}>
                      {adjustedQuantity > 0 && (
                        <>
                          {formatQuantity(adjustedQuantity)} {ingredient.unit} de{' '}
                        </>
                      )}
                      {ingredient.name}
                      {ingredient.optional && (
                        <Text style={styles.optionalText}> (opcional)</Text>
                      )}
                    </Text>
                  </View>
                );
              })}
            </Card.Content>
          </Card>

          {/* Modo de Preparo */}
          <Card style={styles.instructionsCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Modo de Preparo
              </Text>
              
              {recipe.instructions.map((instruction, index) => (
                <View key={instruction.id} style={styles.instructionItem}>
                  <View style={styles.instructionHeader}>
                    <Text variant="titleMedium" style={styles.stepNumber}>
                      {instruction.stepNumber}.
                    </Text>
                    <View style={styles.instructionMeta}>
                      {instruction.duration && (
                        <Chip mode="outlined" compact style={styles.instructionMetaChip}>
                          {formatTime(instruction.duration)}
                        </Chip>
                      )}
                      {instruction.temperature && (
                        <Chip mode="outlined" compact style={styles.instructionMetaChip}>
                          {instruction.temperature}°C
                        </Chip>
                      )}
                    </View>
                  </View>
                  <Text variant="bodyMedium" style={styles.instructionText}>
                    {instruction.description}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Informações Nutricionais */}
          {recipe.nutrition && (
            <NutritionInfo
              nutrition={recipe.nutrition}
              servings={servings}
              originalServings={recipe.servings}
              onToggle={() => setShowNutrition(!showNutrition)}
              expanded={showNutrition}
            />
          )}

          {/* Sistema de Avaliações e Anotações */}
          <RecipeInteractions
            recipe={recipe}
            onRecipeUpdate={(updatedRecipe) => {
              // Atualizar a receita local se necessário
              refetch();
            }}
            style={styles.interactions}
          />

          {/* Espaçamento para o FAB */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* FAB para adicionar à lista */}
      <FAB
        icon="playlist-plus"
        style={styles.fab}
        onPress={() => setShowAddToList(true)}
      />

      {/* Modais */}
      <AddToListModal
        visible={showAddToList}
        onDismiss={() => setShowAddToList(false)}
        recipe={recipe}
        userLists={[]} // TODO: Buscar listas do usuário
        onAddToLists={() => {}} // TODO: Implementar
        onCreateNewList={() => {}} // TODO: Implementar
      />

      <RatingModal
        visible={showRating}
        onDismiss={() => setShowRating(false)}
        onRate={handleRating}
        currentRating={recipe.rating}
        loading={ratingLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  retryButton: {
    minWidth: 160,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  rightActions: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginLeft: 8,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  prevButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  nextButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    padding: 16,
  },
  titleCard: {
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  description: {
    lineHeight: 24,
    marginBottom: 12,
    opacity: 0.8,
  },
  sourceInfo: {
    marginBottom: 12,
  },
  sourceText: {
    opacity: 0.7,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  listsInfo: {
    alignItems: 'flex-end',
  },
  listsText: {
    opacity: 0.7,
  },
  servingAdjuster: {
    marginBottom: 16,
  },
  tagsCard: {
    marginBottom: 16,
    elevation: 1,
  },
  tagSection: {
    marginBottom: 12,
  },
  tagSectionTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
    marginBottom: 4,
  },
  tagChip: {
    marginBottom: 4,
  },
  ingredientsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  adjustedChip: {
    height: 28,
  },
  ingredientItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20',
  },
  ingredientText: {
    lineHeight: 20,
  },
  optionalText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  instructionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  instructionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline + '20',
  },
  instructionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    minWidth: 30,
  },
  instructionMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  instructionMetaChip: {
    height: 24,
  },
  instructionText: {
    lineHeight: 22,
    paddingLeft: 30,
  },
  interactions: {
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default RecipeDetailsScreen;