// Types for meal planning functionality

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlan {
  id: string;
  userId: string;
  date: Date;
  mealType: MealType;
  recipeId: string;
  servings: number;
  notes?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlanSuggestion {
  id: string;
  recipeId: string;
  score: number;
  reason: string;
  mealType: MealType;
  confidence: number;
}

export interface WeeklyMealPlan {
  weekStart: Date;
  weekEnd: Date;
  meals: MealPlan[];
  totalRecipes: number;
  completedMeals: number;
}

export interface MealPlanningPreferences {
  userId: string;
  preferredMealTypes: MealType[];
  cookingFrequency: 'daily' | 'few-times-week' | 'weekly' | 'rarely';
  dietaryRestrictions: string[];
  favoriteCategories: string[];
  avoidIngredients: string[];
  maxPrepTime: number;
  maxCookTime: number;
  servingSize: number;
  planningHorizon: 'week' | 'month';
  reminderSettings: {
    enabled: boolean;
    beforeMealMinutes: number;
    beforeShoppingHours: number;
  };
}

export interface MealPlanCalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  meals: {
    breakfast?: MealPlan;
    lunch?: MealPlan;
    dinner?: MealPlan;
    snack?: MealPlan[];
  };
  totalMeals: number;
  hasPlannedMeals: boolean;
}

export interface MealPlanStats {
  totalPlannedMeals: number;
  completedMeals: number;
  uniqueRecipes: number;
  averagePrepTime: number;
  mostUsedCategories: string[];
  upcomingMeals: MealPlan[];
}

export interface MealPlanNotification {
  id: string;
  mealPlanId: string;
  type: 'meal-reminder' | 'prep-reminder' | 'shopping-reminder';
  title: string;
  message: string;
  scheduledFor: Date;
  sent: boolean;
  createdAt: Date;
}

export interface DragDropMealData {
  recipeId: string;
  recipeName: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  category: string;
  difficulty: string;
  imageUrl?: string;
}

export interface CalendarViewMode {
  type: 'week' | 'month';
  startDate: Date;
  endDate: Date;
}

export interface MealPlanFilter {
  mealTypes: MealType[];
  dateRange: {
    start: Date;
    end: Date;
  };
  completed?: boolean;
  recipeCategories: string[];
}