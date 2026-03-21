import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// --- 1. Define Interfaces for your Data ---
export interface Ticket {
  ticket_id: string;
  event_name: string;
  show_date: string;
  total_price: number;
  number_of_tickets: number;
}

export interface UserTicketsResponse {
  success: boolean;
  userTickets: Ticket[];
  message?: string;
}

// Define the shape of your User object
export interface User {
  id: string;
  name: string;
  email: string;
}

export const appApi = createApi({
  reducerPath: "appApi",
  tagTypes: ["User", "Ticket"],
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5001/api/",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        // Match the header name your backend expects (usually 'auth-token' or 'Authorization')
        headers.set("auth-token", token);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // 1. CREATE USER (Register)
    createUser: builder.mutation<any, any>({
      query: (newUser) => ({
        url: "auth/createuser",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),

    // 2. LOGIN
    login: builder.mutation<{ success: boolean; authtoken: string }, any>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),

    // 3. GET USER - This replaces your old 'fetchUser' logic
    getUser: builder.query<User, void>({
      query: () => ({
        url: "auth/getuser",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // 4. Get All User Tickets
    getUserTickets: builder.query<UserTicketsResponse, void>({
      query: () => "booking/fetchalltickets",
      providesTags: (result) =>
        result && result.userTickets
          ? [
            ...result.userTickets.map(({ ticket_id }) => ({ type: "Ticket" as const, id: ticket_id })),
            { type: "Ticket" as const, id: "LIST" },
          ]
          : [{ type: "Ticket" as const, id: "LIST" }],
    }),

    // 5. Book Ticket
    bookTicket: builder.mutation<any, { showId: string }>({
      query: ({ showId }) => ({
        url: `booking/bookticket/${showId}`,
        method: "PUT", 
      }),
      invalidatesTags: () => [{ type: "Ticket", id: "LIST" }],
    }),

    // 6. Delete Ticket
    cancelTicket: builder.mutation<any, { ticket_id: string }>({
      query: ({ ticket_id }) => ({
        url: `booking/deleteticket/${ticket_id}`,
        method: "DELETE"
      }),
      invalidatesTags: (result, error, { ticket_id }) => [
        { type: "Ticket", id: ticket_id }, 
        { type: "Ticket", id: "LIST" }     
      ]
    })
  }),
});

// These are the ONLY things you should export from this file
export const {
  useCreateUserMutation,
  useLoginMutation,
  useGetUserQuery, // Use this in your Profile component!
  useGetUserTicketsQuery,
  useBookTicketMutation,
  useCancelTicketMutation
} = appApi;