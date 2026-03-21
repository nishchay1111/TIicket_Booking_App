import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// 1. EXPORT the interface so store.ts can "see" it
export interface AdminLoginState {
  isLoading: boolean;
  alogin: boolean;
  isError: boolean;
  errorMessage: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  authtoken?: string;
  error?: string;
}

// Async thunk: <Returned, ThunkArg, ThunkApiConfig>
export const verifyAdmin = createAsyncThunk<AuthResponse, Credentials, { rejectValue: string }>(
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

      const json: AuthResponse = await response.json();

      if (json.success && json.authtoken) {
        localStorage.setItem("token", json.authtoken);
        return json; 
      } else {
        return rejectWithValue(json.error || "Invalid credentials");
      }
    } catch (error: any) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

const initialState: AdminLoginState = {
  isLoading: false,
  alogin: false,
  isError: false,
  errorMessage: "",
};

const adminLoginSlice = createSlice({
  name: "ologin",
  initialState,
  reducers: {
    // Optional: Add a logout reducer to reset state
    logoutAdmin: (state) => {
      state.alogin = false;
      state.isLoading = false;
      localStorage.removeItem("token");
    }
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
      })
      .addCase(verifyAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        // action.payload is now correctly typed as string because of the generic above
        state.errorMessage = action.payload || "Something went wrong!";
      });
  },
});

export const { logoutAdmin } = adminLoginSlice.actions;
export default adminLoginSlice.reducer;