import {useState, useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {
  useGetMealPlansQuery,
  useGetWeekViewQuery,
  useGetMonthViewQuery,
  useAddMealPlanItemMutation,
  useUpdateMealPlanItemMutation,
  useDeleteMealPlanItemMutation,
  useGetMealSuggestionsQuery,
  useCreateMealPlanMutation,
  useGenerateMealPlanMutation,
} from '../services/mealPlanApi';
import {
  MealType,
  MealPlanItem,
  CalendarDay,
  WeekView,
  MonthView,
  MealSuggestion,
} from '../types/mealPlan';

export type ViewMode = 'week' | 'month';

interface UseMealPlanOptions {
  userId: string;
  initialViewMode?: ViewMode;
  initialDate?: Date;
}

export const useMealPlan = ({
  userId,
  initialViewMode = 'week',
  initialDate = new Date(),
}: UseMealPlanOptions) => {
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [draggedRecipe, setDraggedRecipe] = useState<{
    recipeId: string;
    recipeName: string;
  } | null>(null);

  // Calculate date ranges for API calls
  const {weekStart, monthStart, monthEnd} = useMemo(() => {
    const date = new Date(currentDate);
    
    // Week start (Monday)
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekStart.setDate(weekStart.getDate() - daysToMonday);
    
    // Month start and end
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return {
      weekStart: weekStart.toISOString().split('T')[0],
      monthStart: monthStart.toISOString().split('T')[0],
      monthEnd: monthEnd.toISOString().split('T')[0],
    };
  }, [currentDate]);

  // API queries
  const {data: mealPlans, isLoading: loadingMealPlans} = useGetMealPlansQuery({userId});
  
  const {data: weekView, isLoading: loadingWeek} = useGetWeekViewQuery(
    {userId, weekStart},
    {skip: viewMode !== 'week'}
  );
  
  const {data: monthView, isLoading: loadingMonth} = useGetMonthViewQuery(
    {userId, month: currentDate.getMonth() + 1, year: currentDate.getFullYear()},
    {skip: viewMode !== 'month'}
  );

  const {data: suggestions} = useGetMealSuggestionsQuery(
    {
      userId,
      date: selectedDate || new Date().toISOString().split('T')[0],
      limit: 5,
    },
    {skip: !selectedDate}
  );

  // Mutations
  const [addMealPlanItem] = useAddMealPlanItemMutation();
  const [updateMealPlanItem] = useUpdateMealPlanItemMutation();
  const [deleteMealPlanItem] = useDeleteMealPlanItemMutation();
  const [createMealPlan] = useCreateMealPlanMutation();
  const [generateMealPlan] = useGenerateMealPlanMutation();

  // Get active meal plan
  const activeMealPlan = useMemo(() => {
    return mealPlans?.find(plan => plan.isActive) || mealPlans?.[0];
  }, [mealPlans]);

  // Navigation functions
  const goToPreviousPeriod = useCallback(() => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const goToNextPeriod = useCallback(() => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Meal plan operations
  const addRecipeToMealPlan = useCallback(async (
    recipeId: string,
    date: string,
    mealType: MealType,
    servings: number = 1
  ) => {
    if (!activeMealPlan) {
      Alert.alert('Erro', 'Nenhum plano de refeições ativo encontrado');
      return;
    }

    try {
      await addMealPlanItem({
        mealPlanId: activeMealPlan.id,
        recipeId,
        date,
        mealType,
        servings,
      }).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao adicionar receita ao plano');
    }
  }, [activeMealPlan, addMealPlanItem]);

  const updateMealPlanItemServings = useCallback(async (
    itemId: string,
    servings: number
  ) => {
    try {
      await updateMealPlanItem({
        id: itemId,
        servings,
      }).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar porções');
    }
  }, [updateMealPlanItem]);

  const removeMealPlanItem = useCallback(async (itemId: string) => {
    try {
      await deleteMealPlanItem(itemId).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao remover item do plano');
    }
  }, [deleteMealPlanItem]);

  const moveMealPlanItem = useCallback(async (
    itemId: string,
    newDate: string,
    newMealType: MealType
  ) => {
    try {
      await updateMealPlanItem({
        id: itemId,
        date: newDate,
        mealType: newMealType,
      }).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao mover item do plano');
    }
  }, [updateMealPlanItem]);

  // Drag and drop functions
  const startDragRecipe = useCallback((recipeId: string, recipeName: string) => {
    setDraggedRecipe({recipeId, recipeName});
  }, []);

  const endDragRecipe = useCallback(() => {
    setDraggedRecipe(null);
  }, []);

  const dropRecipeOnMeal = useCallback(async (
    date: string,
    mealType: MealType
  ) => {
    if (!draggedRecipe) return;

    await addRecipeToMealPlan(draggedRecipe.recipeId, date, mealType);
    setDraggedRecipe(null);
  }, [draggedRecipe, addRecipeToMealPlan]);

  // Smart planning
  const generateSmartMealPlan = useCallback(async (
    startDate: string,
    endDate: string
  ) => {
    try {
      await generateMealPlan({
        userId,
        startDate,
        endDate,
      }).unwrap();
      
      Alert.alert(
        'Sucesso',
        'Plano de refeições gerado automaticamente!',
        [{text: 'OK'}]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao gerar plano de refeições');
    }
  }, [userId, generateMealPlan]);

  // Utility functions
  const getMealsForDate = useCallback((date: string): CalendarDay['meals'] => {
    if (viewMode === 'week' && weekView) {
      const day = weekView.days.find(d => d.date === date);
      return day?.meals || {};
    }
    
    if (viewMode === 'month' && monthView) {
      for (const week of monthView.weeks) {
        const day = week.days.find(d => d.date === date);
        if (day) return day.meals;
      }
    }
    
    return {};
  }, [viewMode, weekView, monthView]);

  const getTotalMealsForDate = useCallback((date: string): number => {
    const meals = getMealsForDate(date);
    return Object.values(meals).reduce((total, mealItems) => 
      total + (mealItems?.length || 0), 0
    );
  }, [getMealsForDate]);

  const isDateInPast = useCallback((date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  }, []);

  const isDateToday = useCallback((date: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  }, []);

  // Format date for display
  const formatDateForDisplay = useCallback((date: string): string => {
    const dateObj = new Date(date + 'T00:00:00');
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  }, []);

  const formatPeriodForDisplay = useCallback((): string => {
    if (viewMode === 'week' && weekView) {
      const startDate = new Date(weekView.weekStart + 'T00:00:00');
      const endDate = new Date(weekView.weekEnd + 'T00:00:00');
      
      if (startDate.getMonth() === endDate.getMonth()) {
        return `${startDate.getDate()}-${endDate.getDate()} ${startDate.toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}`;
      } else {
        return `${startDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} - ${endDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'})}`;
      }
    }
    
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
    }
    
    return '';
  }, [viewMode, weekView, currentDate]);

  return {
    // State
    viewMode,
    currentDate,
    selectedDate,
    draggedRecipe,
    
    // Data
    mealPlans,
    activeMealPlan,
    weekView,
    monthView,
    suggestions,
    
    // Loading states
    isLoading: loadingMealPlans || loadingWeek || loadingMonth,
    
    // Actions
    setViewMode,
    setSelectedDate,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
    
    // Meal plan operations
    addRecipeToMealPlan,
    updateMealPlanItemServings,
    removeMealPlanItem,
    moveMealPlanItem,
    
    // Drag and drop
    startDragRecipe,
    endDragRecipe,
    dropRecipeOnMeal,
    
    // Smart planning
    generateSmartMealPlan,
    
    // Utilities
    getMealsForDate,
    getTotalMealsForDate,
    isDateInPast,
    isDateToday,
    formatDateForDisplay,
    formatPeriodForDisplay,
  };
};

export default useMealPlan;