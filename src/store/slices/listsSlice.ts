import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
} from '@reduxjs/toolkit';
import {CustomList, ListFilters} from '@/types/lists';
import {RootState} from '@/types/store';

// Entity adapter para gerenciar listas de forma normalizada
const listsAdapter = createEntityAdapter<CustomList>();

// Estado das listas
interface ListsState {
  // Entity state
  ids: string[];
  entities: Record<string, CustomList>;
  
  // Loading states
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Paginação
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  
  // Filtros
  filters: ListFilters;
  
  // UI state
  selectedListId: string | null;
  isCreating: boolean;
  isEditing: boolean;
  
  // Drag and drop
  draggedRecipeId: string | null;
  dropTargetListId: string | null;
  
  // Compartilhamento
  shareModalVisible: boolean;
  shareCode: string | null;
  
  // Estatísticas
  stats: {
    totalLists: number;
    totalRecipes: number;
    mostUsedTags: string[];
    averageRecipesPerList: number;
  } | null;
}

// Estado inicial
const initialState: ListsState = {
  ...listsAdapter.getInitialState(),
  loading: false,
  error: null,
  lastFetch: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  filters: {},
  selectedListId: null,
  isCreating: false,
  isEditing: false,
  draggedRecipeId: null,
  dropTargetListId: null,
  shareModalVisible: false,
  shareCode: null,
  stats: null,
};

// Slice
const listsSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Listas
    setLists: (state, action: PayloadAction<CustomList[]>) => {
      listsAdapter.setAll(state, action.payload);
      state.lastFetch = Date.now();
    },
    addList: (state, action: PayloadAction<CustomList>) => {
      listsAdapter.addOne(state, action.payload);
    },
    updateList: (
      state,
      action: PayloadAction<{id: string; changes: Partial<CustomList>}>,
    ) => {
      listsAdapter.updateOne(state, action.payload);
    },
    removeList: (state, action: PayloadAction<string>) => {
      listsAdapter.removeOne(state, action.payload);
      // Limpar seleção se a lista removida estava selecionada
      if (state.selectedListId === action.payload) {
        state.selectedListId = null;
      }
    },
    addLists: (state, action: PayloadAction<CustomList[]>) => {
      listsAdapter.addMany(state, action.payload);
      state.lastFetch = Date.now();
    },
    
    // Paginação
    setPagination: (
      state,
      action: PayloadAction<Partial<ListsState['pagination']>>,
    ) => {
      state.pagination = {...state.pagination, ...action.payload};
    },
    resetPagination: state => {
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: true,
      };
    },
    
    // Filtros
    setFilters: (state, action: PayloadAction<ListFilters>) => {
      state.filters = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<ListFilters>>) => {
      state.filters = {...state.filters, ...action.payload};
    },
    clearFilters: state => {
      state.filters = {};
    },
    
    // UI state
    setSelectedList: (state, action: PayloadAction<string | null>) => {
      state.selectedListId = action.payload;
    },
    setCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },
    setEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    
    // Drag and drop
    setDraggedRecipe: (state, action: PayloadAction<string | null>) => {
      state.draggedRecipeId = action.payload;
    },
    setDropTarget: (state, action: PayloadAction<string | null>) => {
      state.dropTargetListId = action.payload;
    },
    
    // Receitas nas listas
    addRecipeToList: (
      state,
      action: PayloadAction<{listId: string; recipeId: string}>,
    ) => {
      const {listId, recipeId} = action.payload;
      const list = state.entities[listId];
      if (list && !list.recipeIds.includes(recipeId)) {
        list.recipeIds.push(recipeId);
        list.recipesCount = list.recipeIds.length;
        list.lastModified = new Date();
      }
    },
    removeRecipeFromList: (
      state,
      action: PayloadAction<{listId: string; recipeId: string}>,
    ) => {
      const {listId, recipeId} = action.payload;
      const list = state.entities[listId];
      if (list) {
        list.recipeIds = list.recipeIds.filter(id => id !== recipeId);
        list.recipesCount = list.recipeIds.length;
        list.lastModified = new Date();
      }
    },
    reorderListRecipes: (
      state,
      action: PayloadAction<{listId: string; recipeIds: string[]}>,
    ) => {
      const {listId, recipeIds} = action.payload;
      const list = state.entities[listId];
      if (list) {
        list.recipeIds = recipeIds;
        list.lastModified = new Date();
      }
    },
    
    // Compartilhamento
    setShareModalVisible: (state, action: PayloadAction<boolean>) => {
      state.shareModalVisible = action.payload;
    },
    setShareCode: (state, action: PayloadAction<string | null>) => {
      state.shareCode = action.payload;
    },
    
    // Estatísticas
    setStats: (state, action: PayloadAction<ListsState['stats']>) => {
      state.stats = action.payload;
    },
    
    // Reset
    resetLists: () => {
      return initialState;
    },
  },
});

// Selectors usando entity adapter
export const {
  selectAll: selectAllLists,
  selectById: selectListById,
  selectIds: selectListIds,
  selectEntities: selectListEntities,
  selectTotal: selectTotalLists,
} = listsAdapter.getSelectors((state: any) => state.lists);

// Selectors customizados
export const selectUserLists = (state: any, userId: string) => {
  return selectAllLists(state).filter(list => list.userId === userId);
};

export const selectPublicLists = (state: any) => {
  return selectAllLists(state).filter(list => list.isPublic);
};

export const selectListsByTag = (state: any, tag: string) => {
  return selectAllLists(state).filter(list => list.tags.includes(tag));
};

export const selectListsWithRecipe = (state: any, recipeId: string) => {
  return selectAllLists(state).filter(list => 
    list.recipeIds.includes(recipeId)
  );
};

export const selectFilteredLists = (state: any) => {
  const lists = selectAllLists(state);
  const {filters} = state.lists;
  
  return lists.filter(list => {
    // Filtro por usuário
    if (filters.userId && list.userId !== filters.userId) {
      return false;
    }
    
    // Filtro por visibilidade
    if (filters.isPublic !== undefined && list.isPublic !== filters.isPublic) {
      return false;
    }
    
    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag: string) => list.tags.includes(tag))) {
        return false;
      }
    }
    
    // Filtro por ter receitas
    if (filters.hasRecipes !== undefined) {
      const hasRecipes = list.recipeIds.length > 0;
      if (filters.hasRecipes !== hasRecipes) {
        return false;
      }
    }
    
    return true;
  });
};

export const selectSelectedList = (state: any) => {
  return state.lists.selectedListId 
    ? selectListById(state, state.lists.selectedListId)
    : null;
};

export const selectListsStats = (state: any) => {
  return state.lists.stats;
};

export const {
  setLoading,
  setError,
  setLists,
  addList,
  updateList,
  removeList,
  addLists,
  setPagination,
  resetPagination,
  setFilters,
  updateFilters,
  clearFilters,
  setSelectedList,
  setCreating,
  setEditing,
  setDraggedRecipe,
  setDropTarget,
  addRecipeToList,
  removeRecipeFromList,
  reorderListRecipes,
  setShareModalVisible,
  setShareCode,
  setStats,
  resetLists,
} = listsSlice.actions;

export default listsSlice.reducer;