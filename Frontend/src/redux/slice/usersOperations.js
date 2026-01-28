import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const appApi = createApi({
  reducerPath: "appApi",
  tagTypes: ["User"], 
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
    // 1. CREATE USER (Register)
    createUser: builder.mutation({
      query: (newUser) => ({
        url: "auth/createuser", // Adjust this to match your Python route
        method: "POST",
        body: newUser,
      }),
      // Optional: You can invalidate "User" if you want to clear old data
      invalidatesTags: ["User"],
    }),

    // 2. LOGIN
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