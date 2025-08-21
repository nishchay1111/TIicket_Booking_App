import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { fetchUser } from "../redux/slice/user";
import { fetchTickets } from "../redux/slice/ticket";

export default function MyTickets() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.currentUser?.user || null);
  const tickets = useSelector((state) => state.allTickets?.tickets?.ticket || []);

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchTickets());
  }, [dispatch]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-6">
      {tickets.map((ticket, index) => (
        <div key={index} className="relative flex flex-col bg-white shadow-sm border border-slate-200 rounded-lg w-full">
          <div className="relative h-56 m-2.5 overflow-hidden text-white rounded-md">
            <img 
              src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80" 
              alt="event" 
            />
          </div>
          <div className="p-4">
            <h6 className="mb-2 text-slate-800 text-xl font-semibold">
              {ticket.eventName}
            </h6>
            <h6>Type: {ticket.eventType}</h6>
            <h6>Tickets: {ticket.numberofTickets}</h6>
            <h6>Date: {new Date(ticket.showDate).toDateString()}</h6>
            <h6>Time: {ticket.showTime}</h6>
          </div>
          <div className="px-4 pb-4 pt-0 mt-2">
            <button 
              className="rounded-md bg-slate-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none" 
              type="button"
            >
              Read more
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
