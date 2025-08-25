// Types for shopping list functionality

export type ShoppingListItemStatus = 'pending' | 'purchased' | 'unavailable';

export type GroceryCategory = 
  | 'produce' // Frutas e Vegetais
  | 'meat' // Carnes e Peixes
  | 'dairy' // Laticínios
  | 'bakery' // Padaria
  | 'pantry' // Despensa
  | 'frozen' // Congelados
  | 'beverages' // Bebidas
  | 'snacks' // Lanches
  | 'condiments' // Condimentos
  | 'spices' // Temperos
  | 'cleaning' // Limpeza
  | 'other'; // Outros

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: GroceryCategory;
  status: ShoppingListItemStatus;
  estimatedPrice?: number;
  actualPrice?: number;
  notes?: string;
  recipeIds: string[]; // Receitas que usam este ingrediente
  addedAt: Date;
  purchasedAt?: Date;
  isCustom: boolean; // Se foi adicionado manualmente
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: ShoppingListItem[];
  totalEstimatedPrice: number;
  totalActualPrice: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  sharedWith: string[]; // User IDs
  mealPlanIds: string[]; // Meal plans que geraram esta lista
  storeLayout?: StoreLayout;
}

export interface StoreLayout {
  id: string;
  name: string;
  categories: {
    category: GroceryCategory;
    order: number;
    aisle?: string;
    section?: string;
  }[];
}

export interface ShoppingListTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: Omit<ShoppingListItem, 'id' | 'status' | 'addedAt' | 'purchasedAt' | 'actualPrice'>[];
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface ShoppingListStats {
  totalLists: number;
  completedLists: number;
  totalItems: number;
  purchasedItems: number;
  totalSpent: number;
  averageListSize: number;
  mostBoughtItems: {
    name: string;
    count: number;
    category: GroceryCategory;
  }[];
  categoryBreakdown: {
    category: GroceryCategory;
    itemCount: number;
    totalSpent: number;
  }[];
}

export interface ShoppingListPreferences {
  userId: string;
  defaultStoreLayout?: string;
  autoGenerateFromMealPlan: boolean;
  consolidateDuplicates: boolean;
  sortByCategory: boolean;
  showPrices: boolean;
  defaultQuantityUnit: string;
  reminderSettings: {
    enabled: boolean;
    daysBefore: number;
    timeOfDay: string; // HH:MM format
  };
  categoryOrder: GroceryCategory[];
}

// API Request/Response types
export interface CreateShoppingListRequest {
  name: string;
  description?: string;
  mealPlanIds?: string[];
  templateId?: string;
}

export interface AddShoppingListItemRequest {
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  category?: GroceryCategory;
  estimatedPrice?: number;
  notes?: string;
  recipeIds?: string[];
}

export interface UpdateShoppingListItemRequest {
  id: string;
  quantity?: number;
  unit?: string;
  status?: ShoppingListItemStatus;
  actualPrice?: number;
  notes?: string;
}

export interface GenerateFromMealPlanRequest {
  mealPlanIds: string[];
  consolidateDuplicates?: boolean;
  includeOptionalIngredients?: boolean;
}

// UI State types
export interface ShoppingListViewMode {
  groupBy: 'category' | 'recipe' | 'status' | 'none';
  sortBy: 'name' | 'category' | 'price' | 'date';
  sortOrder: 'asc' | 'desc';
  showCompleted: boolean;
  showPrices: boolean;
}

export interface ShoppingCartState {
  selectedItems: string[];
  totalItems: number;
  totalPrice: number;
  estimatedTotal: number;
  completionPercentage: number;
}

// Utility types
export type GroupedShoppingListItems = {
  [key in GroceryCategory]: ShoppingListItem[];
};

export type ShoppingListSummary = Pick<ShoppingList, 'id' | 'name' | 'status' | 'createdAt'> & {
  itemCount: number;
  completedItems: number;
  estimatedTotal: number;
};