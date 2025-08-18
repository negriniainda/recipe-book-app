export interface MealPlan {
  id: string;
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  recipe?: Recipe; // populated recipe data
  servings: number;
  notes?: string;
  completed?: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  items: ShoppingItem[];
  isCompleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  completed: boolean;
  recipeIds: string[]; // receitas que usam este ingrediente
  notes?: string;
}

import {ShoppingCategory} from './enums';
import {Recipe} from './recipe';

// Tipos para criação e atualização
export type CreateMealPlanInput = Omit<
  MealPlan,
  'id' | 'createdAt' | 'updatedAt' | 'recipe'
>;
export type UpdateMealPlanInput = Partial<CreateMealPlanInput> & {id: string};

export type CreateShoppingListInput = Omit<
  ShoppingList,
  'id' | 'createdAt' | 'updatedAt'
>;
export type UpdateShoppingListInput = Partial<CreateShoppingListInput> & {
  id: string;
};

// Tipos para parâmetros de consulta
export interface GetMealPlansParams {
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  mealType?: string;
  page?: number;
  limit?: number;
}

export interface GetShoppingListsParams {
  userId?: string;
  completed?: boolean;
  page?: number;
  limit?: number;
}

// Tipos para geração automática de lista de compras
export interface GenerateShoppingListParams {
  recipeIds: string[];
  servingsAdjustments?: Record<string, number>; // recipeId -> new servings
  excludeIngredients?: string[]; // ingredientes que já possui
  listName?: string;
}

// Tipos para planejamento semanal/mensal
export interface WeeklyMealPlan {
  weekStart: Date;
  weekEnd: Date;
  plans: MealPlan[];
  totalRecipes: number;
  nutritionSummary?: WeeklyNutritionSummary;
}

export interface WeeklyNutritionSummary {
  totalCalories: number;
  avgCaloriesPerDay: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  dailyBreakdown: DailyNutrition[];
}

export interface DailyNutrition {
  date: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: {
    breakfast?: number; // calories
    lunch?: number;
    dinner?: number;
    snacks?: number;
  };
}
