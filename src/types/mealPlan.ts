// Types for meal planning system

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealPlanItem {
  id: string;
  recipeId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mealType: MealType;
  servings: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  items: MealPlanItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MealSuggestion {
  recipeId: string;
  score: number; // 0-1, higher is better match
  reasons: string[]; // Why this recipe was suggested
  mealType: MealType;
  date: string;
}

export interface MealPlanPreferences {
  userId: string;
  preferredMealTypes: MealType[];
  dietaryRestrictions: string[];
  favoriteCategories: string[];
  cookingTimePreference: 'quick' | 'medium' | 'long' | 'any';
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'any';
  varietyLevel: 'low' | 'medium' | 'high'; // How much variety in meal planning
  planningHorizon: 'week' | 'month'; // Default planning period
}

export interface MealReminder {
  id: string;
  mealPlanItemId: string;
  reminderTime: Date;
  message: string;
  isActive: boolean;
  notificationId?: string; // For push notifications
}

export interface CalendarDay {
  date: string; // ISO date string
  meals: {
    breakfast?: MealPlanItem[];
    lunch?: MealPlanItem[];
    dinner?: MealPlanItem[];
    snack?: MealPlanItem[];
  };
  totalCalories?: number;
  isToday: boolean;
  isPast: boolean;
}

export interface WeekView {
  weekStart: string; // ISO date string (Monday)
  weekEnd: string; // ISO date string (Sunday)
  days: CalendarDay[];
}

export interface MonthView {
  month: number; // 1-12
  year: number;
  weeks: WeekView[];
}

// API Request/Response types
export interface CreateMealPlanRequest {
  name: string;
  startDate: string;
  endDate: string;
}

export interface AddMealPlanItemRequest {
  mealPlanId: string;
  recipeId: string;
  date: string;
  mealType: MealType;
  servings: number;
  notes?: string;
}

export interface UpdateMealPlanItemRequest {
  id: string;
  servings?: number;
  notes?: string;
  date?: string;
  mealType?: MealType;
}

export interface GetMealSuggestionsRequest {
  date: string;
  mealType?: MealType;
  excludeRecipeIds?: string[];
  limit?: number;
}

export interface MealPlanStats {
  totalMeals: number;
  mealsByType: Record<MealType, number>;
  averageCookingTime: number;
  varietyScore: number; // 0-1, higher means more variety
  nutritionBalance?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}