import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const verifyOrganizer = createAsyncThunk("verifyOrganizer", async(credentials, {rejectWithValue})=>{
    try {
        const response  = await fetch("http://localhost:5000/api/organizers/loginorganizer",{
            method: "POST",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            }),
        });
        const json = await response.json();
        console.log("Response from reducer:", json);
        if(json.success){
            localStorage.setItem("token",json.authtoken);
            return json;
        }
        else{
            return rejectWithValue("Invalid credentials");
        }        
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

const organizerLogin = createSlice({
    name: "ologin",
    initialState:{
        isLoading: false,
        ologin: false,
        isError: false,
        errorMessage: ""
    },
    extraReducers: (builder)=>{
        builder.addCase(verifyOrganizer.pending,(state)=>{
            state.isLoading = true;
            state.isError = false;
            state.isError = "";
        });
        builder.addCase(verifyOrganizer.fulfilled, (state)=>{
            state.isLoading = false;
            state.ologin = true;
            state.isError = false;
            state.errorMessage = ""
            
        });
        builder.addCase(verifyOrganizer.rejected, (state,action)=>{
            state.isLoading = false;
            state.isError = true;
            state.errorMessage = action.payload || "Something went wrong!";
        });
    }
})

export default organizerLogin.reducer;