import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const organizerApi = createApi({
  reducerPath: "organizerApi",
  // Added "User" to match your Login mutation's tag usage
  tagTypes: ["Organizer", "Event", "User"], 
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
    // --- Organizer Endpoints ---
    createOrganizer: builder.mutation({
      query: (newOrganizer) => ({
        url: "organizers/createorganizer",
        method: "POST",
        body: newOrganizer,
      }),
      invalidatesTags: ["Organizer"],
    }),
    organizerLogin: builder.mutation({
      query: (credentials) => ({
        url: "organizers/organizerlogin",
        method: "POST",
        body: credentials,
      }),
      // Changed to 'Organizer' to keep it consistent with your state
      invalidatesTags: ["Organizer"], 
    }),
    getOrganizer: builder.query({
      query: () => ({
        url: "auth/getuser",
        method: "POST",
      }),
      providesTags: ["Organizer"],
    }),

    // --- Event Endpoints (Advanced Tags) ---
    fetchOrganizerEvents: builder.query({
      query: () => "organizers/fetchorganizersevents",
      providesTags: (result) =>
        result && result.orgEvents
          ? [
              ...result.orgEvents.map(({ event_id }) => ({ type: "Event", id: event_id })),
              { type: "Event", id: "LIST" },
            ]
          : [{ type: "Event", id: "LIST" }],
    }),

    createEvent: builder.mutation({
      query: (newEvent) => ({
        url: "organizers/createEvent",
        method: "POST",
        body: newEvent,
      }),
      // Invalidating 'LIST' forces the full list to refresh to show the new event
      invalidatesTags: [{ type: "Event", id: "LIST" }],
    }),

    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `organizers/deleteevent/${id}`,
        method: "DELETE",
      }),
      // Invalidates only the specific event deleted
      invalidatesTags: (result, error, id) => [{ type: "Event", id }],
    }),

    // Since shows are nested in Events in your JSON, 
    // we pass the eventId to refresh that specific event card.
    cancelShow: builder.mutation({
      query: ({ showId }) => ({
        url: `organizers/cancelshow/${showId}`,
        method: "PUT",
      }),
      // We use a general 'Event' tag or pass an eventId if available in the component
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    }),

    addShow: builder.mutation({
      query: ({ eventId, showData }) => ({
        url: `organizers/addshows/${eventId}`,
        method: "POST",
        body: showData
      }),
      invalidatesTags: (result, error, { eventId }) => [{ type: "Event", id: eventId }],
    })
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
  useAddShowMutation
} = organizerApi;