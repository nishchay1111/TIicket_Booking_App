import React, { useState, useRef } from "react";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";

// 1. Define the shape of the props
interface ONavbarProps {
  user: {
    email?: string;
    name?: string;
  } | null;
  showAlert: (title: string, message: string, color: string) => void;
}

const ONavbar: React.FC<ONavbarProps> = ({ user, showAlert }) => {
  const navigate = useNavigate();
  const [city, setCity] = useState(false);
  const [event, setEvent] = useState(false);
  const [icon, setIcon] = useState(false);

  // 2. Type the useRef for timeouts
  const cityTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eventTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iconTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCityHover = (isHovering: boolean) => {
    if (cityTimeout.current) clearTimeout(cityTimeout.current);
    if (isHovering) {
      setCity(true);
    } else {
      cityTimeout.current = setTimeout(() => setCity(false), 40);
    }
  };

  const handleEventHover = (isHovering: boolean) => {
    if (eventTimeout.current) clearTimeout(eventTimeout.current);
    if (isHovering) {
      setEvent(true);
    } else {
      eventTimeout.current = setTimeout(() => setEvent(false), 40);
    }
  };

  const handleIconHover = (isHovering: boolean) => {
    if (iconTimeout.current) clearTimeout(iconTimeout.current);
    if (isHovering) {
      setIcon(true);
    } else {
      iconTimeout.current = setTimeout(() => setIcon(false), 40);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    showAlert("Success", "You've Logged Out Successfully", "green");
    navigate("/organizerslogin");
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="flex items-center justify-between py-3 px-3 bg-gray-100 relative shadow-sm">
        {/* Left-aligned buttons */}
        <div className="flex items-center space-x-3">
          <button 
            className="px-5 py-2 text-black font-bold rounded hover:bg-zinc-300"
            onClick={() => navigate("/organizerHome")}
          >
            TICKET APP
          </button>

          {/* City Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleCityHover(true)}
            onMouseLeave={() => handleCityHover(false)}
          >
            <button className="flex items-center px-4 py-2 text-black rounded hover:bg-zinc-300 transition-colors">
              <span className="mr-2">City</span>
              {!city ? <AiOutlineCaretDown className="h-5 w-5" /> : <AiOutlineCaretUp className="h-5 w-5" />}
            </button>
            {city && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-40 z-10">
                {["Any", "Boston", "New York", "Philadelphia", "Washington DC", "Alexandria"].map((cityName, index) => (
                  <button key={index} className="block w-full px-4 py-2 text-left hover:bg-gray-200">{cityName}</button>
                ))}
              </div>
            )}
          </div>

          {/* Event Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleEventHover(true)}
            onMouseLeave={() => handleEventHover(false)}
          >
            <button className="flex items-center px-4 py-2 text-black rounded hover:bg-zinc-300 transition-colors">
              <span className="mr-2">Event</span>
              {!event ? <AiOutlineCaretDown className="h-5 w-5" /> : <AiOutlineCaretUp className="h-5 w-5" />}
            </button>
            {event && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-40 z-10">
                {["Movies", "Concerts", "Sports"].map((eventName, index) => (
                  <button key={index} className="block w-full px-4 py-2 text-left hover:bg-gray-200">{eventName}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right-aligned Avatar */}
        <div
          className="relative"
          onMouseEnter={() => handleIconHover(true)}
          onMouseLeave={() => handleIconHover(false)}
        >
          <button className="px-2 py-2 text-black rounded-full hover:bg-zinc-300 transition-all">
            <Avatar sx={{ bgcolor: 'indigo.600' }}>
              {user?.email?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
          </button>
          {icon && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-44 z-10 overflow-hidden">
                <div className="px-4 py-2 text-xs text-gray-500 border-b">{user?.email || "Organizer"}</div>
              {["MyTickets", "Profile", "Settings", "Logout"].map((item, index) => (
                <button
                  key={index}
                  className={`block w-full px-4 py-2 text-left hover:bg-gray-200 ${item === "Logout" ? "text-red-600 font-semibold" : ""}`}
                  onClick={item === "Logout" ? handleLogout : undefined}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ONavbar;