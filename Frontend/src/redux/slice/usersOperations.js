import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const appApi = createApi({
  reducerPath: "appApi",
  tagTypes: ["User", "Ticket"],
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
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    // 4. Get All User Tickets
    getUserTickets: builder.query({
      query: () => "booking/fetchalltickets",
      providesTags: (result) =>
        result && result.userTickets
          ? [
            // Fixed: Arrow function correctly structured
            ...result.userTickets.map(({ ticket_id }) => ({ type: "Ticket", id: ticket_id })),
            { type: "Ticket", id: "LIST" },
          ]
          // Fixed: Added missing {} around the object
          : [{ type: "Ticket", id: "LIST" }],
    }),

    //5. Book Ticket
    bookTicket: builder.mutation({
      query: ({ showId }) => ({
        url: `booking/bookticket/${showId}`,
        method: "PUT", // Ensure your backend isn't expecting POST
      }),
      // This tells RTK Query: "Anything involving tickets is now outdated, refresh it!"
      invalidatesTags: (result, error, { showId }) => [
        { type: "Ticket", id: "LIST" }
      ],
    }),

    //6. Delete Ticket
    cancelTicket: builder.mutation({
      query: ({ ticket_id }) => ({
        url: `booking/deleteticket/${ticket_id}`,
        method: "DELETE"
      }),
      // Destructure { ticket_id } from the 3rd argument (arg)
      invalidatesTags: (result, error, { ticket_id }) => [
        { type: "Ticket", id: ticket_id }, // Invalidates that specific ticket
        { type: "Ticket", id: "LIST" }     // Refreshes the whole list
      ]
    })
  }),
});

// Export all the hooks at once
export const {
  useCreateUserMutation,
  useLoginMutation,
  useGetUserQuery,
  useGetUserTicketsQuery,
  useBookTicketMutation,
  useCancelTicketMutation
} = appApi;