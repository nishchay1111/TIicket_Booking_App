import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTickets = createAsyncThunk('fetchTickets', async () => {
    const token = localStorage.getItem("token");
    console.log("Using auth-token:", token);
    const response = await fetch("http://localhost:5001/api/booking/fetchalltickets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // ✅ Fixed Content-Type
            "auth-token": localStorage.getItem("token")
        }
    });
    const data = await response.json();
    console.log("API Response:", data); // ✅ Log API response
    return data;
});

const allTickets = createSlice({
    name: "alltickets",
    initialState: {
        isLoading: false,
        tickets: [],
        isError: false
    },
    extraReducers: (builder) => {
        builder.addCase(fetchTickets.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchTickets.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tickets = action.payload;
        });
        builder.addCase(fetchTickets.rejected, (state) => { // ✅ Fixed pending → rejected
            state.isLoading = false;
            state.isError = true;
        });
    }
});

export default allTickets.reducer;