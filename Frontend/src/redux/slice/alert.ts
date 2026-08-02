import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Structural definition for the global application notification alert state.
 */
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
    /**
     * Toggles the alert display state to active and populates the notification layout metadata.
     * 
     * @param state - The active mutable slice state layout tracker.
     * @param action - The incoming payload action carrying the targeted text body and context severity.
     */
    showAlert: (state, action: PayloadAction<{ message: string; severity?: AlertState['severity'] }>) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity || 'info';
    },
    /**
     * Resets the active notification alert layout, hiding the view component from viewports.
     * 
     * @param state - The active mutable slice state layout tracker.
     */
    hideAlert: (state) => {
      state.open = false;
      state.message = '';
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;