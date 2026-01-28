import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const ticketsApi = createApi({
  reducerPath: "ticketsApi",
  tagTypes: ["Ticket","Event"], 
  baseQuery: fetchBaseQuery({ 
    baseUrl: "http://localhost:5001/api/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("auth-token", token);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // 1. Fetch All User
    createUser: builder.mutation({
      query: (allTickets) => ({
        url: "booking/fetchallticket",
        method: "POST",
        body: allTickets,
      }),
      // Optional: You can invalidate "User" if you want to clear old data
      invalidatesTags: ["Ticket"],
    }),

    // 2. 
    login: builder.mutation({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"], 
    }),

    // 3. GET USER
    getUser: builder.query({
      query: () => ({
        url: "auth/getuser",
        method: "POST",
      }),
      providesTags: ["User"],
    }),
  }),
});

// Export all the hooks at once
export const { 
  useCreateUserMutation, 
  useLoginMutation, 
  useGetUserQuery 
} = appApi;