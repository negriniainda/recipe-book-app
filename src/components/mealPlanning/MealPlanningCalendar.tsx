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
  ProgressBar,
} from 'react-native-paper';
import {useMealPlanning} from '../../hooks/useMealPlanning';
import {MealType, MealPlanCalendarDay} from '../../types/mealPlanning';
import MealPlanDay from './MealPlanDay';
import MealPlanSuggestions from './MealPlanSuggestions';

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

interface MealPlanningCalendarProps {
  userId: string;
  onRecipePress?: (recipeId: string) => void;
  onAddMealPress?: (date: Date, mealType: MealType) => void;
  style?: any;
}

const MEAL_TYPE_LABELS = {
  breakfast: 'Café da Manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
};

const MEAL_TYPE_ICONS = {
  breakfast: 'coffee',
  lunch: 'food',
  dinner: 'food-variant',
  snack: 'cookie',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MealPlanningCalendar: React.FC<MealPlanningCalendarProps> = ({
  userId,
  onRecipePress,
  onAddMealPress,
  style,
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const {
    viewMode,
    selectedDate,
    calendarDays,
    weeklyPlan,
    suggestions,
    loadingMealPlans,
    loadingWeeklyPlan,
    navigateToToday,
    navigatePrevious,
    navigateNext,
    switchViewMode,
    setSelectedDate,
    addMealToDate,
    removeMealFromDate,
    toggleMealCompleted,
    generateWeekPlan,
    getWeekProgress,
    hasPlannedMealsForDate,
  } = useMealPlanning({userId});

  const handleDayPress = useCallback((day: MealPlanCalendarDay) => {
    setSelectedDate(day.date);
    setShowSuggestions(true);
  }, [setSelectedDate]);

  const handleAddMeal = useCallback((date: Date, mealType: MealType) => {
    if (onAddMealPress) {
      onAddMealPress(date, mealType);
    } else {
      setSelectedDate(date);
      setShowSuggestions(true);
    }
  }, [onAddMealPress, setSelectedDate]);

  const handleGenerateWeekPlan = useCallback(() => {
    generateWeekPlan(viewMode.startDate, false);
  }, [generateWeekPlan, viewMode.startDate]);

  const formatDateRange = useCallback(() => {
    if (viewMode.type === 'week') {
      const start = viewMode.startDate;
      const end = viewMode.endDate;
      
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()}-${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
      } else {
        return `${start.getDate()} ${MONTHS[start.getMonth()]} - ${end.getDate()} ${MONTHS[end.getMonth()]} ${start.getFullYear()}`;
      }
    } else {
      return `${MONTHS[viewMode.startDate.getMonth()]} ${viewMode.startDate.getFullYear()}`;
    }
  }, [viewMode]);

  const weekProgress = getWeekProgress();

  const renderCalendarHeader = () => (
    <Surface style={styles.calendarHeader}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="chevron-left"
            size={24}
            onPress={navigatePrevious}
          />
          <View style={styles.dateInfo}>
            <Text variant="titleMedium" style={styles.dateText}>
              {formatDateRange()}
            </Text>
            {viewMode.type === 'week' && weeklyPlan && (
              <Text variant="bodySmall" style={styles.weekInfo}>
                {weeklyPlan.totalRecipes} refeições planejadas
              </Text>
            )}
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={navigateNext}
          />
        </View>
        
        <View style={styles.headerRight}>
          <Button
            mode="outlined"
            onPress={navigateToToday}
            compact>
            Hoje
          </Button>
        </View>
      </View>

      <View style={styles.headerBottom}>
        <View style={styles.viewModeToggle}>
          <Button
            mode={viewMode.type === 'week' ? 'contained' : 'outlined'}
            onPress={() => switchViewMode('week')}
            compact
            style={styles.viewModeButton}>
            Semana
          </Button>
          <Button
            mode={viewMode.type === 'month' ? 'contained' : 'outlined'}
            onPress={() => switchViewMode('month')}
            compact
            style={styles.viewModeButton}>
            Mês
          </Button>
        </View>

        {viewMode.type === 'week' && (
          <View style={styles.weekActions}>
            <Button
              mode="contained"
              icon="auto-fix"
              onPress={handleGenerateWeekPlan}
              compact
              disabled={loadingWeeklyPlan}>
              Gerar Plano
            </Button>
          </View>
        )}
      </View>

      {viewMode.type === 'week' && weekProgress.total > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text variant="bodySmall" style={styles.progressText}>
              Progresso da semana: {weekProgress.completed}/{weekProgress.total}
            </Text>
            <Text variant="bodySmall" style={styles.progressPercentage}>
              {Math.round(weekProgress.percentage)}%
            </Text>
          </View>
          <ProgressBar
            progress={weekProgress.percentage / 100}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
        </View>
      )}
    </Surface>
  );

  const renderWeekdayHeaders = () => (
    <View style={styles.weekdayHeaders}>
      {WEEKDAYS.map(day => (
        <Text key={day} variant="bodySmall" style={styles.weekdayHeader}>
          {day}
        </Text>
      ))}
    </View>
  );

  const renderCalendarGrid = () => {
    if (viewMode.type === 'week') {
      return (
        <View style={styles.weekGrid}>
          {calendarDays.map((day, index) => (
            <MealPlanDay
              key={`${day.date.toISOString()}-${index}`}
              day={day}
              viewMode="week"
              onPress={handleDayPress}
              onAddMeal={handleAddMeal}
              onRecipePress={onRecipePress}
              onToggleCompleted={toggleMealCompleted}
              onRemoveMeal={removeMealFromDate}
              style={styles.weekDay}
            />
          ))}
        </View>
      );
    } else {
      // Month view - render in rows of 7
      const weeks = [];
      for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
      }

      return (
        <View style={styles.monthGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.monthWeek}>
              {week.map((day, dayIndex) => (
                <MealPlanDay
                  key={`${day.date.toISOString()}-${weekIndex}-${dayIndex}`}
                  day={day}
                  viewMode="month"
                  onPress={handleDayPress}
                  onAddMeal={handleAddMeal}
                  onRecipePress={onRecipePress}
                  onToggleCompleted={toggleMealCompleted}
                  onRemoveMeal={removeMealFromDate}
                  style={styles.monthDay}
                />
              ))}
            </View>
          ))}
        </View>
      );
    }
  };

  const renderQuickStats = () => {
    if (!weeklyPlan) return null;

    return (
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text variant="titleSmall" style={styles.statsTitle}>
            Estatísticas da Semana
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statNumber}>
                {weeklyPlan.totalRecipes}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Refeições
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statNumber}>
                {weeklyPlan.completedMeals}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Concluídas
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text variant="headlineSmall" style={styles.statNumber}>
                {Math.round(weekProgress.percentage)}%
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Progresso
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loadingMealPlans) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ProgressBar indeterminate color={theme.colors.primary} />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Carregando planejamento...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        
        {renderCalendarHeader()}
        {renderWeekdayHeaders()}
        {renderCalendarGrid()}
        {viewMode.type === 'week' && renderQuickStats()}
        
      </ScrollView>

      {showSuggestions && (
        <MealPlanSuggestions
          visible={showSuggestions}
          onDismiss={() => setShowSuggestions(false)}
          selectedDate={selectedDate}
          suggestions={suggestions}
          onAddMeal={addMealToDate}
          userId={userId}
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
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  calendarHeader: {
    padding: 16,
    elevation: 2,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateInfo: {
    marginHorizontal: 8,
  },
  dateText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  weekInfo: {
    opacity: 0.7,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewModeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    minWidth: 80,
  },
  weekActions: {
    flexDirection: 'row',
    gap: 8,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    opacity: 0.7,
  },
  progressPercentage: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  weekdayHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  weekdayHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    opacity: 0.7,
  },
  weekGrid: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  weekDay: {
    flex: 1,
    margin: 4,
  },
  monthGrid: {
    paddingHorizontal: 8,
  },
  monthWeek: {
    flexDirection: 'row',
  },
  monthDay: {
    flex: 1,
    margin: 2,
    aspectRatio: 1,
  },
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  statsTitle: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    opacity: 0.7,
    marginTop: 4,
  },
});

export default MealPlanningCalendar;