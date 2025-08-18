import React, {useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, ListRenderItem} from 'react-native';
import {
  Text,
  TextInput,
  IconButton,
  Card,
  Menu,
  Chip,
  Button,
} from 'react-native-paper';
import {Ingredient} from '@/types';
import {theme} from '@/utils/theme';

interface IngredientInputProps {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
  style?: any;
}

const COMMON_UNITS = [
  'g', 'kg', 'ml', 'l', 'xícara', 'colher (sopa)', 'colher (chá)',
  'unidade', 'fatia', 'dente', 'pitada', 'a gosto', 'maço', 'lata',
  'pacote', 'envelope', 'copo', 'pote', 'frasco', 'garrafa'
];

const INGREDIENT_CATEGORIES = [
  {value: 'protein', label: 'Proteína'},
  {value: 'vegetable', label: 'Vegetal'},
  {value: 'grain', label: 'Grão/Cereal'},
  {value: 'dairy', label: 'Laticínio'},
  {value: 'spice', label: 'Tempero'},
  {value: 'other', label: 'Outro'},
];

const IngredientInput: React.FC<IngredientInputProps> = ({
  ingredients,
  onIngredientsChange,
  style,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: 'other' as Ingredient['category'],
    optional: false,
  });
  const [unitMenuVisible, setUnitMenuVisible] = useState(false);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  const addIngredient = useCallback(() => {
    if (!newIngredient.name.trim()) return;

    const ingredient: Ingredient = {
      id: Date.now().toString(),
      name: newIngredient.name.trim(),
      quantity: parseFloat(newIngredient.quantity) || 0,
      unit: newIngredient.unit || 'unidade',
      category: newIngredient.category,
      optional: newIngredient.optional,
    };

    if (editingIndex !== null) {
      // Editando ingrediente existente
      const updatedIngredients = [...ingredients];
      updatedIngredients[editingIndex] = ingredient;
      onIngredientsChange(updatedIngredients);
      setEditingIndex(null);
    } else {
      // Adicionando novo ingrediente
      onIngredientsChange([...ingredients, ingredient]);
    }

    // Resetar formulário
    setNewIngredient({
      name: '',
      quantity: '',
      unit: '',
      category: 'other',
      optional: false,
    });
  }, [newIngredient, ingredients, onIngredientsChange, editingIndex]);

  const editIngredient = useCallback((index: number) => {
    const ingredient = ingredients[index];
    setNewIngredient({
      name: ingredient.name,
      quantity: ingredient.quantity.toString(),
      unit: ingredient.unit,
      category: ingredient.category,
      optional: ingredient.optional || false,
    });
    setEditingIndex(index);
  }, [ingredients]);

  const removeIngredient = useCallback((index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    onIngredientsChange(updatedIngredients);
  }, [ingredients, onIngredientsChange]);

  const moveIngredient = useCallback((fromIndex: number, toIndex: number) => {
    const updatedIngredients = [...ingredients];
    const [movedItem] = updatedIngredients.splice(fromIndex, 1);
    updatedIngredients.splice(toIndex, 0, movedItem);
    onIngredientsChange(updatedIngredients);
  }, [ingredients, onIngredientsChange]);

  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setNewIngredient({
      name: '',
      quantity: '',
      unit: '',
      category: 'other',
      optional: false,
    });
  }, []);

  const renderIngredient: ListRenderItem<Ingredient> = useCallback(
    ({item, index}) => (
      <Card style={styles.ingredientCard}>
        <Card.Content style={styles.ingredientContent}>
          <View style={styles.ingredientInfo}>
            <Text variant="bodyMedium" style={styles.ingredientName}>
              {item.quantity > 0 && `${item.quantity} ${item.unit} de `}
              {item.name}
              {item.optional && (
                <Text style={styles.optionalText}> (opcional)</Text>
              )}
            </Text>
            <Chip
              mode="outlined"
              compact
              style={styles.categoryChip}>
              {INGREDIENT_CATEGORIES.find(c => c.value === item.category)?.label}
            </Chip>
          </View>
          <View style={styles.ingredientActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => editIngredient(index)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => removeIngredient(index)}
            />
            {index > 0 && (
              <IconButton
                icon="arrow-up"
                size={20}
                onPress={() => moveIngredient(index, index - 1)}
              />
            )}
            {index < ingredients.length - 1 && (
              <IconButton
                icon="arrow-down"
                size={20}
                onPress={() => moveIngredient(index, index + 1)}
              />
            )}
          </View>
        </Card.Content>
      </Card>
    ),
    [ingredients.length, editIngredient, removeIngredient, moveIngredient],
  );

  return (
    <View style={[styles.container, style]}>
      <Text variant="titleMedium" style={styles.title}>
        Ingredientes
      </Text>

      {/* Formulário de ingrediente */}
      <Card style={styles.formCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.formTitle}>
            {editingIndex !== null ? 'Editar Ingrediente' : 'Adicionar Ingrediente'}
          </Text>

          {/* Nome do ingrediente */}
          <TextInput
            mode="outlined"
            label="Nome do ingrediente"
            value={newIngredient.name}
            onChangeText={(text) => setNewIngredient(prev => ({...prev, name: text}))}
            placeholder="Ex: Farinha de trigo"
            style={styles.input}
          />

          {/* Quantidade e unidade */}
          <View style={styles.quantityRow}>
            <TextInput
              mode="outlined"
              label="Quantidade"
              value={newIngredient.quantity}
              onChangeText={(text) => setNewIngredient(prev => ({...prev, quantity: text}))}
              placeholder="Ex: 2"
              keyboardType="numeric"
              style={[styles.input, styles.quantityInput]}
            />

            <Menu
              visible={unitMenuVisible}
              onDismiss={() => setUnitMenuVisible(false)}
              anchor={
                <TextInput
                  mode="outlined"
                  label="Unidade"
                  value={newIngredient.unit}
                  onChangeText={(text) => setNewIngredient(prev => ({...prev, unit: text}))}
                  placeholder="Ex: xícara"
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      onPress={() => setUnitMenuVisible(true)}
                    />
                  }
                  style={[styles.input, styles.unitInput]}
                />
              }>
              {COMMON_UNITS.map(unit => (
                <Menu.Item
                  key={unit}
                  onPress={() => {
                    setNewIngredient(prev => ({...prev, unit}));
                    setUnitMenuVisible(false);
                  }}
                  title={unit}
                />
              ))}
            </Menu>
          </View>

          {/* Categoria */}
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={
              <TextInput
                mode="outlined"
                label="Categoria"
                value={INGREDIENT_CATEGORIES.find(c => c.value === newIngredient.category)?.label}
                editable={false}
                right={
                  <TextInput.Icon
                    icon="chevron-down"
                    onPress={() => setCategoryMenuVisible(true)}
                  />
                }
                style={styles.input}
              />
            }>
            {INGREDIENT_CATEGORIES.map(category => (
              <Menu.Item
                key={category.value}
                onPress={() => {
                  setNewIngredient(prev => ({...prev, category: category.value as Ingredient['category']}));
                  setCategoryMenuVisible(false);
                }}
                title={category.label}
              />
            ))}
          </Menu>

          {/* Opcional */}
          <View style={styles.optionalRow}>
            <Text variant="bodyMedium">Ingrediente opcional</Text>
            <IconButton
              icon={newIngredient.optional ? 'checkbox-marked' : 'checkbox-blank-outline'}
              onPress={() => setNewIngredient(prev => ({...prev, optional: !prev.optional}))}
            />
          </View>

          {/* Botões de ação */}
          <View style={styles.formActions}>
            {editingIndex !== null && (
              <Button
                mode="outlined"
                onPress={cancelEdit}
                style={styles.actionButton}>
                Cancelar
              </Button>
            )}
            <Button
              mode="contained"
              onPress={addIngredient}
              disabled={!newIngredient.name.trim()}
              style={styles.actionButton}>
              {editingIndex !== null ? 'Salvar' : 'Adicionar'}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Lista de ingredientes */}
      {ingredients.length > 0 && (
        <View style={styles.ingredientsList}>
          <Text variant="titleSmall" style={styles.listTitle}>
            Ingredientes Adicionados ({ingredients.length})
          </Text>
          <FlatList
            data={ingredients}
            renderItem={renderIngredient}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  formCard: {
    marginBottom: 16,
    elevation: 2,
  },
  formTitle: {
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: theme.colors.background,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
  },
  unitInput: {
    flex: 2,
  },
  optionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    minWidth: 100,
  },
  ingredientsList: {
    marginTop: 8,
  },
  listTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  ingredientCard: {
    marginBottom: 8,
    elevation: 1,
  },
  ingredientContent: {
    paddingVertical: 12,
  },
  ingredientInfo: {
    flex: 1,
    marginBottom: 8,
  },
  ingredientName: {
    fontWeight: '500',
    marginBottom: 4,
  },
  optionalText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  ingredientActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default IngredientInput;