import React from "react";
import sampleImage from "../images/9.jpg";

const OrganizerHome = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {Array.from({ length: 16 }).map((_, index) => (
        <div
          key={index}
          className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden mx-auto"
        >
          <div className="relative h-48">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={sampleImage}
              alt={`Sample Image ${index + 1}`}
            />
          </div>
          <div className="p-4">
            <h5 className="text-lg font-bold mb-2">Card Title {index + 1}</h5>
            <p className="text-gray-600 text-sm">
              This is a description of the card. You can use it to describe the
              image or provide other context.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrganizerHome;