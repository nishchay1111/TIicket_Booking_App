import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert as MuiAlert } from '@mui/material'; // Renamed import to avoid conflict
import { hideAlert } from '../../redux/slice/alert'; 

export default function GlobalAlert() { // Renamed component
  const dispatch = useDispatch();
  
  // Accessing the state from your store.js 'alert' reducer
  const { open, message, severity } = useSelector((state) => state.alert);

  const handleClose = (event,reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideAlert());
  };

  return (
    <Snackbar open={open} autoHideDuration={1500} onClose ={handleClose}anchorOrigin={{ vertical:'top',horizontal:'center' }}>
      <MuiAlert 
        onClose={handleClose} // Adds the 'X' button
        severity={severity} 
        variant="filled" 
        sx={{ width: '100%' }}
      >{message}
      </MuiAlert>
    </Snackbar>
  );
}