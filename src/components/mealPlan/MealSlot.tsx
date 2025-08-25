import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Chip,
  Menu,
  Surface,
} from 'react-native-paper';
import {MealType, MealPlanItem} from '../../types/mealPlan';

// Define theme inline
const theme = {
  colors: {
    primary: '#6200EE',
    secondary: '#03DAC6',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    outline: '#79747E',
    error: '#B00020',
    onSurface: '#1C1B1F',
    surfaceVariant: '#E7E0EC',
  },
  roundness: 8,
};

interface MealSlotProps {
  date: string;
  mealType: MealType;
  mealLabel: string;
  mealIcon: string;
  mealColor: string;
  meals: MealPlanItem[];
  onPress: () => void;
  onRecipePress?: (recipeId: string) => void;
  onRemoveMeal: (mealId: string) => void;
  onUpdateServings: (mealId: string, servings: number) => void;
  isDragTarget?: boolean;
  isDisabled?: boolean;
  style?: any;
}

const MealSlot: React.FC<MealSlotProps> = ({
  date,
  mealType,
  mealLabel,
  mealIcon,
  mealColor,
  meals,
  onPress,
  onRecipePress,
  onRemoveMeal,
  onUpdateServings,
  isDragTarget = false,
  isDisabled = false,
  style,
}) => {
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const handleMealPress = useCallback((meal: MealPlanItem) => {
    if (onRecipePress) {
      onRecipePress(meal.recipeId);
    }
  }, [onRecipePress]);

  const handleRemoveMeal = useCallback((meal: MealPlanItem) => {
    Alert.alert(
      'Remover Refeição',
      'Tem certeza que deseja remover esta refeição do plano?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            onRemoveMeal(meal.id);
            setMenuVisible(null);
          },
        },
      ]
    );
  }, [onRemoveMeal]);

  const handleUpdateServings = useCallback((meal: MealPlanItem, increment: boolean) => {
    const newServings = increment ? meal.servings + 1 : Math.max(1, meal.servings - 1);
    onUpdateServings(meal.id, newServings);
  }, [onUpdateServings]);

  const renderEmptySlot = () => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.emptySlot,
        {borderColor: mealColor},
        isDragTarget && styles.dragTargetSlot,
        isDisabled && styles.disabledSlot,
      ]}>
      <IconButton
        icon={mealIcon}
        size={20}
        iconColor={mealColor}
        style={styles.mealIcon}
      />
      <Text variant="bodySmall" style={[styles.emptySlotText, {color: mealColor}]}>
        {mealLabel}
      </Text>
      {isDragTarget && (
        <Text variant="bodySmall" style={styles.dropHintText}>
          Solte aqui
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderMealItem = (meal: MealPlanItem, index: number) => (
    <Card
      key={meal.id}
      style={[
        styles.mealCard,
        {borderLeftColor: mealColor},
        index > 0 && styles.additionalMealCard,
      ]}>
      <Card.Content style={styles.mealCardContent}>
        <TouchableOpacity
          onPress={() => handleMealPress(meal)}
          style={styles.mealInfo}>
          <Text variant="bodyMedium" style={styles.mealTitle} numberOfLines={2}>
            {/* TODO: Get recipe name from recipe ID */}
            Receita {meal.recipeId.slice(-4)}
          </Text>
          
          {meal.servings > 1 && (
            <Chip
              mode="flat"
              style={styles.servingsChip}
              textStyle={styles.servingsText}>
              {meal.servings}x
            </Chip>
          )}
          
          {meal.notes && (
            <Text variant="bodySmall" style={styles.mealNotes} numberOfLines={1}>
              {meal.notes}
            </Text>
          )}
        </TouchableOpacity>

        <Menu
          visible={menuVisible === meal.id}
          onDismiss={() => setMenuVisible(null)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={16}
              onPress={() => setMenuVisible(meal.id)}
              style={styles.mealMenuButton}
            />
          }>
          <Menu.Item
            onPress={() => {
              handleMealPress(meal);
              setMenuVisible(null);
            }}
            title="Ver receita"
            leadingIcon="eye"
          />
          <Menu.Item
            onPress={() => handleUpdateServings(meal, false)}
            title="Diminuir porções"
            leadingIcon="minus"
            disabled={meal.servings <= 1}
          />
          <Menu.Item
            onPress={() => handleUpdateServings(meal, true)}
            title="Aumentar porções"
            leadingIcon="plus"
          />
          <Menu.Item
            onPress={() => handleRemoveMeal(meal)}
            title="Remover"
            leadingIcon="delete"
            titleStyle={{color: theme.colors.error}}
          />
        </Menu>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Meal type header */}
      <View style={styles.mealHeader}>
        <IconButton
          icon={mealIcon}
          size={16}
          iconColor={mealColor}
          style={styles.headerIcon}
        />
        <Text variant="bodySmall" style={[styles.mealTypeLabel, {color: mealColor}]}>
          {mealLabel}
        </Text>
        {meals.length > 0 && (
          <Chip
            mode="flat"
            style={[styles.mealCountChip, {backgroundColor: mealColor + '20'}]}
            textStyle={{color: mealColor, fontSize: 10}}>
            {meals.length}
          </Chip>
        )}
      </View>

      {/* Meal items or empty slot */}
      <View style={styles.mealContent}>
        {meals.length === 0 ? (
          renderEmptySlot()
        ) : (
          <View style={styles.mealsList}>
            {meals.map((meal, index) => renderMealItem(meal, index))}
            
            {/* Add more button */}
            {!isDisabled && (
              <TouchableOpacity
                onPress={onPress}
                style={[styles.addMoreButton, {borderColor: mealColor}]}>
                <IconButton
                  icon="plus"
                  size={16}
                  iconColor={mealColor}
                />
                <Text variant="bodySmall" style={[styles.addMoreText, {color: mealColor}]}>
                  Adicionar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  headerIcon: {
    margin: 0,
    marginRight: 4,
  },
  mealTypeLabel: {
    fontWeight: '600',
    flex: 1,
    textTransform: 'uppercase',
    fontSize: 11,
  },
  mealCountChip: {
    height: 20,
    minWidth: 20,
  },
  mealContent: {
    minHeight: 60,
  },
  emptySlot: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: theme.roundness,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    backgroundColor: theme.colors.surface,
  },
  dragTargetSlot: {
    borderStyle: 'solid',
    backgroundColor: theme.colors.surfaceVariant,
  },
  disabledSlot: {
    opacity: 0.5,
  },
  mealIcon: {
    margin: 0,
    marginBottom: 4,
  },
  emptySlotText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dropHintText: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },
  mealsList: {
    gap: 4,
  },
  mealCard: {
    elevation: 1,
    borderLeftWidth: 3,
  },
  additionalMealCard: {
    marginTop: 4,
  },
  mealCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  servingsChip: {
    alignSelf: 'flex-start',
    height: 20,
    marginVertical: 2,
  },
  servingsText: {
    fontSize: 10,
  },
  mealNotes: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
  mealMenuButton: {
    margin: 0,
  },
  addMoreButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: theme.roundness,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    backgroundColor: theme.colors.surface,
  },
  addMoreText: {
    fontSize: 11,
    marginLeft: 4,
  },
});

export default MealSlot;