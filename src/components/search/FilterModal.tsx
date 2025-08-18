import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Button,
  Chip,
  Divider,
  Switch,
  TextInput,
} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import {RecipeFilters} from '@/types';
import {theme} from '@/utils/theme';

interface FilterModalProps {
  visible: boolean;
  onDismiss: () => void;
  filters: RecipeFilters;
  onApplyFilters: (filters: RecipeFilters) => void;
  onClearFilters: () => void;
  categories?: string[];
  tags?: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onDismiss,
  filters,
  onApplyFilters,
  onClearFilters,
  categories = [],
  tags = [],
}) => {
  const [localFilters, setLocalFilters] = useState<RecipeFilters>(filters);
  const [ingredientInput, setIngredientInput] = useState('');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = useCallback(() => {
    onApplyFilters(localFilters);
    onDismiss();
  }, [localFilters, onApplyFilters, onDismiss]);

  const handleClear = useCallback(() => {
    const clearedFilters: RecipeFilters = {};
    setLocalFilters(clearedFilters);
    onClearFilters();
    onDismiss();
  }, [onClearFilters, onDismiss]);

  const toggleCategory = useCallback((category: string) => {
    setLocalFilters(prev => {
      const categories = prev.categories || [];
      const newCategories = categories.includes(category)
        ? categories.filter(c => c !== category)
        : [...categories, category];
      
      return {
        ...prev,
        categories: newCategories.length > 0 ? newCategories : undefined,
      };
    });
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setLocalFilters(prev => {
      const tags = prev.tags || [];
      const newTags = tags.includes(tag)
        ? tags.filter(t => t !== tag)
        : [...tags, tag];
      
      return {
        ...prev,
        tags: newTags.length > 0 ? newTags : undefined,
      };
    });
  }, []);

  const toggleDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    setLocalFilters(prev => {
      const difficulties = prev.difficulty || [];
      const newDifficulties = difficulties.includes(difficulty)
        ? difficulties.filter(d => d !== difficulty)
        : [...difficulties, difficulty];
      
      return {
        ...prev,
        difficulty: newDifficulties.length > 0 ? newDifficulties : undefined,
      };
    });
  }, []);

  const addIngredient = useCallback(() => {
    if (ingredientInput.trim()) {
      setLocalFilters(prev => {
        const ingredients = prev.ingredients || [];
        const newIngredients = [...ingredients, ingredientInput.trim()];
        return {
          ...prev,
          ingredients: newIngredients,
        };
      });
      setIngredientInput('');
    }
  }, [ingredientInput]);

  const removeIngredient = useCallback((ingredient: string) => {
    setLocalFilters(prev => {
      const ingredients = prev.ingredients || [];
      const newIngredients = ingredients.filter(i => i !== ingredient);
      return {
        ...prev,
        ingredients: newIngredients.length > 0 ? newIngredients : undefined,
      };
    });
  }, []);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return difficulty;
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.categories?.length) count++;
    if (localFilters.tags?.length) count++;
    if (localFilters.difficulty?.length) count++;
    if (localFilters.maxPrepTime) count++;
    if (localFilters.maxCookTime) count++;
    if (localFilters.ingredients?.length) count++;
    if (localFilters.minRating) count++;
    if (localFilters.isPublic !== undefined) count++;
    return count;
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            Filtros de Busca
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            {getActiveFiltersCount()} filtro{getActiveFiltersCount() !== 1 ? 's' : ''} ativo{getActiveFiltersCount() !== 1 ? 's' : ''}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Categorias */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Categorias
              </Text>
              <View style={styles.chipContainer}>
                {categories.map(category => (
                  <Chip
                    key={category}
                    mode={localFilters.categories?.includes(category) ? 'flat' : 'outlined'}
                    selected={localFilters.categories?.includes(category)}
                    onPress={() => toggleCategory(category)}
                    style={styles.chip}>
                    {category}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Tags
              </Text>
              <View style={styles.chipContainer}>
                {tags.slice(0, 12).map(tag => (
                  <Chip
                    key={tag}
                    mode={localFilters.tags?.includes(tag) ? 'flat' : 'outlined'}
                    selected={localFilters.tags?.includes(tag)}
                    onPress={() => toggleTag(tag)}
                    style={styles.chip}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Dificuldade */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Dificuldade
            </Text>
            <View style={styles.chipContainer}>
              {(['easy', 'medium', 'hard'] as const).map(difficulty => (
                <Chip
                  key={difficulty}
                  mode={localFilters.difficulty?.includes(difficulty) ? 'flat' : 'outlined'}
                  selected={localFilters.difficulty?.includes(difficulty)}
                  onPress={() => toggleDifficulty(difficulty)}
                  style={styles.chip}>
                  {getDifficultyLabel(difficulty)}
                </Chip>
              ))}
            </View>
          </View>

          {/* Tempo de Preparo */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tempo de Preparo (máximo)
            </Text>
            <View style={styles.sliderContainer}>
              <Text variant="bodySmall">
                {localFilters.maxPrepTime ? `${localFilters.maxPrepTime} min` : 'Sem limite'}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={180}
                step={15}
                value={localFilters.maxPrepTime || 0}
                onValueChange={(value: number) => 
                  setLocalFilters(prev => ({
                    ...prev,
                    maxPrepTime: value > 0 ? value : undefined,
                  }))
                }
              />
            </View>
          </View>

          {/* Tempo de Cozimento */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tempo de Cozimento (máximo)
            </Text>
            <View style={styles.sliderContainer}>
              <Text variant="bodySmall">
                {localFilters.maxCookTime ? `${localFilters.maxCookTime} min` : 'Sem limite'}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={240}
                step={15}
                value={localFilters.maxCookTime || 0}
                onValueChange={(value: number) => 
                  setLocalFilters(prev => ({
                    ...prev,
                    maxCookTime: value > 0 ? value : undefined,
                  }))
                }
              />
            </View>
          </View>

          {/* Ingredientes */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ingredientes Disponíveis
            </Text>
            <View style={styles.ingredientInput}>
              <TextInput
                mode="outlined"
                placeholder="Digite um ingrediente..."
                value={ingredientInput}
                onChangeText={setIngredientInput}
                onSubmitEditing={addIngredient}
                right={
                  <TextInput.Icon
                    icon="plus"
                    onPress={addIngredient}
                    disabled={!ingredientInput.trim()}
                  />
                }
                style={styles.textInput}
              />
            </View>
            {localFilters.ingredients && localFilters.ingredients.length > 0 && (
              <View style={styles.chipContainer}>
                {localFilters.ingredients.map((ingredient, index) => (
                  <Chip
                    key={index}
                    mode="flat"
                    onClose={() => removeIngredient(ingredient)}
                    style={styles.chip}>
                    {ingredient}
                  </Chip>
                ))}
              </View>
            )}
          </View>

          {/* Avaliação Mínima */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Avaliação Mínima
            </Text>
            <View style={styles.sliderContainer}>
              <Text variant="bodySmall">
                {localFilters.minRating ? `${localFilters.minRating.toFixed(1)} estrelas` : 'Qualquer avaliação'}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={5}
                step={0.5}
                value={localFilters.minRating || 0}
                onValueChange={(value: number) => 
                  setLocalFilters(prev => ({
                    ...prev,
                    minRating: value > 0 ? value : undefined,
                  }))
                }
              />
            </View>
          </View>

          {/* Visibilidade */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Visibilidade
            </Text>
            <View style={styles.switchContainer}>
              <Text variant="bodyMedium">Apenas receitas públicas</Text>
              <Switch
                value={localFilters.isPublic === true}
                onValueChange={(value) => 
                  setLocalFilters(prev => ({
                    ...prev,
                    isPublic: value ? true : undefined,
                  }))
                }
                color={theme.colors.primary}
              />
            </View>
          </View>
        </ScrollView>

        <Divider style={styles.divider} />

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleClear}
            style={styles.button}>
            Limpar
          </Button>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.button}>
            Aplicar Filtros
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: theme.colors.surface,
    margin: 20,
    borderRadius: theme.roundness,
    maxHeight: '90%',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  slider: {
    height: 40,
    marginTop: 8,
  },
  ingredientInput: {
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: theme.colors.background,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  divider: {
    marginVertical: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default FilterModal;