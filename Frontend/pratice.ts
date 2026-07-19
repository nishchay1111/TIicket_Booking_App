import {configureStore} from '@reduxjs/toolkit'
import alertReducer from './src/redux/slice/alert'
import {appApi} from './src/redux/slice/usersOperations'
import {organizerApi} from './src/redux/slice/organizerOperations'
import {injectStore} from './src/api/axiosInstance'

export const store = configureStore({
    reducer:{
        alert: alertReducer,
        [appApi.reducerPath]: appApi.reducer,
        [organizerApi.reducerPath]: organizerApi.reducer
    },
    middleware:(getDefaultMiddleware)=>getDefaultMiddleware().concat(appApi.middleware,organizerApi.middleware)
})

injectStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch