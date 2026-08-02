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
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data || err.message,
      },
    };
  }
};

/**
 * Details the scheduling, pricing, and ticket availability bounds for an event showtime.
 */
export interface ShowData {
  show_id?: string;
  show_date: string;
  show_time: string;
  show_language: string;
  total_tickets: number;
  available_tickets?: number;
  ticket_price: number;
  active?: boolean;
}

/**
 * Outlines the comprehensive metadata, location, and timeline sets for an organizer event.
 */
export interface OrganizerEvent {
  event_id: string;
  event_name: string;
  event_description: string;
  event_city: string;
  show_dates: ShowData[];
  organizer_id: string;
}

/**
 * Layout of the response body returned when querying the active event catalog list.
 */
export interface OrganizerEventsResponse {
  success: boolean;
  count: number;
  orgEvents: OrganizerEvent[];
}

/**
 * RTK Query API slice definitions providing auto-generated hooks for 
 * organizer profile actions, event planning, and show ticketing workflows.
 */
export const organizerApi = createApi({
  reducerPath: "organizerApi",
  tagTypes: ["Organizer", "Event", "User"],
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    createOrganizer: builder.mutation<any, any>({
      query: (newOrganizer) => ({
        url: "organizers/createorganizer",
        method: "POST",
        data: newOrganizer,
      }),
      invalidatesTags: ["Organizer"],
    }),
    organizerLogin: builder.mutation<any, any>({
      query: (credentials) => ({
        url: "organizers/organizerlogin",
        method: "POST",
        data: credentials,
      }),
      invalidatesTags: ["Organizer"],
    }),
    getOrganizer: builder.query<any, void>({
      query: () => ({
        url: "auth/getuser",
        method: "POST",
      }),
      providesTags: ["Organizer"],
    }),

    fetchOrganizerEvents: builder.query<OrganizerEventsResponse, void>({
      query: () => ({
        url: "organizers/fetchorganizersevents",
        method: "GET"
      }),
      providesTags: (result) =>
        result && result.orgEvents
          ? [
            ...result.orgEvents.map(({ event_id }) => ({ type: "Event" as const, id: event_id })),
            { type: "Event" as const, id: "LIST" },
          ]
          : [{ type: "Event" as const, id: "LIST" }],
    }),

    createEvent: builder.mutation<any, Partial<OrganizerEvent>>({
      query: (newEvent) => ({
        url: "organizers/createEvent",
        method: "POST",
        data: newEvent,
      }),
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),

    deleteEvent: builder.mutation<any, string>({
      query: (id) => ({
        url: `organizers/deleteevent/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    cancelShow: builder.mutation<any, { showId: string; eventId: string }>({
      query: ({ showId }) => ({
        url: `organizers/cancelshow/${showId}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    addShow: builder.mutation<any, { eventId: string; showData: ShowData }>({
      query: ({ eventId, showData }) => ({
        url: `organizers/addshows/${eventId}`,
        method: "POST",
        data: showData
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    uploadPoster: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: 'organizers/uploadposter',
        method: 'POST',
        data: formData,
      }),
    }),
  }),
});

export const {
  useCreateOrganizerMutation,
  useOrganizerLoginMutation,
  useGetOrganizerQuery,
  useFetchOrganizerEventsQuery,
  useCreateEventMutation,
  useDeleteEventMutation,
  useCancelShowMutation,
  useAddShowMutation,
  useUploadPosterMutation
} = organizerApi;