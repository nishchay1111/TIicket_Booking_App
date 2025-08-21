import React, { useState, useRef } from "react";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";

const ONavbar = ({ user, showAlert },props) => { // Destructure props correctly
  let navigate = useNavigate();
  const [city, setCity] = useState(false);
  const [event, setEvent] = useState(false);
  const [icon, setIcon] = useState(false);
  const cityTimeout = useRef(null);
  const eventTimeout = useRef(null);
  const iconTimeout = useRef(null);

  const handleCityHover = (isHovering) => {
    clearTimeout(cityTimeout.current);
    if (isHovering) {
      setCity(true);
    } else {
      cityTimeout.current = setTimeout(() => setCity(false), 40);
    }
  };

  const handleEventHover = (isHovering) => {
    clearTimeout(eventTimeout.current);
    if (isHovering) {
      setEvent(true);
    } else {
      eventTimeout.current = setTimeout(() => setEvent(false), 40);
    }
  };

  const handleIconHover = (isHovering) => {
    clearTimeout(iconTimeout.current);
    if (isHovering) {
      setIcon(true);
    } else {
      iconTimeout.current = setTimeout(() => setIcon(false), 40);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    showAlert("Success", "You've Logged Out Successfully", "green"); // Call showAlert
    navigate("/organizerslogin");
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="flex items-center justify-between py-3 px-3 bg-gray-100 relative">
        {/* Left-aligned buttons: Logo, City, Event */}
        <div className="flex items-center space-x-3">
          <button className="px-5 py-2 text-black rounded hover:bg-zinc-300">
            Book My Show Logo
          </button>

          {/* City Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleCityHover(true)}
            onMouseLeave={() => handleCityHover(false)}
          >
            <button className="flex items-center px-4 py-2 text-black rounded hover:bg-zinc-300">
              <span className="mr-2">City</span>
              {!city ? <AiOutlineCaretDown className="h-5 w-5" /> : <AiOutlineCaretUp className="h-5 w-5" />}
            </button>
            {city && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-40 z-10">
                {["Any", "Boston", "New York", "Philadelphia", "Washington DC", "Alexandria"].map((city, index) => (
                  <button key={index} className="block w-full px-4 py-2 text-left hover:bg-gray-200">{city}</button>
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
            <button className="flex items-center px-4 py-2 text-black rounded hover:bg-zinc-300">
              <span className="mr-2">Event</span>
              {!event ? <AiOutlineCaretDown className="h-5 w-5" /> : <AiOutlineCaretUp className="h-5 w-5" />}
            </button>
            {event && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-40 z-10">
                {["Movies", "Concerts", "Sports"].map((event, index) => (
                  <button key={index} className="block w-full px-4 py-2 text-left hover:bg-gray-200">{event}</button>
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
          <button className="px-4 py-2 text-black rounded-full hover:bg-zinc-300">
            <Avatar>{user?.email?.charAt(0)?.toUpperCase() || "?"}</Avatar>
          </button>
          {icon && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-40 z-10">
              {["MyTickets", "Profile", "Settings", "Logout"].map((item, index) => (
                <button
                  key={index}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-200"
                  onClick={item === "Logout" ? handleLogout : undefined} // Correct onClick syntax
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