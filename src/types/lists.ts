import {BaseEntity} from './index';

// Tipos para listas personalizadas
export interface CustomList extends BaseEntity {
  name: string;
  description?: string;
  color: string;
  icon: string;
  userId: string;
  isPublic: boolean;
  recipeIds: string[];
  tags: string[];
  
  // Metadados
  recipesCount: number;
  lastModified: Date;
  
  // Configurações de exibição
  sortBy: 'dateAdded' | 'alphabetical' | 'rating' | 'prepTime' | 'custom';
  sortOrder: 'asc' | 'desc';
  
  // Compartilhamento
  shareCode?: string;
  collaborators?: string[]; // IDs dos usuários que podem editar
}

// Tipos para entrada de receita em lista
export interface ListRecipeEntry {
  recipeId: string;
  listId: string;
  addedAt: Date;
  addedBy: string;
  notes?: string;
  position: number; // Para ordenação customizada
}

// Tipos para criação e atualização
export type CreateCustomListInput = Omit<
  CustomList,
  'id' | 'createdAt' | 'updatedAt' | 'recipesCount' | 'lastModified'
>;

export type UpdateCustomListInput = Partial<CreateCustomListInput> & {
  id: string;
};

// Tipos para operações de lista
export interface AddRecipeToListInput {
  listId: string;
  recipeId: string;
  notes?: string;
  position?: number;
}

export interface RemoveRecipeFromListInput {
  listId: string;
  recipeId: string;
}

export interface ReorderListRecipesInput {
  listId: string;
  recipeIds: string[]; // Nova ordem dos IDs
}

export interface ShareListInput {
  listId: string;
  isPublic: boolean;
  collaborators?: string[];
}

// Tipos para filtros de listas
export interface ListFilters {
  userId?: string;
  isPublic?: boolean;
  tags?: string[];
  hasRecipes?: boolean;
  sortBy?: 'name' | 'createdAt' | 'recipesCount' | 'lastModified';
  sortOrder?: 'asc' | 'desc';
}

// Tipos para estatísticas de listas
export interface ListStats {
  totalLists: number;
  totalRecipes: number;
  mostUsedTags: string[];
  averageRecipesPerList: number;
  recentActivity: {
    listsCreated: number;
    recipesAdded: number;
    lastWeek: boolean;
  };
}

// Tipos para templates de listas
export interface ListTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  suggestedTags: string[];
  category: 'meal-planning' | 'dietary' | 'occasion' | 'cuisine' | 'other';
}

// Templates predefinidos
export const LIST_TEMPLATES: ListTemplate[] = [
  {
    id: 'favorites',
    name: 'Favoritas',
    description: 'Suas receitas preferidas',
    icon: 'heart',
    color: '#E91E63',
    suggestedTags: ['favoritas'],
    category: 'other',
  },
  {
    id: 'quick-meals',
    name: 'Refeições Rápidas',
    description: 'Receitas para o dia a dia',
    icon: 'clock-fast',
    color: '#4CAF50',
    suggestedTags: ['rápido', 'prático'],
    category: 'meal-planning',
  },
  {
    id: 'healthy',
    name: 'Saudáveis',
    description: 'Receitas nutritivas e balanceadas',
    icon: 'heart-pulse',
    color: '#8BC34A',
    suggestedTags: ['saudável', 'fitness'],
    category: 'dietary',
  },
  {
    id: 'desserts',
    name: 'Sobremesas',
    description: 'Doces e sobremesas especiais',
    icon: 'cake-variant',
    color: '#FF5722',
    suggestedTags: ['doce', 'sobremesa'],
    category: 'meal-planning',
  },
  {
    id: 'party',
    name: 'Para Festas',
    description: 'Receitas para ocasiões especiais',
    icon: 'party-popper',
    color: '#9C27B0',
    suggestedTags: ['festa', 'especial'],
    category: 'occasion',
  },
  {
    id: 'vegetarian',
    name: 'Vegetarianas',
    description: 'Receitas sem carne',
    icon: 'leaf',
    color: '#689F38',
    suggestedTags: ['vegetariano'],
    category: 'dietary',
  },
  {
    id: 'comfort-food',
    name: 'Comfort Food',
    description: 'Receitas que aquecem o coração',
    icon: 'home-heart',
    color: '#795548',
    suggestedTags: ['comfort', 'caseiro'],
    category: 'other',
  },
  {
    id: 'meal-prep',
    name: 'Meal Prep',
    description: 'Receitas para preparar com antecedência',
    icon: 'food-takeout-box',
    color: '#607D8B',
    suggestedTags: ['meal-prep', 'prático'],
    category: 'meal-planning',
  },
];

// Cores disponíveis para listas
export const LIST_COLORS = [
  '#E91E63', // Pink
  '#9C27B0', // Purple
  '#673AB7', // Deep Purple
  '#3F51B5', // Indigo
  '#2196F3', // Blue
  '#03A9F4', // Light Blue
  '#00BCD4', // Cyan
  '#009688', // Teal
  '#4CAF50', // Green
  '#8BC34A', // Light Green
  '#CDDC39', // Lime
  '#FFEB3B', // Yellow
  '#FFC107', // Amber
  '#FF9800', // Orange
  '#FF5722', // Deep Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
];

// Ícones disponíveis para listas
export const LIST_ICONS = [
  'heart',
  'star',
  'bookmark',
  'folder',
  'tag',
  'cake-variant',
  'food',
  'silverware-fork-knife',
  'coffee',
  'leaf',
  'fire',
  'clock-fast',
  'home-heart',
  'party-popper',
  'food-takeout-box',
  'chef-hat',
  'pot-steam',
  'blender',
  'scale-kitchen',
  'timer',
];