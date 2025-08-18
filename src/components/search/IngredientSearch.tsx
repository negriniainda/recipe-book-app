import React, {useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem} from 'react-native';
import {
  Text,
  Card,
  Chip,
  TextInput,
  Button,
  Divider,
} from 'react-native-paper';
import {theme} from '@/utils/theme';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  commonNames: string[];
}

interface IngredientSearchProps {
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  onSearch: (ingredients: string[]) => void;
  availableIngredients?: Ingredient[];
  style?: any;
}

const IngredientSearch: React.FC<IngredientSearchProps> = ({
  selectedIngredients,
  onIngredientsChange,
  onSearch,
  availableIngredients = [],
  style,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Ingredientes comuns para sugestão
  const commonIngredients = [
    'Ovos', 'Leite', 'Farinha de trigo', 'Açúcar', 'Sal', 'Óleo',
    'Cebola', 'Alho', 'Tomate', 'Batata', 'Arroz', 'Feijão',
    'Frango', 'Carne bovina', 'Queijo', 'Manteiga', 'Azeite',
    'Pimentão', 'Cenoura', 'Brócolis', 'Alface', 'Limão',
  ];

  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return commonIngredients.slice(0, 8);
    
    const query = searchQuery.toLowerCase();
    const filtered = [
      ...availableIngredients
        .filter(ing => 
          ing.name.toLowerCase().includes(query) ||
          ing.commonNames.some(name => name.toLowerCase().includes(query))
        )
        .map(ing => ing.name),
      ...commonIngredients.filter(ing => 
        ing.toLowerCase().includes(query)
      )
    ];
    
    // Remover duplicatas e ingredientes já selecionados
    return [...new Set(filtered)]
      .filter(ing => !selectedIngredients.includes(ing))
      .slice(0, 8);
  }, [searchQuery, availableIngredients, selectedIngredients]);

  const handleAddIngredient = useCallback((ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      const newIngredients = [...selectedIngredients, ingredient];
      onIngredientsChange(newIngredients);
    }
    setSearchQuery('');
    setShowSuggestions(false);
  }, [selectedIngredients, onIngredientsChange]);

  const handleRemoveIngredient = useCallback((ingredient: string) => {
    const newIngredients = selectedIngredients.filter(ing => ing !== ingredient);
    onIngredientsChange(newIngredients);
  }, [selectedIngredients, onIngredientsChange]);

  const handleSearch = useCallback(() => {
    if (selectedIngredients.length > 0) {
      onSearch(selectedIngredients);
    }
  }, [selectedIngredients, onSearch]);

  const handleInputSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      handleAddIngredient(searchQuery.trim());
    }
  }, [searchQuery, handleAddIngredient]);

  const renderSuggestion: ListRenderItem<string> = useCallback(
    ({item}) => (
      <Chip
        mode="outlined"
        onPress={() => handleAddIngredient(item)}
        style={styles.suggestionChip}>
        {item}
      </Chip>
    ),
    [handleAddIngredient],
  );

  return (
    <View style={[styles.container, style]}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Buscar por Ingredientes Disponíveis
          </Text>
          <Text variant="bodySmall" style={styles.subtitle}>
            Adicione os ingredientes que você tem em casa
          </Text>

          {/* Input de busca */}
          <TextInput
            mode="outlined"
            placeholder="Digite um ingrediente..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              const timer = setTimeout(() => setShowSuggestions(false), 200);
              return () => clearTimeout(timer);
            }}
            onSubmitEditing={handleInputSubmit}
            right={
              <TextInput.Icon
                icon="plus"
                onPress={handleInputSubmit}
                disabled={!searchQuery.trim()}
              />
            }
            style={styles.input}
          />

          {/* Sugestões */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <View style={styles.suggestions}>
              <Text variant="bodySmall" style={styles.suggestionsTitle}>
                Sugestões:
              </Text>
              <FlatList
                data={filteredSuggestions}
                renderItem={renderSuggestion}
                keyExtractor={item => item}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsList}
              />
            </View>
          )}

          {/* Ingredientes selecionados */}
          {selectedIngredients.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.selectedSection}>
                <Text variant="titleSmall" style={styles.selectedTitle}>
                  Ingredientes Selecionados ({selectedIngredients.length})
                </Text>
                <View style={styles.selectedIngredients}>
                  {selectedIngredients.map((ingredient, index) => (
                    <Chip
                      key={index}
                      mode="flat"
                      onClose={() => handleRemoveIngredient(ingredient)}
                      style={styles.selectedChip}>
                      {ingredient}
                    </Chip>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Botão de busca */}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleSearch}
              disabled={selectedIngredients.length === 0}
              icon="magnify"
              style={styles.searchButton}>
              Buscar Receitas ({selectedIngredients.length} ingrediente{selectedIngredients.length !== 1 ? 's' : ''})
            </Button>
            {selectedIngredients.length > 0 && (
              <Button
                mode="outlined"
                onPress={() => onIngredientsChange([])}
                icon="close"
                style={styles.clearButton}>
                Limpar
              </Button>
            )}
          </View>

          {/* Dicas */}
          <View style={styles.tips}>
            <Text variant="bodySmall" style={styles.tipsTitle}>
              💡 Dicas:
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Adicione ingredientes básicos como ovos, leite, farinha
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Inclua temperos e condimentos que você tem
            </Text>
            <Text variant="bodySmall" style={styles.tipText}>
              • Quanto mais ingredientes, mais opções de receitas
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: theme.colors.background,
  },
  suggestions: {
    marginBottom: 12,
  },
  suggestionsTitle: {
    opacity: 0.7,
    marginBottom: 8,
  },
  suggestionsList: {
    paddingRight: 16,
  },
  suggestionChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  selectedSection: {
    marginBottom: 16,
  },
  selectedTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  selectedIngredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    marginBottom: 4,
    backgroundColor: theme.colors.primaryContainer || theme.colors.surface,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchButton: {
    flex: 1,
  },
  clearButton: {
    minWidth: 100,
  },
  tips: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.roundness,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  tipsTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: theme.colors.primary,
  },
  tipText: {
    opacity: 0.8,
    marginBottom: 4,
  },
});

export default IngredientSearch;