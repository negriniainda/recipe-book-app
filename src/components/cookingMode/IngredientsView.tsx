import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {CookingSession} from '../../types/cookingMode';
import {colors, typography, spacing} from '../../theme';

interface IngredientsViewProps {
  session: CookingSession;
  showChecklist: boolean;
  onToggleIngredient: (ingredientId: string) => void;
}

export const IngredientsView: React.FC<IngredientsViewProps> = ({
  session,
  showChecklist,
  onToggleIngredient,
}) => {
  // Mock ingredients data - in real app this would come from the recipe
  const ingredients = [
    {id: '1', name: '2 xícaras de farinha de trigo', checked: true},
    {id: '2', name: '1 xícara de açúcar', checked: false},
    {id: '3', name: '3 ovos', checked: false},
    {id: '4', name: '1/2 xícara de óleo', checked: true},
    {id: '5', name: '1 colher de sopa de fermento', checked: false},
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ingredientes</Text>
        <Text style={styles.subtitle}>
          {ingredients.filter(i => i.checked).length} de {ingredients.length} preparados
        </Text>
      </View>

      <View style={styles.ingredientsList}>
        {ingredients.map(ingredient => (
          <TouchableOpacity
            key={ingredient.id}
            style={styles.ingredientItem}
            onPress={() => onToggleIngredient(ingredient.id)}
          >
            <Ionicons
              name={ingredient.checked ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={ingredient.checked ? colors.success[500] : colors.gray[400]}
            />
            <Text
              style={[
                styles.ingredientText,
                ingredient.checked && styles.checkedText,
              ]}
            >
              {ingredient.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...typography.title,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[600],
  },
  ingredientsList: {
    padding: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    gap: spacing.md,
  },
  ingredientText: {
    ...typography.body,
    color: colors.gray[900],
    flex: 1,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: colors.gray[500],
  },
});