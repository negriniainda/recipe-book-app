import React, {useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem} from 'react-native';
import {
  Text,
  TextInput,
  Chip,
  Card,
  Button,
  Menu,
  IconButton,
} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface CategoryTagSelectorProps {
  categories: string[];
  tags: string[];
  onCategoriesChange: (categories: string[]) => void;
  onTagsChange: (tags: string[]) => void;
  availableCategories?: string[];
  popularTags?: string[];
  style?: any;
}

const DEFAULT_CATEGORIES = [
  'Café da Manhã',
  'Almoço',
  'Jantar',
  'Lanche',
  'Sobremesa',
  'Bebida',
  'Aperitivo',
  'Prato Principal',
  'Acompanhamento',
  'Salada',
  'Sopa',
  'Massa',
  'Pizza',
  'Sanduíche',
  'Doce',
  'Salgado',
];

const POPULAR_TAGS = [
  'fácil',
  'rápido',
  'saudável',
  'vegetariano',
  'vegano',
  'sem glúten',
  'sem lactose',
  'low carb',
  'fitness',
  'caseiro',
  'tradicional',
  'gourmet',
  'econômico',
  'festa',
  'romântico',
  'infantil',
  'comfort food',
  'light',
  'proteico',
  'detox',
];

const CategoryTagSelector: React.FC<CategoryTagSelectorProps> = ({
  categories,
  tags,
  onCategoriesChange,
  onTagsChange,
  availableCategories = DEFAULT_CATEGORIES,
  popularTags = POPULAR_TAGS,
  style,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const addCategory = useCallback((category: string) => {
    if (category.trim() && !categories.includes(category.trim())) {
      onCategoriesChange([...categories, category.trim()]);
    }
    setNewCategory('');
    setCategoryMenuVisible(false);
  }, [categories, onCategoriesChange]);

  const removeCategory = useCallback((category: string) => {
    onCategoriesChange(categories.filter(c => c !== category));
  }, [categories, onCategoriesChange]);

  const addTag = useCallback((tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      onTagsChange([...tags, tag.trim()]);
    }
    setNewTag('');
  }, [tags, onTagsChange]);

  const removeTag = useCallback((tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  }, [tags, onTagsChange]);

  const toggleCategory = useCallback((category: string) => {
    if (categories.includes(category)) {
      removeCategory(category);
    } else {
      addCategory(category);
    }
  }, [categories, addCategory, removeCategory]);

  const toggleTag = useCallback((tag: string) => {
    if (tags.includes(tag)) {
      removeTag(tag);
    } else {
      addTag(tag);
    }
  }, [tags, addTag, removeTag]);

  const displayedCategories = showAllCategories 
    ? availableCategories 
    : availableCategories.slice(0, 8);

  const displayedTags = showAllTags 
    ? popularTags 
    : popularTags.slice(0, 12);

  return (
    <View style={[styles.container, style]}>
      {/* Categorias */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Categorias
        </Text>
        <Text variant="bodySmall" style={styles.sectionSubtitle}>
          Selecione as categorias que melhor descrevem sua receita
        </Text>

        {/* Categorias selecionadas */}
        {categories.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text variant="titleSmall" style={styles.selectedTitle}>
              Selecionadas:
            </Text>
            <View style={styles.chipContainer}>
              {categories.map(category => (
                <Chip
                  key={category}
                  mode="flat"
                  onClose={() => removeCategory(category)}
                  style={styles.selectedChip}>
                  {category}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* Categorias disponíveis */}
        <View style={styles.availableContainer}>
          <Text variant="titleSmall" style={styles.availableTitle}>
            Disponíveis:
          </Text>
          <View style={styles.chipContainer}>
            {displayedCategories
              .filter(category => !categories.includes(category))
              .map(category => (
                <Chip
                  key={category}
                  mode="outlined"
                  onPress={() => toggleCategory(category)}
                  style={styles.availableChip}>
                  {category}
                </Chip>
              ))}
          </View>
          
          {availableCategories.length > 8 && (
            <Button
              mode="text"
              onPress={() => setShowAllCategories(!showAllCategories)}
              compact>
              {showAllCategories ? 'Ver menos' : `Ver todas (${availableCategories.length})`}
            </Button>
          )}
        </View>

        {/* Adicionar categoria personalizada */}
        <Card style={styles.customCard}>
          <Card.Content style={styles.customContent}>
            <Text variant="titleSmall" style={styles.customTitle}>
              Categoria Personalizada:
            </Text>
            <View style={styles.customInput}>
              <TextInput
                mode="outlined"
                placeholder="Digite uma nova categoria..."
                value={newCategory}
                onChangeText={setNewCategory}
                onSubmitEditing={() => addCategory(newCategory)}
                style={styles.textInput}
              />
              <Button
                mode="contained"
                onPress={() => addCategory(newCategory)}
                disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
                compact>
                Adicionar
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Tags */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Tags
        </Text>
        <Text variant="bodySmall" style={styles.sectionSubtitle}>
          Adicione tags para facilitar a busca da sua receita
        </Text>

        {/* Tags selecionadas */}
        {tags.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text variant="titleSmall" style={styles.selectedTitle}>
              Selecionadas:
            </Text>
            <View style={styles.chipContainer}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  mode="flat"
                  onClose={() => removeTag(tag)}
                  style={styles.selectedChip}>
                  {tag}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* Tags populares */}
        <View style={styles.availableContainer}>
          <Text variant="titleSmall" style={styles.availableTitle}>
            Tags Populares:
          </Text>
          <View style={styles.chipContainer}>
            {displayedTags
              .filter(tag => !tags.includes(tag))
              .map(tag => (
                <Chip
                  key={tag}
                  mode="outlined"
                  onPress={() => toggleTag(tag)}
                  style={styles.availableChip}>
                  {tag}
                </Chip>
              ))}
          </View>
          
          {popularTags.length > 12 && (
            <Button
              mode="text"
              onPress={() => setShowAllTags(!showAllTags)}
              compact>
              {showAllTags ? 'Ver menos' : `Ver todas (${popularTags.length})`}
            </Button>
          )}
        </View>

        {/* Adicionar tag personalizada */}
        <Card style={styles.customCard}>
          <Card.Content style={styles.customContent}>
            <Text variant="titleSmall" style={styles.customTitle}>
              Tag Personalizada:
            </Text>
            <View style={styles.customInput}>
              <TextInput
                mode="outlined"
                placeholder="Digite uma nova tag..."
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={() => addTag(newTag)}
                style={styles.textInput}
              />
              <Button
                mode="contained"
                onPress={() => addTag(newTag)}
                disabled={!newTag.trim() || tags.includes(newTag.trim())}
                compact>
                Adicionar
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.primary,
  },
  sectionSubtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  selectedContainer: {
    marginBottom: 16,
  },
  selectedTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  availableContainer: {
    marginBottom: 16,
  },
  availableTitle: {
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
    marginBottom: 4,
  },
  availableChip: {
    marginBottom: 4,
  },
  customCard: {
    backgroundColor: theme.colors.surface,
    elevation: 1,
  },
  customContent: {
    paddingVertical: 12,
  },
  customTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default CategoryTagSelector;