import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Button,
  Chip,
  Surface,
  Menu,
  Divider,
} from 'react-native-paper';
import {useMealPlan, ViewMode} from '../../hooks/useMealPlan';
import {MealType} from '../../types/mealPlan';
import MealSlot from './MealSlot';
import MealSuggestions from './MealSuggestions';

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
  },
  roundness: 8,
};

const {width: screenWidth} = Dimensions.get('window');

interface MealPlanCalendarProps {
  userId: string;
  onRecipePress?: (recipeId: string) => void;
  style?: any;
}

const MEAL_TYPES: {type: MealType; label: string; icon: string; color: string}[] = [
  {type: 'breakfast', label: 'Café', icon: 'coffee', color: '#FF9800'},
  {type: 'lunch', label: 'Almoço', icon: 'food', color: '#4CAF50'},
  {type: 'dinner', label: 'Jantar', icon: 'food-variant', color: '#2196F3'},
  {type: 'snack', label: 'Lanche', icon: 'cookie', color: '#9C27B0'},
];

const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
  userId,
  onRecipePress,
  style,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    viewMode,
    weekView,
    monthView,
    selectedDate,
    draggedRecipe,
    isLoading,
    setViewMode,
    setSelectedDate,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
    getMealsForDate,
    getTotalMealsForDate,
    isDateInPast,
    isDateToday,
    formatDateForDisplay,
    formatPeriodForDisplay,
    addRecipeToMealPlan,
    removeMealPlanItem,
    updateMealPlanItemServings,
    dropRecipeOnMeal,
    generateSmartMealPlan,
  } = useMealPlan({userId});

  const handleDatePress = useCallback((date: string) => {
    setSelectedDate(selectedDate === date ? null : date);
    setShowSuggestions(selectedDate !== date);
  }, [selectedDate, setSelectedDate]);

  const handleMealSlotPress = useCallback((date: string, mealType: MealType) => {
    if (draggedRecipe) {
      dropRecipeOnMeal(date, mealType);
    } else {
      setSelectedDate(date);
      setShowSuggestions(true);
    }
  }, [draggedRecipe, dropRecipeOnMeal, setSelectedDate]);

  const handleGenerateWeekPlan = useCallback(() => {
    if (!weekView) return;
    
    generateSmartMealPlan(weekView.weekStart, weekView.weekEnd);
    setMenuVisible(false);
  }, [weekView, generateSmartMealPlan]);

  const renderHeader = () => (
    <Surface style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.navigationContainer}>
          <IconButton
            icon="chevron-left"
            onPress={goToPreviousPeriod}
            size={24}
          />
          
          <Button
            mode="text"
            onPress={goToToday}
            style={styles.periodButton}>
            <Text variant="titleMedium" style={styles.periodText}>
              {formatPeriodForDisplay()}
            </Text>
          </Button>
          
          <IconButton
            icon="chevron-right"
            onPress={goToNextPeriod}
            size={24}
          />
        </View>

        <View style={styles.headerActions}>
          <Button
            mode={viewMode === 'week' ? 'contained' : 'outlined'}
            onPress={() => setViewMode('week')}
            compact
            style={styles.viewModeButton}>
            Semana
          </Button>
          
          <Button
            mode={viewMode === 'month' ? 'contained' : 'outlined'}
            onPress={() => setViewMode('month')}
            compact
            style={styles.viewModeButton}>
            Mês
          </Button>

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }>
            <Menu.Item
              onPress={handleGenerateWeekPlan}
              title="Gerar plano automático"
              leadingIcon="auto-fix"
            />
            <Menu.Item
              onPress={() => {
                setShowSuggestions(!showSuggestions);
                setMenuVisible(false);
              }}
              title="Mostrar sugestões"
              leadingIcon="lightbulb"
            />
          </Menu>
        </View>
      </View>
    </Surface>
  );

  const renderWeekView = () => {
    if (!weekView) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.weekContainer}
        contentContainerStyle={styles.weekContent}>
        {weekView.days.map(day => (
          <Card
            key={day.date}
            style={[
              styles.dayCard,
              isDateToday(day.date) && styles.todayCard,
              selectedDate === day.date && styles.selectedDayCard,
            ]}>
            <Card.Content style={styles.dayContent}>
              {/* Day header */}
              <View style={styles.dayHeader}>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.dayName,
                    isDateToday(day.date) && styles.todayText,
                  ]}>
                  {new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'short',
                  })}
                </Text>
                <Text
                  variant="titleSmall"
                  style={[
                    styles.dayNumber,
                    isDateToday(day.date) && styles.todayText,
                  ]}>
                  {formatDateForDisplay(day.date).split('/')[0]}
                </Text>
              </View>

              {/* Meal slots */}
              <View style={styles.mealSlotsContainer}>
                {MEAL_TYPES.map(mealType => (
                  <MealSlot
                    key={mealType.type}
                    date={day.date}
                    mealType={mealType.type}
                    mealLabel={mealType.label}
                    mealIcon={mealType.icon}
                    mealColor={mealType.color}
                    meals={day.meals[mealType.type] || []}
                    onPress={() => handleMealSlotPress(day.date, mealType.type)}
                    onRecipePress={onRecipePress}
                    onRemoveMeal={removeMealPlanItem}
                    onUpdateServings={updateMealPlanItemServings}
                    isDragTarget={!!draggedRecipe}
                    isDisabled={isDateInPast(day.date)}
                  />
                ))}
              </View>

              {/* Total meals indicator */}
              {getTotalMealsForDate(day.date) > 0 && (
                <Chip
                  mode="flat"
                  style={styles.totalMealsChip}
                  textStyle={styles.totalMealsText}>
                  {getTotalMealsForDate(day.date)} refeições
                </Chip>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  };

  const renderMonthView = () => {
    if (!monthView) return null;

    return (
      <ScrollView style={styles.monthContainer}>
        {monthView.weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.days.map(day => {
              const totalMeals = getTotalMealsForDate(day.date);
              
              return (
                <Card
                  key={day.date}
                  style={[
                    styles.monthDayCard,
                    isDateToday(day.date) && styles.todayCard,
                    selectedDate === day.date && styles.selectedDayCard,
                  ]}
                  onPress={() => handleDatePress(day.date)}>
                  <Card.Content style={styles.monthDayContent}>
                    <Text
                      variant="bodySmall"
                      style={[
                        styles.monthDayNumber,
                        isDateToday(day.date) && styles.todayText,
                      ]}>
                      {formatDateForDisplay(day.date).split('/')[0]}
                    </Text>
                    
                    {totalMeals > 0 && (
                      <View style={styles.monthMealIndicators}>
                        {MEAL_TYPES.map(mealType => {
                          const mealCount = day.meals[mealType.type]?.length || 0;
                          if (mealCount === 0) return null;
                          
                          return (
                            <View
                              key={mealType.type}
                              style={[
                                styles.monthMealDot,
                                {backgroundColor: mealType.color},
                              ]}
                            />
                          );
                        })}
                      </View>
                    )}
                  </Card.Content>
                </Card>
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <Text>Carregando plano de refeições...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      
      <View style={styles.calendarContainer}>
        {viewMode === 'week' ? renderWeekView() : renderMonthView()}
      </View>

      {showSuggestions && selectedDate && (
        <MealSuggestions
          userId={userId}
          date={selectedDate}
          onSuggestionPress={(recipeId, mealType) => {
            addRecipeToMealPlan(recipeId, selectedDate, mealType);
            setShowSuggestions(false);
          }}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    elevation: 2,
    paddingVertical: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  periodButton: {
    marginHorizontal: 8,
  },
  periodText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewModeButton: {
    minWidth: 70,
  },
  calendarContainer: {
    flex: 1,
  },
  weekContainer: {
    flex: 1,
  },
  weekContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  dayCard: {
    width: screenWidth * 0.85,
    elevation: 2,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  selectedDayCard: {
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.secondaryContainer,
  },
  dayContent: {
    padding: 12,
  },
  dayHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  dayNumber: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  todayText: {
    color: theme.colors.primary,
  },
  mealSlotsContainer: {
    gap: 8,
  },
  totalMealsChip: {
    alignSelf: 'center',
    marginTop: 12,
    backgroundColor: theme.colors.primaryContainer,
  },
  totalMealsText: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  monthContainer: {
    flex: 1,
    padding: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 4,
  },
  monthDayCard: {
    flex: 1,
    height: 80,
    elevation: 1,
  },
  monthDayContent: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthDayNumber: {
    fontWeight: '500',
  },
  monthMealIndicators: {
    flexDirection: 'row',
    gap: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  monthMealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default MealPlanCalendar;