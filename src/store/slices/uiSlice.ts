import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UIState} from '@/types/store';

// Estado inicial
const initialState: UIState = {
  activeScreen: 'Home',
  modals: {
    importRecipe: false,
    createRecipe: false,
    editProfile: false,
    settings: false,
  },
  bottomSheet: {
    isOpen: false,
    content: null,
    data: undefined,
  },
  toast: {
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  },
  loading: {
    global: false,
    screens: {},
    actions: {},
  },
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Navegação
    setActiveScreen: (state, action: PayloadAction<string>) => {
      state.activeScreen = action.payload;
    },

    // Modais
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: state => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },

    // Bottom Sheet
    openBottomSheet: (
      state,
      action: PayloadAction<{
        content: UIState['bottomSheet']['content'];
        data?: any;
      }>,
    ) => {
      state.bottomSheet.isOpen = true;
      state.bottomSheet.content = action.payload.content;
      state.bottomSheet.data = action.payload.data;
    },
    closeBottomSheet: state => {
      state.bottomSheet.isOpen = false;
      state.bottomSheet.content = null;
      state.bottomSheet.data = undefined;
    },

    // Toast
    showToast: (
      state,
      action: PayloadAction<{
        message: string;
        type?: UIState['toast']['type'];
        duration?: number;
      }>,
    ) => {
      state.toast.visible = true;
      state.toast.message = action.payload.message;
      state.toast.type = action.payload.type || 'info';
      state.toast.duration = action.payload.duration || 3000;
    },
    hideToast: state => {
      state.toast.visible = false;
      state.toast.message = '';
    },

    // Loading states
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setScreenLoading: (
      state,
      action: PayloadAction<{screen: string; loading: boolean}>,
    ) => {
      const {screen, loading} = action.payload;
      state.loading.screens[screen] = loading;
    },
    setActionLoading: (
      state,
      action: PayloadAction<{action: string; loading: boolean}>,
    ) => {
      const {action: actionName, loading} = action.payload;
      state.loading.actions[actionName] = loading;
    },
    clearScreenLoading: (state, action: PayloadAction<string>) => {
      delete state.loading.screens[action.payload];
    },
    clearActionLoading: (state, action: PayloadAction<string>) => {
      delete state.loading.actions[action.payload];
    },
    clearAllLoading: state => {
      state.loading.global = false;
      state.loading.screens = {};
      state.loading.actions = {};
    },

    // Reset
    resetUI: () => initialState,
  },
});

// Selectors
export const selectIsModalOpen = (
  state: {ui: UIState},
  modal: keyof UIState['modals'],
) => {
  return state.ui.modals[modal];
};

export const selectIsAnyModalOpen = (state: {ui: UIState}) => {
  return Object.values(state.ui.modals).some(isOpen => isOpen);
};

export const selectIsScreenLoading = (state: {ui: UIState}, screen: string) => {
  return state.ui.loading.screens[screen] || false;
};

export const selectIsActionLoading = (state: {ui: UIState}, action: string) => {
  return state.ui.loading.actions[action] || false;
};

export const selectIsAnyLoading = (state: {ui: UIState}) => {
  return (
    state.ui.loading.global ||
    Object.values(state.ui.loading.screens).some(loading => loading) ||
    Object.values(state.ui.loading.actions).some(loading => loading)
  );
};

export const {
  setActiveScreen,
  openModal,
  closeModal,
  closeAllModals,
  openBottomSheet,
  closeBottomSheet,
  showToast,
  hideToast,
  setGlobalLoading,
  setScreenLoading,
  setActionLoading,
  clearScreenLoading,
  clearActionLoading,
  clearAllLoading,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
