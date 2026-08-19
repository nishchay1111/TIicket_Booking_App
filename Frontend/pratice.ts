import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AlertState {
    open: boolean,
    message: string,
    severity: 'info' | 'warning' | 'success' | 'error'
}

const initialState: AlertState = {
    open: false,
    message: '',
    severity: 'info'
}

const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        showAlert: (state, action: PayloadAction<{ message: string; severity?: AlertState['severity'] }>) => {
            state.open = true;
            state.message = action.payload.message;
            state.severity = action.payload.severity || 'info';
        },
        hideAlert:(state)=>{
            state.open = false,
            state.message = ''
        }
    }
})