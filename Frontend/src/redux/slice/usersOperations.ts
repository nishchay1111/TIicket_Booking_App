import { createApi } from "@reduxjs/toolkit/query/react";
// Add the 'type' keyword here
import type { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../api/axiosInstance";
// Add the 'type' keyword here as well
import type { AxiosRequestConfig, AxiosError } from "axios";

// --- 1. The Axios Base Query Wrapper ---
// This tells RTK Query: "Don't use fetch, use my Axios instance instead"
const axiosBaseQuery = (): BaseQueryFn<
  {
    url: string;
    method: AxiosRequestConfig["method"];
    data?: AxiosRequestConfig["data"];
    params?: AxiosRequestConfig["params"];
  },
  unknown,
  unknown
> => async ({ url, method, data, params }) => {
  try {
    const result = await axiosInstance({ url, method, data, params });
    return { data: result.data };
  } catch (axiosError) {
    let err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};

// --- 2. Interfaces ---
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

export interface User {
  success: boolean;
  user: {
    user_id: string;
    user_name: string;
    user_email: string;
    role: string;
    date_created: string;
  }
}

// --- 3. The API Definition ---
export const appApi = createApi({
  reducerPath: "appApi",
  tagTypes: ["User", "Ticket"],
  // Now using our custom Axios-backed base query
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createUser: builder.mutation<any, any>({
      query: (newUser) => ({ url: "auth/createuser", method: "POST", data: newUser }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation<{ success: boolean; authtoken: string }, any>({
      query: (credentials) => ({ url: "auth/login", method: "POST", data: credentials }),
      invalidatesTags: ["User"],
    }),

    getUser: builder.query<User, void>({
      query: () => ({
        url: 'auth/getuser',
        method: 'POST',  // 👈 must be POST
      }),
      providesTags: ['User'],
    }),

    getUserTickets: builder.query<UserTicketsResponse, void>({
      query: () => ({ url: "booking/fetchalltickets", method: "POST" }), // Changed to match your backend route
      providesTags: (result) =>
        result && result.userTickets
          ? [
            ...result.userTickets.map(({ ticket_id }) => ({ type: "Ticket" as const, id: ticket_id })),
            { type: "Ticket" as const, id: "LIST" },
          ]
          : [{ type: "Ticket" as const, id: "LIST" }],
    }),

    bookTicket: builder.mutation<any, { showId: string, numberOfTickets: number }>({
      query: ({ showId, numberOfTickets }) => ({
        url: `booking/bookticket/${showId}`,
        method: "POST", // Changed to POST to match your backend logic
        data: { numberOfTickets }
      }),
      invalidatesTags: () => [{ type: "Ticket", id: "LIST" }],
    }),

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

export const {
  useCreateUserMutation,
  useLoginMutation,
  useGetUserQuery,
  useGetUserTicketsQuery,
  useBookTicketMutation,
  useCancelTicketMutation
} = appApi;