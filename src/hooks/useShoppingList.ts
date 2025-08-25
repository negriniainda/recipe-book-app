import {useState, useCallback, useMemo} from 'react';
import {Alert} from 'react-native';
import {
  useGetShoppingListsQuery,
  useGetShoppingListQuery,
  useCreateShoppingListMutation,
  useUpdateShoppingListMutation,
  useDeleteShoppingListMutation,
  useAddShoppingListItemMutation,
  useUpdateShoppingListItemMutation,
  useDeleteShoppingListItemMutation,
  useBulkUpdateShoppingListItemsMutation,
  useGenerateFromMealPlanMutation,
  useGetShoppingListPreferencesQuery,
  useGetIngredientSuggestionsQuery,
} from '../services/shoppingListApi';
import {
  ShoppingList,
  ShoppingListItem,
  ShoppingListViewMode,
  ShoppingCartState,
  GroceryCategory,
  ShoppingListItemStatus,
  GroupedShoppingListItems,
} from '../types/shoppingList';
import {categorizeIngredient, suggestUnit, estimatePrice} from '../utils/ingredientCategorizer';

export interface UseShoppingListOptions {
  userId: string;
  listId?: string;
  autoSave?: boolean;
}

const DEFAULT_VIEW_MODE: ShoppingListViewMode = {
  groupBy: 'category',
  sortBy: 'name',
  sortOrder: 'asc',
  showCompleted: true,
  showPrices: true,
};

const CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: 'Frutas e Vegetais',
  meat: 'Carnes e Peixes',
  dairy: 'Laticínios',
  bakery: 'Padaria',
  pantry: 'Despensa',
  frozen: 'Congelados',
  beverages: 'Bebidas',
  snacks: 'Lanches',
  condiments: 'Condimentos',
  spices: 'Temperos',
  cleaning: 'Limpeza',
  other: 'Outros',
};

const CATEGORY_ORDER: GroceryCategory[] = [
  'produce',
  'meat',
  'dairy',
  'bakery',
  'pantry',
  'frozen',
  'beverages',
  'snacks',
  'condiments',
  'spices',
  'cleaning',
  'other',
];

export const useShoppingList = ({
  userId,
  listId,
  autoSave = true,
}: UseShoppingListOptions) => {
  const [viewMode, setViewMode] = useState<ShoppingListViewMode>(DEFAULT_VIEW_MODE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // API hooks
  const {
    data: shoppingLists = [],
    isLoading: loadingLists,
    refetch: refetchLists,
  } = useGetShoppingListsQuery({userId});

  const {
    data: currentList,
    isLoading: loadingCurrentList,
    refetch: refetchCurrentList,
  } = useGetShoppingListQuery(listId || '', {
    skip: !listId,
  });

  const {data: preferences} = useGetShoppingListPreferencesQuery(userId);

  const {data: ingredientSuggestions = []} = useGetIngredientSuggestionsQuery(
    {
      query: searchQuery,
      limit: 5,
    },
    {skip: searchQuery.length < 2}
  );

  // Mutations
  const [createShoppingList] = useCreateShoppingListMutation();
  const [updateShoppingList] = useUpdateShoppingListMutation();
  const [deleteShoppingList] = useDeleteShoppingListMutation();
  const [addShoppingListItem] = useAddShoppingListItemMutation();
  const [updateShoppingListItem] = useUpdateShoppingListItemMutation();
  const [deleteShoppingListItem] = useDeleteShoppingListItemMutation();
  const [bulkUpdateItems] = useBulkUpdateShoppingListItemsMutation();
  const [generateFromMealPlan] = useGenerateFromMealPlanMutation();

  // Computed values
  const activeList = useMemo(() => {
    return currentList || shoppingLists.find(list => list.status === 'active');
  }, [currentList, shoppingLists]);

  const filteredItems = useMemo(() => {
    if (!activeList) return [];

    let items = activeList.items;

    // Apply search filter
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (!viewMode.showCompleted) {
      items = items.filter(item => item.status !== 'purchased');
    }

    // Apply sorting
    items = [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (viewMode.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'price':
          comparison = (a.estimatedPrice || 0) - (b.estimatedPrice || 0);
          break;
        case 'date':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
      }
      
      return viewMode.sortOrder === 'desc' ? -comparison : comparison;
    });

    return items;
  }, [activeList, searchQuery, viewMode]);

  const groupedItems = useMemo((): GroupedShoppingListItems => {
    const grouped = {} as GroupedShoppingListItems;
    
    // Initialize all categories
    CATEGORY_ORDER.forEach(category => {
      grouped[category] = [];
    });

    // Group items by category
    filteredItems.forEach(item => {
      grouped[item.category].push(item);
    });

    return grouped;
  }, [filteredItems]);

  const cartState = useMemo((): ShoppingCartState => {
    if (!activeList) {
      return {
        selectedItems: [],
        totalItems: 0,
        totalPrice: 0,
        estimatedTotal: 0,
        completionPercentage: 0,
      };
    }

    const totalItems = activeList.items.length;
    const purchasedItems = activeList.items.filter(item => item.status === 'purchased');
    const totalPrice = purchasedItems.reduce((sum, item) => sum + (item.actualPrice || 0), 0);
    const estimatedTotal = activeList.items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

    return {
      selectedItems,
      totalItems,
      totalPrice,
      estimatedTotal,
      completionPercentage: totalItems > 0 ? (purchasedItems.length / totalItems) * 100 : 0,
    };
  }, [activeList, selectedItems]);

  // Actions
  const createNewList = useCallback(async (name: string, description?: string) => {
    try {
      const result = await createShoppingList({
        userId,
        name,
        description,
      }).unwrap();
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a lista de compras');
      throw error;
    }
  }, [createShoppingList, userId]);

  const addItem = useCallback(async (
    name: string,
    quantity: number,
    unit: string,
    category?: GroceryCategory,
    estimatedPrice?: number
  ) => {
    if (!activeList) return;

    // Auto-categorize if no category provided
    const finalCategory = category || categorizeIngredient(name);
    
    // Auto-estimate price if not provided
    const finalPrice = estimatedPrice || estimatePrice(name, quantity, unit);

    try {
      const result = await addShoppingListItem({
        listId: activeList.id,
        name,
        quantity,
        unit,
        category: finalCategory,
        estimatedPrice: finalPrice,
        recipeIds: [],
      }).unwrap();
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o item');
      throw error;
    }
  }, [addShoppingListItem, activeList]);

  const updateItemStatus = useCallback(async (
    itemId: string,
    status: ShoppingListItemStatus,
    actualPrice?: number
  ) => {
    try {
      const result = await updateShoppingListItem({
        id: itemId,
        status,
        actualPrice,
      }).unwrap();
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o item');
      throw error;
    }
  }, [updateShoppingListItem]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      await deleteShoppingListItem(itemId).unwrap();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o item');
      throw error;
    }
  }, [deleteShoppingListItem]);

  const generateListFromMealPlan = useCallback(async (
    mealPlanIds: string[],
    name: string,
    consolidateDuplicates = true
  ) => {
    try {
      const result = await generateFromMealPlan({
        userId,
        name,
        mealPlanIds,
        consolidateDuplicates,
      }).unwrap();
      return result;
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar a lista do meal plan');
      throw error;
    }
  }, [generateFromMealPlan, userId]);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const markSelectedAsPurchased = useCallback(async () => {
    if (selectedItems.length === 0) return;

    try {
      const updates = selectedItems.map(id => ({
        id,
        status: 'purchased' as ShoppingListItemStatus,
      }));

      await bulkUpdateItems({items: updates}).unwrap();
      clearSelection();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível marcar os itens como comprados');
      throw error;
    }
  }, [selectedItems, bulkUpdateItems, clearSelection]);

  return {
    // Data
    shoppingLists,
    activeList,
    filteredItems,
    groupedItems,
    cartState,
    preferences,
    ingredientSuggestions,
    
    // UI State
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedItems,
    isEditing,
    setIsEditing,
    
    // Loading states
    loadingLists,
    loadingCurrentList,
    
    // Actions
    createNewList,
    addItem,
    updateItemStatus,
    removeItem,
    generateListFromMealPlan,
    toggleItemSelection,
    clearSelection,
    markSelectedAsPurchased,
    refetchLists,
    refetchCurrentList,
    
    // Utils
    categoryLabels: CATEGORY_LABELS,
    categoryOrder: CATEGORY_ORDER,
    
    // Smart suggestions
    suggestCategory: categorizeIngredient,
    suggestUnit,
    estimatePrice,
  };
};