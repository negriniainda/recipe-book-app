import React, {useCallback} from 'react';
import {View, StyleSheet, ScrollView, Image} from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Divider,
  Button,
} from 'react-native-paper';
import {CreateRecipeInput, Ingredient, Instruction} from '@/types';
import {theme} from '@/utils/theme';

interface RecipePreviewScreenProps {
  recipeData: CreateRecipeInput;
  onEdit: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

const RecipePreviewScreen: React.FC<RecipePreviewScreenProps> = ({
  recipeData,
  onEdit,
  onSave,
  isLoading = false,
}) => {
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

  const totalTime = recipeData.prepTime + recipeData.cookTime;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header com imagem principal */}
        {recipeData.images && recipeData.images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image 
              source={{uri: recipeData.images[0]}} 
              style={styles.mainImage}
            />
            <View style={styles.imageOverlay}>
              <Text variant="headlineMedium" style={styles.titleOverlay}>
                {recipeData.title}
              </Text>
            </View>
          </View>
        )}

        {/* Título (se não houver imagem) */}
        {(!recipeData.images || recipeData.images.length === 0) && (
          <Card style={styles.titleCard}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.title}>
                {recipeData.title}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Descrição */}
        {recipeData.description && (
          <Card style={styles.descriptionCard}>
            <Card.Content>
              <Text variant="bodyLarge" style={styles.description}>
                {recipeData.description}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Informações básicas */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <IconButton icon="account-group" size={24} style={styles.infoIcon} />
                <Text variant="bodySmall" style={styles.infoLabel}>Porções</Text>
                <Text variant="titleMedium" style={styles.infoValue}>
                  {recipeData.servings}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <IconButton icon="clock-outline" size={24} style={styles.infoIcon} />
                <Text variant="bodySmall" style={styles.infoLabel}>Preparo</Text>
                <Text variant="titleMedium" style={styles.infoValue}>
                  {formatTime(recipeData.prepTime)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <IconButton icon="fire" size={24} style={styles.infoIcon} />
                <Text variant="bodySmall" style={styles.infoLabel}>Cozimento</Text>
                <Text variant="titleMedium" style={styles.infoValue}>
                  {formatTime(recipeData.cookTime)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <IconButton icon="timer" size={24} style={styles.infoIcon} />
                <Text variant="bodySmall" style={styles.infoLabel}>Total</Text>
                <Text variant="titleMedium" style={styles.infoValue}>
                  {formatTime(totalTime)}
                </Text>
              </View>
            </View>

            <View style={styles.difficultyContainer}>
              <Chip
                mode="flat"
                style={[
                  styles.difficultyChip,
                  {backgroundColor: getDifficultyColor(recipeData.difficulty) + '20'}
                ]}
                textStyle={[
                  styles.difficultyText,
                  {color: getDifficultyColor(recipeData.difficulty)}
                ]}>
                {getDifficultyLabel(recipeData.difficulty)}
              </Chip>
              
              {recipeData.isPublic && (
                <Chip mode="outlined" style={styles.publicChip}>
                  Pública
                </Chip>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Categorias e Tags */}
        {(recipeData.categories.length > 0 || recipeData.tags.length > 0) && (
          <Card style={styles.tagsCard}>
            <Card.Content>
              {recipeData.categories.length > 0 && (
                <View style={styles.tagSection}>
                  <Text variant="titleSmall" style={styles.tagSectionTitle}>
                    Categorias:
                  </Text>
                  <View style={styles.tagContainer}>
                    {recipeData.categories.map((category, index) => (
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

              {recipeData.tags.length > 0 && (
                <View style={styles.tagSection}>
                  <Text variant="titleSmall" style={styles.tagSectionTitle}>
                    Tags:
                  </Text>
                  <View style={styles.tagContainer}>
                    {recipeData.tags.map((tag, index) => (
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
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Ingredientes
            </Text>
            {recipeData.ingredients.map((ingredient, index) => (
              <View key={ingredient.id} style={styles.ingredientItem}>
                <Text variant="bodyMedium" style={styles.ingredientText}>
                  {ingredient.quantity > 0 && `${ingredient.quantity} ${ingredient.unit} de `}
                  {ingredient.name}
                  {ingredient.optional && (
                    <Text style={styles.optionalText}> (opcional)</Text>
                  )}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Modo de Preparo */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Modo de Preparo
            </Text>
            {recipeData.instructions.map((instruction, index) => (
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

        {/* Galeria de imagens adicionais */}
        {recipeData.images && recipeData.images.length > 1 && (
          <Card style={styles.galleryCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Fotos Adicionais
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.gallery}>
                {recipeData.images.slice(1).map((imageUri, index) => (
                  <Image 
                    key={index} 
                    source={{uri: imageUri}} 
                    style={styles.galleryImage}
                  />
                ))}
              </ScrollView>
            </Card.Content>
          </Card>
        )}

        {/* Botões de ação */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={onEdit}
                disabled={isLoading}
                icon="pencil"
                style={styles.actionButton}>
                Editar
              </Button>
              <Button
                mode="contained"
                onPress={onSave}
                disabled={isLoading}
                loading={isLoading}
                icon="content-save"
                style={styles.actionButton}>
                {isLoading ? 'Salvando...' : 'Salvar Receita'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Espaçamento para o bottom navigation */}
        <View style={styles.bottomSpacing} />
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
    paddingBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  titleOverlay: {
    color: 'white',
    fontWeight: 'bold',
  },
  titleCard: {
    margin: 16,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
  },
  descriptionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
  },
  description: {
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    margin: 0,
    marginBottom: 4,
  },
  infoLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  difficultyChip: {
    borderWidth: 1,
  },
  difficultyText: {
    fontWeight: 'bold',
  },
  publicChip: {
    borderColor: theme.colors.primary,
  },
  tagsCard: {
    marginHorizontal: 16,
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
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
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
    marginHorizontal: 16,
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
  galleryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 1,
  },
  gallery: {
    marginTop: 8,
  },
  galleryImage: {
    width: 120,
    height: 90,
    borderRadius: theme.roundness,
    marginRight: 12,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  bottomSpacing: {
    height: 80,
  },
});

export default RecipePreviewScreen;