import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const verifyAdmin = createAsyncThunk(
    "verifyAdmin",
    async (credentials,{rejectWithValue})=>{
        try {
            const response = await fetch(
                "http://localhost:5001/api/organizers/adminlogin",
                {
                    method: "POST",
                    headers:{
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password
                    })
                }
            )
            const json = await response.json()
            console.log("Response from Reducer", json)
            if(response.success){
                localStorage.setItem("token",json)
                return json
            }
            else{
                return rejectWithValue("Invalid Credentials")
            }
        } catch (error) {
            return rejectWithValue(error.message);
    }
  }
);

const AdminLogin = createSlice({
    name: "ologin",
    initialState: {
        isLoading: false,
        ologin: false,
        isError: false,
        errorMessage: ""
    },
    extraReducers: (builder)=>{
        builder
        .addCase(verifyAdmin.pending, (state)=>{
            state.isLoading = false,
            state.isError = false,
            state.errorMessage = ""
        })
        .addCase(verifyAdmin.fulfilled, (state)=>{
            state.isLoading = false,
            state.ologin = true,
            state.isError = false,
            state.errorMessage = ""
        })
        .addCase(verifyAdmin.rejected, (state,action)=>{
            state.isLoading = false,
            state.isError = false,
            state.errorMessage = action.payload || "Something went wrong!"
        })
    }
})

export default organizerLogin.reducer;