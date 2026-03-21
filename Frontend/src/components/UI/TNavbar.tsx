import React from "react";
// Import Avatar if you plan to use it as seen in your previous JS file
import Avatar from '@mui/material/Avatar';
import { useNavigate } from "react-router-dom";

// Define an interface for props even if empty, for future-proofing
interface TNavbarProps {
  userEmail?: string;
}

const TNavbar: React.FC<TNavbarProps> = ({ userEmail }) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-gray-100 shadow-sm">
      <div className="flex items-center justify-between py-3 px-6">
        {/* Left-aligned button: Logo */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate("/")}
            className="px-5 py-2 text-black font-bold rounded hover:bg-zinc-300 transition-colors"
          >
            TICKET APP LOGO
          </button>
        </div>

        {/* Right-aligned area (Placeholder for Avatar/Profile) */}
        <div className="flex items-center">
          <button className="p-1 rounded-full hover:bg-zinc-300 transition-all">
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {userEmail?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TNavbar;