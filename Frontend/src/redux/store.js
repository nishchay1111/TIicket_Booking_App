import { configureStore } from '@reduxjs/toolkit';
import { appApi } from './slice/usersOperations'; 
import { organizerApi } from './slice/organizerOperations'; 
import alertReducer from './slice/alert';

export const store = configureStore({
  reducer: {
    // Connects both RTK Query caches to your store
    [appApi.reducerPath]: appApi.reducer,
    [organizerApi.reducerPath]: organizerApi.reducer, // Added this
    alert: alertReducer,
  },
  // Middleware is essential for caching, invalidation (Tags), and polling
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(appApi.middleware)
      .concat(organizerApi.middleware), // Added this
});