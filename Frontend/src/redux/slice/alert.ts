import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. EXPORT the interface so store.ts can "see" it
export interface AlertState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

const initialState: AlertState = {
  open: false,
  message: '',
  severity: 'info',
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    // 3. Use PayloadAction to type the incoming data
    showAlert: (state, action: PayloadAction<{ message: string; severity?: AlertState['severity'] }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
    },
    hideAlert: (state) => {
      state.open = false;
      state.message = ''; // Good practice to clear message on hide
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;