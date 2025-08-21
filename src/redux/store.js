// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import user from "./slice/user";
import tickets from "./slice/ticket";
import events from "./slice/events";
import ologin from "./slice/organizerlogin";
import alert from "./slice/alert"; // Import alert reducer

export const store = configureStore({
  reducer: {
    currentUser: user,
    allTickets: tickets,
    alert: alert, // Add alert reducer to the store
    allEvents: events,
    ologin: ologin
  },
});
