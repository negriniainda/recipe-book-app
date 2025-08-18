export interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  prepTime: number; // em minutos
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';

  ingredients: Ingredient[];
  instructions: Instruction[];

  categories: string[];
  tags: string[];

  nutrition?: NutritionInfo;
  images: string[];
  videos?: string[];

  // Metadados de origem
  sourceUrl?: string;
  originalAuthor?: string;
  originalRecipe?: string;

  // Dados do usuário
  userId: string;
  isPublic: boolean;
  isFavorite: boolean;
  rating?: number;
  notes?: string;

  // Dados da comunidade
  likes: number;
  comments: Comment[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: 'protein' | 'vegetable' | 'grain' | 'dairy' | 'spice' | 'other';
  optional?: boolean;
}

export interface Instruction {
  id: string;
  stepNumber: number;
  description: string;
  duration?: number; // em minutos
  temperature?: number;
  image?: string;
  video?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para criação e atualização
export type CreateRecipeInput = Omit<
  Recipe,
  'id' | 'createdAt' | 'updatedAt' | 'likes' | 'comments'
>;
export type UpdateRecipeInput = Partial<CreateRecipeInput> & {id: string};

// Tipos para filtros e busca
export interface RecipeFilters {
  categories?: string[];
  tags?: string[];
  difficulty?: Recipe['difficulty'][];
  maxPrepTime?: number;
  maxCookTime?: number;
  ingredients?: string[];
  dietaryRestrictions?: string[];
  minRating?: number;
  userId?: string;
  isPublic?: boolean;
}

export interface RecipeSearchParams {
  query?: string;
  filters?: RecipeFilters;
  sortBy?: 'createdAt' | 'updatedAt' | 'rating' | 'likes' | 'prepTime';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Sistema de Avaliações e Anotações
export interface RecipeRating {
  id: string;
  recipeId: string;
  userId: string;
  rating: number; // 1-5 estrelas
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeNote {
  id: string;
  recipeId: string;
  userId: string;
  content: string;
  type: 'general' | 'modification' | 'tip' | 'warning' | 'ingredient' | 'technique';
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeVersion {
  id: string;
  recipeId: string;
  baseVersionId?: string; // versão base para esta versão
  userId: string;
  name: string;
  description?: string;
  type: 'original' | 'modification' | 'improvement' | 'adaptation' | 'experiment';
  changeReason?: string;
  
  // Dados da receita nesta versão
  recipe: Recipe;
  
  // Metadados da versão
  isCurrent: boolean;
  isPrivate: boolean;
  tags?: string[];
  rating?: number;
  timesUsed?: number;
  
  // Resumo das mudanças
  changes?: {
    ingredients?: boolean;
    instructions?: boolean;
    metadata?: boolean;
    images?: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para criação e atualização
export type CreateRecipeRatingInput = Omit<
  RecipeRating,
  'id' | 'createdAt' | 'updatedAt'
>;

export type CreateRecipeNoteInput = Omit<
  RecipeNote,
  'id' | 'createdAt' | 'updatedAt'
>;

export type CreateRecipeVersionInput = Omit<
  RecipeVersion,
  'id' | 'recipe' | 'isCurrent' | 'timesUsed' | 'changes' | 'createdAt' | 'updatedAt'
>;

export type UpdateRecipeNoteInput = Partial<CreateRecipeNoteInput> & {id: string};
export type UpdateRecipeVersionInput = Partial<CreateRecipeVersionInput> & {id: string};
