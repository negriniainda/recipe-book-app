import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import {MealPlan, ShoppingList, ShoppingItem} from '@/types';
import {PlanningState} from '@/types/store';
import {RootState} from '@/types/store';

// Entity adapters
const mealPlansAdapter = createEntityAdapter<MealPlan>();
const shoppingListsAdapter = createEntityAdapter<ShoppingList>();

// Estado inicial
const initialState: PlanningState = {
  mealPlans: {
    ...mealPlansAdapter.getInitialState(),
    loading: false,
    error: null,
    lastFetch: null,
  },
  shoppingLists: {
    ...shoppingListsAdapter.getInitialState(),
    loading: false,
    error: null,
    lastFetch: null,
  },
  currentWeek: {
    start: new Date(),
    end: new Date(),
    plans: [],
  },
  generateListLoading: false,
  generateListError: null,
};

// Slice
const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    // Meal Plans
    setMealPlansLoading: (state, action: PayloadAction<boolean>) => {
      state.mealPlans.loading = action.payload;
    },
    setMealPlansError: (state, action: PayloadAction<string | null>) => {
      state.mealPlans.error = action.payload;
    },
    setMealPlans: (state, action: PayloadAction<MealPlan[]>) => {
      mealPlansAdapter.setAll(state.mealPlans, action.payload);
      state.mealPlans.lastFetch = Date.now();
    },
    addMealPlan: (state, action: PayloadAction<MealPlan>) => {
      mealPlansAdapter.addOne(state.mealPlans, action.payload);
    },
    updateMealPlan: (
      state,
      action: PayloadAction<{id: string; changes: Partial<MealPlan>}>,
    ) => {
      mealPlansAdapter.updateOne(state.mealPlans, action.payload);
    },
    removeMealPlan: (state, action: PayloadAction<string>) => {
      mealPlansAdapter.removeOne(state.mealPlans, action.payload);
      // Remover da semana atual se estiver lá
      state.currentWeek.plans = state.currentWeek.plans.filter(
        id => id !== action.payload,
      );
    },

    // Semana atual
    setCurrentWeek: (
      state,
      action: PayloadAction<{start: Date; end: Date}>,
    ) => {
      const {start, end} = action.payload;
      state.currentWeek.start = start;
      state.currentWeek.end = end;

      // Encontrar meal plans da semana
      const weekPlans = Object.values(state.mealPlans.entities)
        .filter(plan => {
          if (!plan) return false;
          const planDate = new Date(plan.date);
          return planDate >= start && planDate <= end;
        })
        .map(plan => plan!.id);

      state.currentWeek.plans = weekPlans;
    },

    // Adicionar receita a uma refeição
    addRecipeToMeal: (
      state,
      action: PayloadAction<{
        date: Date;
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
        recipeId: string;
      }>,
    ) => {
      const {date, mealType, recipeId} = action.payload;
      const dateStr = date.toISOString().split('T')[0];

      // Encontrar meal plan existente para a data
      const mealPlan = Object.values(state.mealPlans.entities).find(
        plan =>
          plan && new Date(plan.date).toISOString().split('T')[0] === dateStr,
      );

      if (mealPlan) {
        // Atualizar meal plan existente
        if (mealType === 'snacks') {
          const currentSnacks = mealPlan.meals.snacks || [];
          mealPlan.meals.snacks = [...currentSnacks, recipeId];
        } else {
          mealPlan.meals[mealType] = recipeId;
        }
      } else {
        // Criar novo meal plan
        const newMealPlan: MealPlan = {
          id: `meal-plan-${Date.now()}`,
          userId: '', // Será preenchido pelo thunk
          date,
          meals: {
            [mealType]: mealType === 'snacks' ? [recipeId] : recipeId,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        mealPlansAdapter.addOne(state.mealPlans, newMealPlan);
      }
    },

    // Remover receita de uma refeição
    removeRecipeFromMeal: (
      state,
      action: PayloadAction<{
        date: Date;
        mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
        recipeId?: string;
      }>,
    ) => {
      const {date, mealType, recipeId} = action.payload;
      const dateStr = date.toISOString().split('T')[0];

      const mealPlan = Object.values(state.mealPlans.entities).find(
        plan =>
          plan && new Date(plan.date).toISOString().split('T')[0] === dateStr,
      );

      if (mealPlan) {
        if (mealType === 'snacks' && recipeId) {
          const currentSnacks = mealPlan.meals.snacks || [];
          mealPlan.meals.snacks = currentSnacks.filter(id => id !== recipeId);
        } else {
          mealPlan.meals[mealType] = undefined;
        }
      }
    },

    // Shopping Lists
    setShoppingListsLoading: (state, action: PayloadAction<boolean>) => {
      state.shoppingLists.loading = action.payload;
    },
    setShoppingListsError: (state, action: PayloadAction<string | null>) => {
      state.shoppingLists.error = action.payload;
    },
    setShoppingLists: (state, action: PayloadAction<ShoppingList[]>) => {
      shoppingListsAdapter.setAll(state.shoppingLists, action.payload);
      state.shoppingLists.lastFetch = Date.now();
    },
    addShoppingList: (state, action: PayloadAction<ShoppingList>) => {
      shoppingListsAdapter.addOne(state.shoppingLists, action.payload);
    },
    updateShoppingList: (
      state,
      action: PayloadAction<{id: string; changes: Partial<ShoppingList>}>,
    ) => {
      shoppingListsAdapter.updateOne(state.shoppingLists, action.payload);
    },
    removeShoppingList: (state, action: PayloadAction<string>) => {
      shoppingListsAdapter.removeOne(state.shoppingLists, action.payload);
    },

    // Itens da lista de compras
    addShoppingItem: (
      state,
      action: PayloadAction<{listId: string; item: ShoppingItem}>,
    ) => {
      const {listId, item} = action.payload;
      const list = state.shoppingLists.entities[listId];
      if (list) {
        list.items.push(item);
        list.updatedAt = new Date();
      }
    },
    updateShoppingItem: (
      state,
      action: PayloadAction<{
        listId: string;
        itemId: string;
        changes: Partial<ShoppingItem>;
      }>,
    ) => {
      const {listId, itemId, changes} = action.payload;
      const list = state.shoppingLists.entities[listId];
      if (list) {
        const itemIndex = list.items.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
          list.items[itemIndex] = {...list.items[itemIndex], ...changes};
          list.updatedAt = new Date();
        }
      }
    },
    removeShoppingItem: (
      state,
      action: PayloadAction<{listId: string; itemId: string}>,
    ) => {
      const {listId, itemId} = action.payload;
      const list = state.shoppingLists.entities[listId];
      if (list) {
        list.items = list.items.filter(item => item.id !== itemId);
        list.updatedAt = new Date();
      }
    },
    toggleShoppingItemPurchased: (
      state,
      action: PayloadAction<{listId: string; itemId: string}>,
    ) => {
      const {listId, itemId} = action.payload;
      const list = state.shoppingLists.entities[listId];
      if (list) {
        const item = list.items.find(item => item.id === itemId);
        if (item) {
          item.isPurchased = !item.isPurchased;
          list.updatedAt = new Date();
        }
      }
    },
    markShoppingListCompleted: (state, action: PayloadAction<string>) => {
      const listId = action.payload;
      const list = state.shoppingLists.entities[listId];
      if (list) {
        list.isCompleted = true;
        list.updatedAt = new Date();
      }
    },

    // Geração de lista de compras
    setGenerateListLoading: (state, action: PayloadAction<boolean>) => {
      state.generateListLoading = action.payload;
    },
    setGenerateListError: (state, action: PayloadAction<string | null>) => {
      state.generateListError = action.payload;
    },

    // Reset
    resetPlanning: () => initialState,
  },
});

// Selectors para meal plans
export const mealPlansSelectors = mealPlansAdapter.getSelectors(
  (state: RootState) => state.planning.mealPlans,
);

// Selectors para shopping lists
export const shoppingListsSelectors = shoppingListsAdapter.getSelectors(
  (state: RootState) => state.planning.shoppingLists,
);

// Selectors customizados
export const selectMealPlanByDate = (state: RootState, date: Date) => {
  const dateStr = date.toISOString().split('T')[0];
  return Object.values(state.planning.mealPlans.entities).find(
    plan => plan && new Date(plan.date).toISOString().split('T')[0] === dateStr,
  );
};

export const selectCurrentWeekMealPlans = (state: RootState) => {
  return state.planning.currentWeek.plans
    .map(id => state.planning.mealPlans.entities[id])
    .filter(Boolean) as MealPlan[];
};

export const selectActiveShoppingLists = (state: RootState) => {
  return Object.values(state.planning.shoppingLists.entities).filter(
    list => list && !list.isCompleted,
  ) as ShoppingList[];
};

export const selectShoppingListProgress = (
  state: RootState,
  listId: string,
) => {
  const list = state.planning.shoppingLists.entities[listId];
  if (!list || list.items.length === 0) {
    return {purchased: 0, total: 0, percentage: 0};
  }

  const purchased = list.items.filter(item => item.isPurchased).length;
  const total = list.items.length;
  const percentage = Math.round((purchased / total) * 100);

  return {purchased, total, percentage};
};

export const {
  setMealPlansLoading,
  setMealPlansError,
  setMealPlans,
  addMealPlan,
  updateMealPlan,
  removeMealPlan,
  setCurrentWeek,
  addRecipeToMeal,
  removeRecipeFromMeal,
  setShoppingListsLoading,
  setShoppingListsError,
  setShoppingLists,
  addShoppingList,
  updateShoppingList,
  removeShoppingList,
  addShoppingItem,
  updateShoppingItem,
  removeShoppingItem,
  toggleShoppingItemPurchased,
  markShoppingListCompleted,
  setGenerateListLoading,
  setGenerateListError,
  resetPlanning,
} = planningSlice.actions;

export default planningSlice.reducer;
