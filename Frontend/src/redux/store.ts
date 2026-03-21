import { configureStore } from '@reduxjs/toolkit';
import { appApi } from './slice/usersOperations'; 
import { organizerApi } from './slice/organizerOperations'; 
import alertReducer from './slice/alert';
import adminLoginReducer from './slice/adminlogin'; // 1. Import your admin login reducer

export const store = configureStore({
  reducer: {
    [appApi.reducerPath]: appApi.reducer,
    [organizerApi.reducerPath]: organizerApi.reducer,
    alert: alertReducer,
    alogin: adminLoginReducer, // 2. Register it here so state.alogin exists
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(appApi.middleware)
      .concat(organizerApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;