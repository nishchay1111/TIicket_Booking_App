import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk for verifying the organizer
export const verifyOrganizer = createAsyncThunk(
  "verifyOrganizer",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/organizers/loginorganizer",
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
const organizerLogin = createSlice({
  name: "ologin",
  initialState: {
    isLoading: false,
    ologin: false,
    isError: false,
    errorMessage: "",
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyOrganizer.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(verifyOrganizer.fulfilled, (state) => {
        state.isLoading = false;
        state.ologin = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(verifyOrganizer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || "Something went wrong!";
      });
  },
});

export default organizerLogin.reducer;
