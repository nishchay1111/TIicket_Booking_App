import { configureStore } from '@reduxjs/toolkit';
import { appApi } from './slice/usersOperations'; // Ensure this path is correct!
import alertReducer from './slice/alert';

export const store = configureStore({
  reducer: {
    // This connects the RTK Query cache to your store
    [appApi.reducerPath]: appApi.reducer,
    alert: alertReducer,
  },
  // This middleware is required for RTK Query to work
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(appApi.middleware),
});