// src/components/Alert.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearAlert } from '../redux/slice/alert'; // Import clearAlert action
import alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

export const Alert = () => {
    const dispatch = useDispatch();
    const alert = useSelector((state) => state.alert.alert); // Access alert from Redux

    useEffect(() => {
        if (alert) {
            // Automatically clear alert after 5 seconds
            const timer = setTimeout(() => {
                dispatch(clearAlert());
            }, 5000);

            // Cleanup timeout if alert changes before timeout
            return () => clearTimeout(timer);
        }
    }, [alert, dispatch]);

    if (!alert) return null; // If there's no alert, return null

    return (
        <div role="alert">
            <div className={`bg-${alert.type}-500 text-white font-bold rounded-t px-4 py-2`}>
                {alert.title}
            </div>
            <div className={`border border-t-0 border-${alert.type}-400 rounded-b bg-${alert.type}-100 px-4 py-3 text-${alert.type}-700`}>
                <p>{alert.msg}</p>
            </div>
        </div>
    );
};

{/*  */ }
