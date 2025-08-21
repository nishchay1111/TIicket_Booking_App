import React, { useState, useRef, useEffect } from "react";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";
import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import { fetchUser } from "../redux/slice/user";
import { useSelector, useDispatch } from "react-redux";
import { setAlert } from "../redux/slice/alert"; // Import the setAlert action

const Navbar = () => {
  const dispatch = useDispatch();
  const Cuser = useSelector((state) => state.currentUser?.user || null);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUser());
  }, []); 

  console.log(Cuser)

  const [city, setCity] = useState(false);
  const [event, setEvent] = useState(false);
  const [icon, setIcon] = useState(false);
  const cityTimeout = useRef(null);
  const eventTimeout = useRef(null);
  const iconTimeout = useRef(null);

  const handleCityHover = (isHovering) => {
    clearTimeout(cityTimeout.current);
    cityTimeout.current = isHovering ? setCity(true) : setTimeout(() => setCity(false), 40);
  };

  const handleEventHover = (isHovering) => {
    clearTimeout(eventTimeout.current);
    eventTimeout.current = isHovering ? setEvent(true) : setTimeout(() => setEvent(false), 40);
  };

  const handleIconHover = (isHovering) => {
    clearTimeout(iconTimeout.current);
    iconTimeout.current = isHovering ? setIcon(true) : setTimeout(() => setIcon(false), 40);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(setAlert({ type: "success", title: "Success", msg: "You've Logged Out Successfully" }));
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50">
      <div className="flex items-center justify-between py-3 px-3 bg-gray-100 relative">
        <div className="flex items-center space-x-3">
          <button className="px-5 py-2 text-black rounded hover:bg-zinc-300 font-semibold">
            Book My Show
          </button>

          <div className="relative" onMouseEnter={() => handleCityHover(true)} onMouseLeave={() => handleCityHover(false)}>
            <button className="flex items-center px-4 py-2 text-black rounded hover:bg-zinc-300">
              <span className="mr-2">City</span>
              {!city ? <AiOutlineCaretDown className="h-5 w-5" /> : <AiOutlineCaretUp className="h-5 w-5" />}
            </button>
            {city && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-40 z-10">
                {["Any", "Boston", "New York", "Philadelphia", "Washington DC", "Alexandria"].map((city, index) => (
                  <button key={index} className="block w-full px-4 py-2 text-left hover:bg-gray-200">
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={() => handleEventHover(true)} onMouseLeave={() => handleEventHover(false)}>
            <button className="flex items-center px-4 py-2 text-black rounded hover:bg-zinc-300">
              <span className="mr-2">Event</span>
              {!event ? <AiOutlineCaretDown className="h-5 w-5" /> : <AiOutlineCaretUp className="h-5 w-5" />}
            </button>
            {event && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-40 z-10">
                {["Movies", "Concerts", "Sports"].map((event, index) => (
                  <button key={index} className="block w-full px-4 py-2 text-left hover:bg-gray-200">
                    {event}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {Cuser ? (
          <div className="relative" onMouseEnter={() => handleIconHover(true)} onMouseLeave={() => handleIconHover(false)}>
            <button className="px-4 py-2 text-black rounded-full hover:bg-zinc-300">
              <Avatar>{Cuser?.user?.name?.charAt(0).toUpperCase() || "?"}</Avatar>
            </button>
            {icon && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded shadow-md w-40 z-10">
                <button className="block w-full px-4 py-2 text-left hover:bg-gray-200" onClick={() => navigate("/MyTickets")}>
                  My Tickets
                </button>
                <button className="block w-full px-4 py-2 text-left hover:bg-gray-200">Profile</button>
                <button className="block w-full px-4 py-2 text-left hover:bg-gray-200">Settings</button>
                <button className="block w-full px-4 py-2 text-left hover:bg-red-500 text-red-600" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500" onClick={() => navigate("/login")}>
            Login
          </button>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
