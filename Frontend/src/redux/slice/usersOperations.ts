import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../api/axiosInstance";
import type { AxiosRequestConfig, AxiosError } from "axios";

/**
 * Custom base query factory wrapper that bridges RTK Query lifecycle events 
 * with an underlying Axios instance configuration.
 * 
 * @returns An asynchronous query handler capable of dispatching standard request parameters.
 */
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

/**
 * Structural definition for an individual ticket reservation asset.
 */
export interface Ticket {
  ticket_id: string;
  event_name: string;
  show_date: string;
  total_price: number;
  number_of_tickets: number;
}

/**
 * Structural definition for an event payload containing detailed nesting 
 * for venues, showtimes, and structural ticket pricing bounds.
 */
export interface Event {
  event_id: string;
  event_name: string;
  event_description?: string;
  event_category?: string;
  event_gener?: string;
  organizer_id?: string;
  image_url?: string | null;
  shows: {
    show_id: string;
    venue_name: string;
    venue_address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    show_date: string;
    show_time: string;
    screen?: string | null;
    show_language: string;
    total_tickets: number;
    available_tickets: number;
    ticket_price: number;
    active?: boolean;
  }[];
  date_created?: string;
}

/**
 * Layout of the response body returned when querying active consumer ticket lists.
 */
export interface UserTicketsResponse {
  success: boolean;
  userTickets: Ticket[];
  message?: string;
}

/**
 * Core customer profile payload structure returning identification and identity roles.
 */
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

/**
 * RTK Query API slice definitions providing auto-generated hooks for 
 * customer authentication, ticket execution, and dynamic event catalog browsing.
 */
export const appApi = createApi({
  reducerPath: "appApi",
  tagTypes: ["User", "Ticket", "Event"],
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
        method: 'POST',
      }),
      providesTags: ['User'],
    }),

    getUserTickets: builder.query<UserTicketsResponse, void>({
      query: () => ({ url: "booking/fetchalltickets", method: "POST" }),
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
        method: "POST",
        data: { numberOfTickets }
      }),
      invalidatesTags: () => [{ type: "Ticket", id: "LIST" }],
    }),

    fetchEventById: builder.query<Event, string>({
      query: (eventId) => ({ url: `booking/fetchevent/${eventId}`, method: "GET" }),
      providesTags: (result, error, eventId) => [{ type: "Event", id: eventId }],
    }),

    fetchAllEvents: builder.query<Event[], void>({
      query: () => ({ url: "booking/fetchallevents", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ event_id }) => ({ type: "Event" as const, id: event_id })),
            { type: "Event" as const, id: "LIST" },
          ]
          : [{ type: "Event" as const, id: "LIST" }],
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
  useCancelTicketMutation,
  useFetchAllEventsQuery,
  useFetchEventByIdQuery
} = appApi;