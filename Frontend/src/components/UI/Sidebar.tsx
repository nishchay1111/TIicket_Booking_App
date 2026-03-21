import React, { useState } from "react";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";

interface SidebarProps {
  // Define any props you might pass from App.tsx here
  onFilterChange?: (filterType: string, value: string) => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const [isCityOpen, setIsCityOpen] = useState<boolean>(false);
  const [isGenreOpen, setIsGenreOpen] = useState<boolean>(false);

  // Helper to handle filter selection - can be expanded later
  const handleSelect = (category: string, value: string) => {
    console.log(`Selected ${category}: ${value}`);
    // props.onFilterChange?.(category, value);
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-950 text-slate-100 shadow-xl z-40">
      <div className="bg-gray-950 flex items-center justify-center text-lg font-bold text-slate-100 tracking-wider p-6 border-b border-gray-800">
        BOOK TICKETS
      </div>

      <div className="flex flex-col p-2 space-y-1">
        {/* City Dropdown */}
        <div className="relative">
          <button
            className="bg-gray-950 rounded p-2 w-full flex items-center justify-between font-bold text-lg tracking-wider border-2 border-transparent hover:border-white transition-all duration-300 active:text-white"
            onClick={() => setIsCityOpen((prev) => !prev)}
          >
            City
            {!isCityOpen ? (
              <AiOutlineCaretDown className="h-6" />
            ) : (
              <AiOutlineCaretUp className="h-6" />
            )}
          </button>

          {isCityOpen && (
            <div className="bg-gray-800 rounded absolute top-full flex flex-col items-start p-1 w-full z-10 shadow-2xl border border-gray-700">
              {["Any", "Boston", "New York", "Philadelphia", "Washington DC", "Alexandria"].map((city) => (
                <button 
                  key={city}
                  onClick={() => handleSelect('city', city)}
                  className="flex rounded w-full justify-center py-2 hover:bg-black transition-colors duration-200 active:text-white"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Genre/Events Dropdown */}
        <div
          className="relative transition-all duration-300"
          style={{ marginTop: isCityOpen ? "230px" : "0px" }} // Adjusted height for 6 items
        >
          <button
            className="bg-gray-950 p-2 w-full flex items-center justify-between font-bold text-lg tracking-wider border-2 border-transparent hover:border-white transition-all duration-300 active:text-white rounded"
            onClick={() => setIsGenreOpen((prev) => !prev)}
          >
            Events
            {!isGenreOpen ? (
              <AiOutlineCaretDown className="h-6" />
            ) : (
              <AiOutlineCaretUp className="h-6" />
            )}
          </button>

          {isGenreOpen && (
            <div className="bg-gray-800 absolute top-full flex flex-col items-start p-1 w-full z-10 rounded shadow-2xl border border-gray-700">
              {["Movies", "Concerts", "Sports"].map((event) => (
                <button 
                  key={event}
                  onClick={() => handleSelect('event', event)}
                  className="flex w-full justify-center py-2 hover:bg-black transition-colors duration-200 active:text-white rounded"
                >
                  {event}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* My Tickets Link */}
        <div
          className="relative transition-all duration-300"
          style={{ marginTop: isGenreOpen ? "130px" : "0px" }} 
        >
          <button
            className="bg-gray-950 p-2 w-full flex items-center justify-start font-bold text-lg tracking-wider border-2 border-transparent hover:border-white transition-all duration-300 active:text-white rounded"
          >
            My Tickets
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;