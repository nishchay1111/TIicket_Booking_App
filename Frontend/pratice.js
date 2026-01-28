import { createApi, fakeBaseQuery, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const usersApi = createApi({
  reducerPath: "userApi",
  tagTypes: ["User"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/api/",
    prepareHeaders: (headers)=>{
      token = localStorage.getItem("token")
      if(token){
        headers.set("auth-token",token)
      }
      return token
    }
  }),
  endpoints: (builder)=>({
    createUser: builder.mutation({
      query: (newUser)=>({
        url: "auth/createuser",
        method: "POST",
        body: newUser
      }),
      invalidatesTags: ["User"]
    }),

    login: builder.mutation({
      query: (credentials)=>({
        url: "auth/login",
        method: "POST",
        body: credentials
      }),
      invalidatesTags: ["User"]
    }),

   getUser: builder.query({
      query: () => ({
        url: "auth/getuser",
        method: "POST",
      }),
      providesTags: ["User"],
    }),
  })
})