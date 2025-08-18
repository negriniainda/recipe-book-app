import {RootState} from '@/types/store';
import {Recipe, User, MealPlan, ShoppingList} from '@/types';

// Utilitários para selectors
export const createEntitySelector = <T extends {id: string}>(
  entityName: keyof RootState,
  id: string,
) => {
  return (state: RootState): T | undefined => {
    const entityState = state[entityName] as any;
    return entityState?.entities?.[id];
  };
};

// Selector para verificar se uma entidade está carregando
export const createLoadingSelector = (
  entityName: keyof RootState,
  operation?: string,
) => {
  return (state: RootState): boolean => {
    const entityState = state[entityName] as any;

    if (operation) {
      return entityState?.loading?.[operation] || false;
    }

    return entityState?.loading || false;
  };
};

// Selector para obter erro de uma entidade
export const createErrorSelector = (
  entityName: keyof RootState,
  operation?: string,
) => {
  return (state: RootState): string | null => {
    const entityState = state[entityName] as any;

    if (operation) {
      return entityState?.error?.[operation] || null;
    }

    return entityState?.error || null;
  };
};

// Utilitários para normalização de dados
export const normalizeRecipes = (recipes: Recipe[]) => {
  const entities: Record<string, Recipe> = {};
  const ids: string[] = [];

  recipes.forEach(recipe => {
    entities[recipe.id] = recipe;
    ids.push(recipe.id);
  });

  return {entities, ids};
};

export const normalizeMealPlans = (mealPlans: MealPlan[]) => {
  const entities: Record<string, MealPlan> = {};
  const ids: string[] = [];

  mealPlans.forEach(plan => {
    entities[plan.id] = plan;
    ids.push(plan.id);
  });

  return {entities, ids};
};

export const normalizeShoppingLists = (lists: ShoppingList[]) => {
  const entities: Record<string, ShoppingList> = {};
  const ids: string[] = [];

  lists.forEach(list => {
    entities[list.id] = list;
    ids.push(list.id);
  });

  return {entities, ids};
};

// Utilitários para cache
export const shouldRefetch = (
  lastFetch: number | null,
  maxAge: number = 5 * 60 * 1000,
): boolean => {
  if (!lastFetch) return true;
  return Date.now() - lastFetch > maxAge;
};

// Utilitários para filtros
export const applyRecipeFilters = (recipes: Recipe[], filters: any) => {
  return recipes.filter(recipe => {
    // Aplicar filtros de categoria
    if (filters.categories?.length > 0) {
      if (
        !filters.categories.some((cat: string) =>
          recipe.categories.includes(cat),
        )
      ) {
        return false;
      }
    }

    // Aplicar filtros de tags
    if (filters.tags?.length > 0) {
      if (!filters.tags.some((tag: string) => recipe.tags.includes(tag))) {
        return false;
      }
    }

    // Aplicar filtro de dificuldade
    if (filters.difficulty?.length > 0) {
      if (!filters.difficulty.includes(recipe.difficulty)) {
        return false;
      }
    }

    // Aplicar filtro de tempo
    if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) {
      return false;
    }

    if (filters.maxCookTime && recipe.cookTime > filters.maxCookTime) {
      return false;
    }

    // Aplicar filtro de ingredientes
    if (filters.ingredients?.length > 0) {
      const recipeIngredients = recipe.ingredients.map(ing =>
        ing.name.toLowerCase(),
      );
      const hasIngredient = filters.ingredients.some((filterIng: string) =>
        recipeIngredients.some(recipeIng =>
          recipeIng.includes(filterIng.toLowerCase()),
        ),
      );
      if (!hasIngredient) {
        return false;
      }
    }

    return true;
  });
};

// Utilitários para busca
export const searchRecipes = (recipes: Recipe[], query: string) => {
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) return recipes;

  return recipes.filter(recipe => {
    // Buscar no título
    if (recipe.title.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Buscar na descrição
    if (recipe.description?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Buscar nos ingredientes
    if (
      recipe.ingredients.some(ing =>
        ing.name.toLowerCase().includes(searchTerm),
      )
    ) {
      return true;
    }

    // Buscar nas instruções
    if (
      recipe.instructions.some(inst =>
        inst.description.toLowerCase().includes(searchTerm),
      )
    ) {
      return true;
    }

    // Buscar nas tags
    if (recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return true;
    }

    // Buscar nas categorias
    if (recipe.categories.some(cat => cat.toLowerCase().includes(searchTerm))) {
      return true;
    }

    return false;
  });
};

// Utilitários para ordenação
export const sortRecipes = (
  recipes: Recipe[],
  sortBy: string,
  order: 'asc' | 'desc' = 'desc',
) => {
  const sorted = [...recipes].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'prepTime':
        comparison = a.prepTime - b.prepTime;
        break;
      case 'cookTime':
        comparison = a.cookTime - b.cookTime;
        break;
      case 'difficulty':
        const difficultyOrder = {easy: 1, medium: 2, hard: 3};
        comparison =
          difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        break;
      case 'rating':
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      case 'likes':
        comparison = a.likes - b.likes;
        break;
      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

// Utilitários para validação de estado
export const isValidUser = (user: User | null): user is User => {
  return user !== null && typeof user.id === 'string' && user.id.length > 0;
};

export const isValidRecipe = (recipe: Recipe | null): recipe is Recipe => {
  return (
    recipe !== null &&
    typeof recipe.id === 'string' &&
    recipe.id.length > 0 &&
    recipe.ingredients.length > 0 &&
    recipe.instructions.length > 0
  );
};

// Utilitários para transformação de dados
export const transformRecipeForApi = (recipe: Partial<Recipe>) => {
  // Remover campos que não devem ser enviados para a API
  const {id, createdAt, updatedAt, likes, comments, ...apiRecipe} = recipe;
  return apiRecipe;
};

export const transformUserForApi = (user: Partial<User>) => {
  // Remover campos que não devem ser enviados para a API
  const {
    id,
    createdAt,
    updatedAt,
    recipesCount,
    followersCount,
    followingCount,
    ...apiUser
  } = user;
  return apiUser;
};
