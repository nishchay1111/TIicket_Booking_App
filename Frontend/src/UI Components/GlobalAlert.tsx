import React from 'react';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../redux/hooks'; 
import { hideAlert, showAlert } from '../redux/slice/alert'; 

export default function GlobalAlert() {
  const dispatch = useAppDispatch();
  
  const { open, message, severity } = useAppSelector((state) => state.alert);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    dispatch(hideAlert());
  };

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={1500} 
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert 
        onClose={handleClose} 
        severity={severity as AlertColor} 
        variant="filled" 
        sx={{ width: '100%' }}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
}