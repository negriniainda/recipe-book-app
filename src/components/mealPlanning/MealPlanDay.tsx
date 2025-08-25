import React, {useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Chip,
  Surface,
} from 'react-native-paper';
import {MealPlanCalendarDay, MealType, MealPlan} from '../../types/mealPlanning';

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
    primaryContainer: '#EADDFF',
    secondaryContainer: '#B2EBF2',
    success: '#4CAF50',
    warning: '#FF9800',
  },
  roundness: 8,
};

interface MealPlanDayProps {
  day: MealPlanCalendarDay;
  viewMode: 'week' | 'month';
  onPress: (day: MealPlanCalendarDay) => void;
  onAddMeal: (date: Date, mealType: MealType) => void;
  onRecipePress?: (recipeId: string) => void;
  onToggleCompleted: (mealPlanId: string, completed: boolean) => void;
  onRemoveMeal: (mealPlanId: string) => void;
  style?: any;
}

const MEAL_TYPE_COLORS = {
  breakfast: '#FFE0B2',
  lunch: '#C8E6C9',
  dinner: '#BBDEFB',
  snack: '#F8BBD9',
};

const MEAL_TYPE_ICONS = {
  breakfast: 'coffee',
  lunch: 'food',
  dinner: 'food-variant',
  snack: 'cookie',
};

const MealPlanDay: React.FC<MealPlanDayProps> = ({
  day,
  viewMode,
  onPress,
  onAddMeal,
  onRecipePress,
  onToggleCompleted,
  onRemoveMeal,
  style,
}) => {
  const handleDayPress = useCallback(() => {
    onPress(day);
  }, [onPress, day]);

  const handleAddMeal = useCallback((mealType: MealType) => {
    onAddMeal(day.date, mealType);
  }, [onAddMeal, day.date]);

  const handleMealPress = useCallback((meal: MealPlan) => {
    if (onRecipePress) {
      onRecipePress(meal.recipeId);
    }
  }, [onRecipePress]);

  const handleToggleCompleted = useCallback((meal: MealPlan) => {
    onToggleCompleted(meal.id, !meal.completed);
  }, [onToggleCompleted]);

  const handleRemoveMeal = useCallback((meal: MealPlan) => {
    onRemoveMeal(meal.id);
  }, [onRemoveMeal]);

  const renderMealSlot = (mealType: MealType, meal?: MealPlan) => {
    if (viewMode === 'month' && !meal) {
      return null; // Don't show empty slots in month view
    }

    return (
      <View key={mealType} style={styles.mealSlot}>
        {meal ? (
          <Pressable
            onPress={() => handleMealPress(meal)}
            style={[
              styles.mealItem,
              {backgroundColor: MEAL_TYPE_COLORS[mealType]},
              meal.completed && styles.completedMeal,
            ]}>
            <View style={styles.mealContent}>
              <View style={styles.mealHeader}>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.mealText,
                    meal.completed && styles.completedText,
                  ]}
                  numberOfLines={viewMode === 'month' ? 1 : 2}>
                  {meal.recipeId} {/* TODO: Get recipe name */}
                </Text>
                
                {viewMode === 'week' && (
                  <View style={styles.mealActions}>
                    <IconButton
                      icon={meal.completed ? 'check-circle' : 'circle-outline'}
                      size={16}
                      iconColor={meal.completed ? theme.colors.success : theme.colors.outline}
                      onPress={() => handleToggleCompleted(meal)}
                    />
                    <IconButton
                      icon="close"
                      size={14}
                      iconColor={theme.colors.error}
                      onPress={() => handleRemoveMeal(meal)}
                    />
                  </View>
                )}
              </View>
              
              {viewMode === 'week' && meal.notes && (
                <Text variant="bodySmall" style={styles.mealNotes} numberOfLines={1}>
                  {meal.notes}
                </Text>
              )}
            </View>
          </Pressable>
        ) : (
          <TouchableOpacity
            onPress={() => handleAddMeal(mealType)}
            style={[
              styles.emptyMealSlot,
              {borderColor: MEAL_TYPE_COLORS[mealType]},
            ]}>
            <IconButton
              icon="plus"
              size={16}
              iconColor={theme.colors.outline}
            />
            {viewMode === 'week' && (
              <Text variant="bodySmall" style={styles.addMealText}>
                {getMealTypeLabel(mealType)}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSnackSlots = () => {
    const snacks = day.meals.snack || [];
    
    if (viewMode === 'month') {
      return snacks.length > 0 ? (
        <View style={styles.mealSlot}>
          <View style={[styles.mealItem, {backgroundColor: MEAL_TYPE_COLORS.snack}]}>
            <Text variant="bodySmall" style={styles.mealText} numberOfLines={1}>
              {snacks.length} lanche{snacks.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      ) : null;
    }

    // Week view - show individual snacks
    const maxSnacks = 2;
    const slotsToShow = Math.max(maxSnacks, snacks.length);
    
    return Array.from({length: slotsToShow}, (_, index) => {
      const snack = snacks[index];
      return renderMealSlot('snack', snack);
    });
  };

  const getDayStyle = () => {
    const baseStyle = [styles.dayContainer];
    
    if (day.isToday) {
      baseStyle.push(styles.todayContainer);
    }
    
    if (!day.isCurrentMonth && viewMode === 'month') {
      baseStyle.push(styles.otherMonthContainer);
    }
    
    if (day.hasPlannedMeals) {
      baseStyle.push(styles.hasPlannedMealsContainer);
    }
    
    return baseStyle;
  };

  const completedMeals = Object.values(day.meals).flat().filter(meal => meal?.completed).length;
  const totalMeals = day.totalMeals;
  const completionPercentage = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0;

  return (
    <Card style={[getDayStyle(), style]} onPress={handleDayPress}>
      <Card.Content style={styles.dayContent}>
        {/* Day header */}
        <View style={styles.dayHeader}>
          <Text
            variant={viewMode === 'week' ? 'titleMedium' : 'bodyMedium'}
            style={[
              styles.dayNumber,
              day.isToday && styles.todayText,
              !day.isCurrentMonth && viewMode === 'month' && styles.otherMonthText,
            ]}>
            {day.date.getDate()}
          </Text>
          
          {day.hasPlannedMeals && (
            <View style={styles.dayIndicators}>
              {totalMeals > 0 && (
                <Chip
                  mode="flat"
                  compact
                  style={[
                    styles.mealCountChip,
                    {backgroundColor: completionPercentage === 100 ? theme.colors.success + '20' : theme.colors.warning + '20'}
                  ]}
                  textStyle={{
                    fontSize: 10,
                    color: completionPercentage === 100 ? theme.colors.success : theme.colors.warning
                  }}>
                  {completedMeals}/{totalMeals}
                </Chip>
              )}
            </View>
          )}
        </View>

        {/* Meal slots */}
        <View style={styles.mealsContainer}>
          {renderMealSlot('breakfast', day.meals.breakfast)}
          {renderMealSlot('lunch', day.meals.lunch)}
          {renderMealSlot('dinner', day.meals.dinner)}
          {renderSnackSlots()}
        </View>

        {/* Progress indicator for week view */}
        {viewMode === 'week' && totalMeals > 0 && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${completionPercentage}%`,
                  backgroundColor: completionPercentage === 100 ? theme.colors.success : theme.colors.warning,
                },
              ]}
            />
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

function getMealTypeLabel(mealType: MealType): string {
  const labels = {
    breakfast: 'Café',
    lunch: 'Almoço',
    dinner: 'Jantar',
    snack: 'Lanche',
  };
  return labels[mealType];
}

const styles = StyleSheet.create({
  dayContainer: {
    minHeight: 120,
    elevation: 1,
  },
  todayContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    elevation: 3,
  },
  otherMonthContainer: {
    opacity: 0.5,
  },
  hasPlannedMealsContainer: {
    backgroundColor: theme.colors.primaryContainer,
  },
  dayContent: {
    padding: 8,
    flex: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayNumber: {
    fontWeight: 'bold',
  },
  todayText: {
    color: theme.colors.primary,
  },
  otherMonthText: {
    opacity: 0.5,
  },
  dayIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  mealCountChip: {
    height: 20,
  },
  mealsContainer: {
    flex: 1,
    gap: 4,
  },
  mealSlot: {
    minHeight: 24,
  },
  mealItem: {
    borderRadius: theme.roundness,
    padding: 6,
    minHeight: 24,
  },
  completedMeal: {
    opacity: 0.7,
  },
  mealContent: {
    flex: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  mealActions: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  mealNotes: {
    fontSize: 10,
    opacity: 0.7,
    marginTop: 2,
  },
  emptyMealSlot: {
    borderRadius: theme.roundness,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 4,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
  },
  addMealText: {
    fontSize: 10,
    opacity: 0.7,
    marginLeft: 4,
  },
  progressContainer: {
    height: 3,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default MealPlanDay;