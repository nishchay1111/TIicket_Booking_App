import { createSlice } from "@reduxjs/toolkit";
//HEllo

const alertSlice = createSlice({
  name: 'alert',
  initialState: {
    open: false,
    message: '',
    severity: 'info'
  },
  reducers:{
    showAlert:(state,action)=>{
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity||'info';
    },
    hideAlert: (state)=>{
      state.open = false;
    }
  }
});

export const {showAlert,hideAlert}=alert.actions
export default alertSlice.reducer