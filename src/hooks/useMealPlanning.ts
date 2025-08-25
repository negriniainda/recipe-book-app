import {useState, useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {
  useGetMealPlansQuery,
  useGetWeeklyMealPlanQuery,
  useCreateMealPlanMutation,
  useUpdateMealPlanMutation,
  useDeleteMealPlanMutation,
  useMoveMealPlanMutation,
  useGetMealPlanSuggestionsQuery,
  useMarkMealCompletedMutation,
  useGenerateWeeklyMealPlanMutation,
  useCopyMealPlanMutation,
} from '../services/mealPlanningApi';
import {
  MealPlan,
  MealType,
  MealPlanCalendarDay,
  DragDropMealData,
  CalendarViewMode,
} from '../types/mealPlanning';

export interface UseMealPlanningOptions {
  userId: string;
  initialViewMode?: 'week' | 'month';
  initialDate?: Date;
}

export const useMealPlanning = ({
  userId,
  initialViewMode = 'week',
  initialDate = new Date(),
}: UseMealPlanningOptions) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>({
    type: initialViewMode,
    startDate: getWeekStart(initialDate),
    endDate: getWeekEnd(initialDate),
  });

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [draggedRecipe, setDraggedRecipe] = useState<DragDropMealData | null>(null);

  // API hooks
  const {
    data: mealPlans = [],
    isLoading: loadingMealPlans,
    refetch: refetchMealPlans,
  } = useGetMealPlansQuery({
    userId,
    startDate: viewMode.startDate.toISOString(),
    endDate: viewMode.endDate.toISOString(),
  });

  const {
    data: weeklyPlan,
    isLoading: loadingWeeklyPlan,
  } = useGetWeeklyMealPlanQuery(
    {
      userId,
      weekStart: viewMode.startDate.toISOString(),
    },
    {skip: viewMode.type !== 'week'}
  );

  const {
    data: suggestions = [],
    isLoading: loadingSuggestions,
  } = useGetMealPlanSuggestionsQuery({
    userId,
    date: selectedDate.toISOString(),
    limit: 5,
  });

  const [createMealPlan] = useCreateMealPlanMutation();
  const [updateMealPlan] = useUpdateMealPlanMutation();
  const [deleteMealPlan] = useDeleteMealPlanMutation();
  const [moveMealPlan] = useMoveMealPlanMutation();
  const [markMealCompleted] = useMarkMealCompletedMutation();
  const [generateWeeklyPlan] = useGenerateWeeklyMealPlanMutation();
  const [copyMealPlan] = useCopyMealPlanMutation();

  // Calendar data processing
  const calendarDays = useMemo(() => {
    return generateCalendarDays(viewMode, mealPlans);
  }, [viewMode, mealPlans]);

  // Navigation functions
  const navigateToToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    setViewMode({
      type: viewMode.type,
      startDate: viewMode.type === 'week' ? getWeekStart(today) : getMonthStart(today),
      endDate: viewMode.type === 'week' ? getWeekEnd(today) : getMonthEnd(today),
    });
  }, [viewMode.type]);

  const navigatePrevious = useCallback(() => {
    const days = viewMode.type === 'week' ? 7 : 30;
    const newStart = new Date(viewMode.startDate);
    newStart.setDate(newStart.getDate() - days);
    
    setViewMode({
      type: viewMode.type,
      startDate: viewMode.type === 'week' ? getWeekStart(newStart) : getMonthStart(newStart),
      endDate: viewMode.type === 'week' ? getWeekEnd(newStart) : getMonthEnd(newStart),
    });
  }, [viewMode]);

  const navigateNext = useCallback(() => {
    const days = viewMode.type === 'week' ? 7 : 30;
    const newStart = new Date(viewMode.startDate);
    newStart.setDate(newStart.getDate() + days);
    
    setViewMode({
      type: viewMode.type,
      startDate: viewMode.type === 'week' ? getWeekStart(newStart) : getMonthStart(newStart),
      endDate: viewMode.type === 'week' ? getWeekEnd(newStart) : getMonthEnd(newStart),
    });
  }, [viewMode]);

  const switchViewMode = useCallback((newType: 'week' | 'month') => {
    setViewMode({
      type: newType,
      startDate: newType === 'week' ? getWeekStart(selectedDate) : getMonthStart(selectedDate),
      endDate: newType === 'week' ? getWeekEnd(selectedDate) : getMonthEnd(selectedDate),
    });
  }, [selectedDate]);

  // Meal plan operations
  const addMealToDate = useCallback(async (
    date: Date,
    mealType: MealType,
    recipeId: string,
    servings: number = 4,
    notes?: string
  ) => {
    try {
      await createMealPlan({
        userId,
        date,
        mealType,
        recipeId,
        servings,
        notes,
        completed: false,
      }).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao adicionar refeição ao planejamento');
    }
  }, [createMealPlan, userId]);

  const removeMealFromDate = useCallback(async (mealPlanId: string) => {
    try {
      await deleteMealPlan(mealPlanId).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao remover refeição do planejamento');
    }
  }, [deleteMealPlan]);

  const moveMealToDate = useCallback(async (
    mealPlanId: string,
    newDate: Date,
    newMealType: MealType
  ) => {
    try {
      await moveMealPlan({
        id: mealPlanId,
        newDate: newDate.toISOString(),
        newMealType,
      }).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao mover refeição');
    }
  }, [moveMealPlan]);

  const toggleMealCompleted = useCallback(async (
    mealPlanId: string,
    completed: boolean,
    notes?: string
  ) => {
    try {
      await markMealCompleted({
        id: mealPlanId,
        completed,
        notes,
      }).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao atualizar status da refeição');
    }
  }, [markMealCompleted]);

  const copyMealToDate = useCallback(async (
    mealPlanId: string,
    targetDate: Date,
    targetMealType?: MealType
  ) => {
    try {
      await copyMealPlan({
        id: mealPlanId,
        targetDate: targetDate.toISOString(),
        targetMealType,
      }).unwrap();
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao copiar refeição');
    }
  }, [copyMealPlan]);

  const generateWeekPlan = useCallback(async (
    weekStart: Date,
    replaceExisting: boolean = false
  ) => {
    try {
      await generateWeeklyPlan({
        userId,
        weekStart: weekStart.toISOString(),
        replaceExisting,
      }).unwrap();
      
      Alert.alert('Sucesso', 'Planejamento semanal gerado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao gerar planejamento semanal');
    }
  }, [generateWeeklyPlan, userId]);

  // Drag & Drop functions
  const startDragRecipe = useCallback((recipe: DragDropMealData) => {
    setDraggedRecipe(recipe);
  }, []);

  const endDragRecipe = useCallback(() => {
    setDraggedRecipe(null);
  }, []);

  const dropRecipeOnDate = useCallback(async (
    date: Date,
    mealType: MealType,
    recipe: DragDropMealData
  ) => {
    if (!draggedRecipe) return;

    await addMealToDate(date, mealType, recipe.recipeId, recipe.servings);
    endDragRecipe();
  }, [draggedRecipe, addMealToDate, endDragRecipe]);

  // Utility functions
  const getMealsForDate = useCallback((date: Date) => {
    return mealPlans.filter(meal => 
      isSameDay(new Date(meal.date), date)
    );
  }, [mealPlans]);

  const getMealForDateTime = useCallback((date: Date, mealType: MealType) => {
    return mealPlans.find(meal => 
      isSameDay(new Date(meal.date), date) && meal.mealType === mealType
    );
  }, [mealPlans]);

  const hasPlannedMealsForDate = useCallback((date: Date) => {
    return mealPlans.some(meal => isSameDay(new Date(meal.date), date));
  }, [mealPlans]);

  const getWeekProgress = useCallback(() => {
    if (!weeklyPlan) return { completed: 0, total: 0, percentage: 0 };
    
    return {
      completed: weeklyPlan.completedMeals,
      total: weeklyPlan.totalRecipes,
      percentage: weeklyPlan.totalRecipes > 0 
        ? (weeklyPlan.completedMeals / weeklyPlan.totalRecipes) * 100 
        : 0,
    };
  }, [weeklyPlan]);

  return {
    // State
    viewMode,
    selectedDate,
    draggedRecipe,
    calendarDays,
    
    // Data
    mealPlans,
    weeklyPlan,
    suggestions,
    
    // Loading states
    loadingMealPlans,
    loadingWeeklyPlan,
    loadingSuggestions,
    
    // Navigation
    navigateToToday,
    navigatePrevious,
    navigateNext,
    switchViewMode,
    setSelectedDate,
    
    // Meal operations
    addMealToDate,
    removeMealFromDate,
    moveMealToDate,
    toggleMealCompleted,
    copyMealToDate,
    generateWeekPlan,
    
    // Drag & Drop
    startDragRecipe,
    endDragRecipe,
    dropRecipeOnDate,
    
    // Utilities
    getMealsForDate,
    getMealForDateTime,
    hasPlannedMealsForDate,
    getWeekProgress,
    refetchMealPlans,
  };
};

// Helper functions
function getWeekStart(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekEnd(date: Date): Date {
  const end = getWeekStart(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getMonthStart(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getMonthEnd(date: Date): Date {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return end;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function generateCalendarDays(
  viewMode: CalendarViewMode,
  mealPlans: MealPlan[]
): MealPlanCalendarDay[] {
  const days: MealPlanCalendarDay[] = [];
  const today = new Date();
  
  const current = new Date(viewMode.startDate);
  while (current <= viewMode.endDate) {
    const dayMealPlans = mealPlans.filter(meal => 
      isSameDay(new Date(meal.date), current)
    );
    
    const meals = {
      breakfast: dayMealPlans.find(m => m.mealType === 'breakfast'),
      lunch: dayMealPlans.find(m => m.mealType === 'lunch'),
      dinner: dayMealPlans.find(m => m.mealType === 'dinner'),
      snack: dayMealPlans.filter(m => m.mealType === 'snack'),
    };
    
    days.push({
      date: new Date(current),
      isToday: isSameDay(current, today),
      isCurrentMonth: current.getMonth() === viewMode.startDate.getMonth(),
      meals,
      totalMeals: dayMealPlans.length,
      hasPlannedMeals: dayMealPlans.length > 0,
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

export default useMealPlanning;