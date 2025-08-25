import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from '@/services/api';
import {planningApi} from '@/services/planningApi';
import {ratingsApi} from '@/services/ratingsApi';
import {shoppingListApi} from '@/services/shoppingListApi';
import {cookingModeApi} from '@/services/cookingModeApi';
import {sharingApi} from '@/services/sharingApi';
import {communityApi} from '../services/communityApi';

// Importar reducers
import authReducer from './slices/authSlice';
import recipesReducer from './slices/recipesSlice';
import planningReducer from './slices/planningSlice';
import listsReducer from './slices/listsSlice';
import uiReducer from './slices/uiSlice';

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  recipes: recipesReducer,
  planning: planningReducer,
  lists: listsReducer,
  ui: uiReducer,
  [api.reducerPath]: api.reducer,
  [planningApi.reducerPath]: planningApi.reducer,
  [ratingsApi.reducerPath]: ratingsApi.reducer,
  [shoppingListApi.reducerPath]: shoppingListApi.reducer,
  [cookingModeApi.reducerPath]: cookingModeApi.reducer,
  [sharingApi.reducerPath]: sharingApi.reducer,
  [communityApi.reducerPath]: communityApi.reducer,
});

// Configuração de persistência
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'recipes', 'planning', 'lists'], // Apenas estes serão persistidos
  blacklist: ['ui', api.reducerPath, planningApi.reducerPath, ratingsApi.reducerPath, shoppingListApi.reducerPath, cookingModeApi.reducerPath, sharingApi.reducerPath, communityApi.reducerPath], // UI e API não devem ser persistidos
};

// Reducer com persistência
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredPaths: ['register'],
      },
    }).concat(api.middleware, planningApi.middleware, ratingsApi.middleware, shoppingListApi.middleware, cookingModeApi.middleware, sharingApi.middleware, communityApi.middleware),
  devTools: __DEV__,
});

// Persistor
export const persistor = persistStore(store);

// Tipos
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Hooks tipados
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Função para limpar store (logout)
export const clearStore = () => {
  persistor.purge();
  store.dispatch({type: 'RESET_STORE'});
};
