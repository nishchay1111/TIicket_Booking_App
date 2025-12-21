import React, { useState, useRef } from "react";
import Avatar from '@mui/material/Avatar';

const TNavbar = () => {
  return (
    <>
      <nav className="sticky top-0 z-50 bg-gray-100">
        <div className="flex items-center justify-between py-3 px-3">
          {/* Left-aligned button: Logo */}
          <div className="flex items-center">
            <button className="px-5 py-2 text-black rounded hover:bg-zinc-300">
              Book My Show Logo
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default TNavbar;
