import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUser = createAsyncThunk('fetchUser', async()=>{
    const response =await fetch("http://localhost:5000/api/auth/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
      });
    return response.json()
})

const currentUser = createSlice({
    name: "user",
    initialState: {
        isLoading: false,
        user: null,  // ✅ Change "data" to "user"
        isError: false
    },
    extraReducers: (builder) => {
        builder.addCase(fetchUser.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.user = action.payload; // ✅ Set "user" instead of "data"
        });
        builder.addCase(fetchUser.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        });
    }
});

export default currentUser.reducer;