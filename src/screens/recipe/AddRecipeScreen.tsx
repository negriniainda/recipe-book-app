import React, {useState, useCallback} from 'react';
import {View, StyleSheet, ScrollView, Alert} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Switch,
  Divider,
  IconButton,
  Menu,
  ActivityIndicator,
} from 'react-native-paper';
import {useAppSelector} from '@/store';
import {useCreateRecipeMutation} from '@/services/recipesApi';
import {CreateRecipeInput, Ingredient, Instruction} from '@/types';
import IngredientInput from '@/components/recipe/IngredientInput';
import InstructionInput from '@/components/recipe/InstructionInput';
import ImageUpload from '@/components/recipe/ImageUpload';
import CategoryTagSelector from '@/components/recipe/CategoryTagSelector';
import {theme} from '@/utils/theme';

const AddRecipeScreen: React.FC = () => {
  const {user} = useAppSelector(state => state.auth);
  const [createRecipe, {isLoading: isCreating}] = useCreateRecipeMutation();

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    servings: '4',
    prepTime: '',
    cookTime: '',
    difficulty: 'medium' as CreateRecipeInput['difficulty'],
    isPublic: true,
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [difficultyMenuVisible, setDifficultyMenuVisible] = useState(false);

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);

  const validateForm = useCallback(() => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Título é obrigatório');
    }

    if (ingredients.length === 0) {
      errors.push('Adicione pelo menos um ingrediente');
    }

    if (instructions.length === 0) {
      errors.push('Adicione pelo menos um passo do modo de preparo');
    }

    if (!formData.prepTime || parseInt(formData.prepTime) <= 0) {
      errors.push('Tempo de preparo deve ser maior que zero');
    }

    if (!formData.cookTime || parseInt(formData.cookTime) < 0) {
      errors.push('Tempo de cozimento deve ser zero ou maior');
    }

    if (!formData.servings || parseInt(formData.servings) <= 0) {
      errors.push('Número de porções deve ser maior que zero');
    }

    return errors;
  }, [formData, ingredients, instructions]);

  const handleSave = useCallback(async () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      Alert.alert(
        'Formulário Incompleto',
        errors.join('\n'),
        [{text: 'OK'}]
      );
      return;
    }

    try {
      const recipeData: CreateRecipeInput = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        servings: parseInt(formData.servings),
        prepTime: parseInt(formData.prepTime),
        cookTime: parseInt(formData.cookTime),
        difficulty: formData.difficulty,
        ingredients,
        instructions,
        categories,
        tags,
        images,
        isPublic: formData.isPublic,
        isFavorite: false,
        userId: user?.id || 'current-user',
        nutrition: undefined, // TODO: Calcular informações nutricionais
      };

      await createRecipe(recipeData).unwrap();
      
      Alert.alert(
        'Receita Criada!',
        'Sua receita foi salva com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => {
              // TODO: Navegar de volta ou para a receita criada
              // navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Erro ao Salvar',
        'Não foi possível salvar a receita. Tente novamente.',
        [{text: 'OK'}]
      );
    }
  }, [formData, ingredients, instructions, categories, tags, images, user, createRecipe, validateForm]);

  const handlePreview = useCallback(() => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      Alert.alert(
        'Formulário Incompleto',
        'Complete todos os campos obrigatórios para visualizar o preview.',
        [{text: 'OK'}]
      );
      return;
    }

    // TODO: Navegar para tela de preview
    // navigation.navigate('RecipePreview', { recipeData });
  }, [validateForm]);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  const getTotalTime = () => {
    const prep = parseInt(formData.prepTime) || 0;
    const cook = parseInt(formData.cookTime) || 0;
    return prep + cook;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.headerTitle}>
              Nova Receita
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Compartilhe sua receita especial com a comunidade
            </Text>
          </Card.Content>
        </Card>

        {/* Informações básicas */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Informações Básicas
            </Text>

            <TextInput
              mode="outlined"
              label="Título da Receita *"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              placeholder="Ex: Bolo de Chocolate Caseiro"
              style={styles.input}
              maxLength={100}
            />

            <TextInput
              mode="outlined"
              label="Descrição (opcional)"
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              placeholder="Descreva sua receita..."
              multiline
              numberOfLines={3}
              style={styles.input}
              maxLength={500}
            />

            <View style={styles.metaRow}>
              <TextInput
                mode="outlined"
                label="Porções *"
                value={formData.servings}
                onChangeText={(text) => updateFormData('servings', text)}
                placeholder="4"
                keyboardType="numeric"
                style={[styles.input, styles.metaInput]}
              />

              <TextInput
                mode="outlined"
                label="Preparo (min) *"
                value={formData.prepTime}
                onChangeText={(text) => updateFormData('prepTime', text)}
                placeholder="30"
                keyboardType="numeric"
                style={[styles.input, styles.metaInput]}
              />

              <TextInput
                mode="outlined"
                label="Cozimento (min) *"
                value={formData.cookTime}
                onChangeText={(text) => updateFormData('cookTime', text)}
                placeholder="45"
                keyboardType="numeric"
                style={[styles.input, styles.metaInput]}
              />
            </View>

            {/* Tempo total */}
            {(formData.prepTime || formData.cookTime) && (
              <View style={styles.totalTimeContainer}>
                <Text variant="bodyMedium" style={styles.totalTimeText}>
                  Tempo total: {formatTime(getTotalTime())}
                </Text>
              </View>
            )}

            {/* Dificuldade */}
            <Menu
              visible={difficultyMenuVisible}
              onDismiss={() => setDifficultyMenuVisible(false)}
              anchor={
                <TextInput
                  mode="outlined"
                  label="Dificuldade"
                  value={getDifficultyLabel(formData.difficulty)}
                  editable={false}
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setDifficultyMenuVisible(true)}
                    />
                  }
                  style={styles.input}
                />
              }>
              <Menu.Item
                onPress={() => {
                  updateFormData('difficulty', 'easy');
                  setDifficultyMenuVisible(false);
                }}
                title="Fácil"
              />
              <Menu.Item
                onPress={() => {
                  updateFormData('difficulty', 'medium');
                  setDifficultyMenuVisible(false);
                }}
                title="Médio"
              />
              <Menu.Item
                onPress={() => {
                  updateFormData('difficulty', 'hard');
                  setDifficultyMenuVisible(false);
                }}
                title="Difícil"
              />
            </Menu>

            {/* Visibilidade */}
            <View style={styles.visibilityContainer}>
              <View style={styles.visibilityInfo}>
                <Text variant="titleSmall">Receita Pública</Text>
                <Text variant="bodySmall" style={styles.visibilityDescription}>
                  Outras pessoas podem encontrar e visualizar esta receita
                </Text>
              </View>
              <Switch
                value={formData.isPublic}
                onValueChange={(value) => updateFormData('isPublic', value)}
                color={theme.colors.primary}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Upload de imagens */}
        <ImageUpload
          images={images}
          onImagesChange={setImages}
          maxImages={5}
        />

        {/* Ingredientes */}
        <IngredientInput
          ingredients={ingredients}
          onIngredientsChange={setIngredients}
        />

        {/* Instruções */}
        <InstructionInput
          instructions={instructions}
          onInstructionsChange={setInstructions}
        />

        {/* Categorias e Tags */}
        <CategoryTagSelector
          categories={categories}
          tags={tags}
          onCategoriesChange={setCategories}
          onTagsChange={setTags}
        />

        {/* Botões de ação */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={handlePreview}
                disabled={isCreating}
                icon="eye"
                style={styles.actionButton}>
                Preview
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={isCreating}
                loading={isCreating}
                icon="content-save"
                style={styles.actionButton}>
                {isCreating ? 'Salvando...' : 'Salvar Receita'}
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
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
  },
  headerTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.8,
  },
  sectionCard: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  input: {
    marginBottom: 12,
    backgroundColor: theme.colors.background,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaInput: {
    flex: 1,
  },
  totalTimeContainer: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.roundness,
    marginBottom: 12,
  },
  totalTimeText: {
    fontWeight: '500',
    textAlign: 'center',
    color: theme.colors.primary,
  },
  visibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  visibilityInfo: {
    flex: 1,
    marginRight: 16,
  },
  visibilityDescription: {
    opacity: 0.7,
    marginTop: 4,
  },
  actionsCard: {
    marginTop: 16,
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

export default AddRecipeScreen;