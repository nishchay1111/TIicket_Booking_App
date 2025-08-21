import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchEvents = createAsyncThunk('fetchEvents', async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:5000/api/booking/fetchallevents", {
    method: "GET", // Change to GET request
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` // Include token for authorization if necessary
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const data = await response.json();
  console.log("Events.js Reducer", data);
  return data;
});

const allEvents = createSlice({
  name: "events",
  initialState: {
    isLoading: false,
    events: [],
    isError: false
  },
  extraReducers: (builder) => {
    builder.addCase(fetchEvents.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.events = action.payload;
    });
    builder.addCase(fetchEvents.rejected, (state) => {
      state.isLoading = false;
      state.isError = true;
    });
  }
});

export default allEvents.reducer;
