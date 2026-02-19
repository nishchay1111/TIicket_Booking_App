import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const appApi = createApi({
  reducerPath: "appApi",
  tagTypes: ["User"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/api/",
    prepareHeaders: (headers)=>{
      const token = localStorage.getItem("token")
      if(token){
        headers.set("auth-token",token)
      }
      return headers
    }
  }),
  endpoints: (builder)=> ({
    createUser: builder.mutation({
      query: (newUser)=>({
        url: "api/createuser",
        method: "POST",
        body: newUser
      }),
      invalidatesTags: ["User"]
    }),
    login: builder.mutation({
      query: (credentials)=({
        url: "api/login",
        method: "POST",
        body: credentials
      })
    }),
    getUser: builder.query({
      query: ()=>({
        url: "api/getuser",
        method: "POST"
      }),
      providesTags: ["User"]
    })
  })
})

export const {
  useCreateUserMutation, 
  useLoginMutation, 
  useGetUserQuery
} = appApi