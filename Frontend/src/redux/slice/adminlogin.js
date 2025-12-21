import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for verifying the organizer
export const verifyAdmin = createAsyncThunk(
  "verifyAdmin",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/organizers/adminlogin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        }
      );

      const json = await response.json();
      console.log("Response from reducer:", json);

      if (json.success) {
        localStorage.setItem("token", json.authtoken);
        return json; // Return json so Redux state updates correctly
      } else {
        return rejectWithValue("Invalid credentials");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Organizer login slice
const AdminLogin = createSlice({
  name: "ologin",
  initialState: {
    isLoading: false,
    alogin: false,
    isError: false,
    errorMessage: "",
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyAdmin.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(verifyAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.alogin = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(verifyAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "Something went wrong!";
      });
  },
});

export default organizerLogin.reducer;
