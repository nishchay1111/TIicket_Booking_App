import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './slice/alert';
import { appApi } from './slice/usersOperations';
import { organizerApi } from './slice/organizerOperations';
import { injectStore } from '../api/axiosInstance'; // Import the injector

export const store = configureStore({
  reducer: {
    alert: alertReducer,
    [appApi.reducerPath]: appApi.reducer,
    [organizerApi.reducerPath]: organizerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appApi.middleware, organizerApi.middleware),
});

// CRITICAL: Inject the store instance into your Axios file
injectStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;