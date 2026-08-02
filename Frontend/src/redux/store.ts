import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './slice/alert';
import { appApi } from './slice/usersOperations';
import { organizerApi } from './slice/organizerOperations';
import { injectStore } from '../api/axiosInstance';

/**
 * Global application Redux store instance configuration.
 * Consolidates slice reducers, configures custom RTK Query service middlewares,
 * and initializes cross-tier dependencies.
 */
export const store = configureStore({
  reducer: {
    alert: alertReducer,
    [appApi.reducerPath]: appApi.reducer,
    [organizerApi.reducerPath]: organizerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appApi.middleware, organizerApi.middleware),
});

injectStore(store);

/**
 * Infer the comprehensive state tree structure directly from the configured store instance.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * Infer the pre-configured dispatch function type mapping out active store action types.
 */
export type AppDispatch = typeof store.dispatch;