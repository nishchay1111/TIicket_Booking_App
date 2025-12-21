import React, { useState } from "react";
import { AiOutlineCaretUp, AiOutlineCaretDown } from "react-icons/ai";

const Home = (props) => {
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isGenreOpen, setIsGenreOpen] = useState(false);

  return (
    <>
      <div className="fixed top-0 left-0 h-full w-64 bg-gray-950 text-slate-100">
        <b className="bg-gray-950 flex items-center justify-center text-lg text-slate-100 tracking-wider p-4">
          Book Tickets
        </b>

        {/* City Dropdown */}
        <div className="relative">
          <button
            className="bg-gray-950 rounded p-2 w-full flex items-center justify-between font-bold text-lg tracking-wider border-2 border-transparent hover:border-white duration-300 active:text-white"
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
            <div className="bg-gray-700 rounded absolute top-full flex flex-col items-start p-1 w-full z-10">
              <button className="flex rounded w-full justify-center hover:bg-black duration-30 active:text-white">Any</button>
              <button className="flex rounded w-full justify-center hover:bg-black duration-30 active:text-white">Boston</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white rounded">New York</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white rounded">Philadelphia</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white rounded">Washington DC</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white rounded">Alexandria</button>
            </div>
          )}
        </div>

        {/* Genre Dropdown */}
        {/* <div
          className="relative"
          style={{ marginTop: isCityOpen ? "128px" : "0px" }} // Dynamically adjust based on City dropdown
        >
          <button
            className="bg-gray-950 p-2 w-full flex items-center justify-between font-bold text-lg tracking-wider border-2 border-transparent hover:border-white duration-300 active:text-white"
            onClick={() => setIsGenreOpen((prev) => !prev)}
          >
            Genre
            {!isGenreOpen ? (
              <AiOutlineCaretDown className="h-6" />
            ) : (
              <AiOutlineCaretUp className="h-6" />
            )}
          </button>

          {isGenreOpen && (
            <div className="bg-gray-700 absolute top-full flex flex-col items-start p-1 w-full z-10">
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white ">Action</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white">Comedy</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white">Drama</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white">Horror</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white">Romance</button>
            </div>
          )}
        </div> */}
        <div
          className="relative"
          style={{ marginTop: isCityOpen ? "152px" : "0px" }} // Dynamically adjust based on City dropdown
        >
          <button
            className="bg-gray-950 p-2 w-full flex items-center justify-between font-bold text-lg tracking-wider border-2 border-transparent hover:border-white duration-300 active:text-white rounded"
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
            <div className="bg-gray-700 absolute top-full flex flex-col items-start p-1 w-full z-10 rounded">
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white rounded">Movies</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white rounded">Conserts</button>
              <button className="flex w-full justify-center hover:bg-black duration-30 active:text-white rounded">Sports</button>
              
            </div>
          )}
        </div>
        <div
          className="relative"
          style={{ marginTop: isGenreOpen ? "80px" : "0px" }} // Dynamically adjust based on City dropdown
        >
          <button
            className="bg-gray-950 p-2 w-full flex items-center justify-between font-bold text-lg tracking-wider border-2 border-transparent hover:border-white duration-300 active:text-white rounded"
          >My Tickets</button>
        </div>

      </div>
    </>
  );
};

export default Home;
