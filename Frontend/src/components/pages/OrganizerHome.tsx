import React from "react";
// In TypeScript, ensure your environment is configured to handle image imports
import sampleImage from "../../images/9.jpg";

const OrganizerHome: React.FC = () => {
  // Creating a dummy array of 16 items for the layout preview
  const placeholderCards = Array.from({ length: 16 });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {placeholderCards.map((_, index) => (
        <div
          key={index}
          className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden mx-auto transition-transform hover:scale-105"
        >
          <div className="relative h-48">
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={sampleImage}
              alt={`Sample Event ${index + 1}`}
            />
          </div>
          <div className="p-4">
            <h5 className="text-lg font-bold mb-2 text-slate-800">
                Event Title {index + 1}
            </h5>
            <p className="text-gray-600 text-sm">
              This is a placeholder for your organizer events. Once you fetch real data, 
              this will show your event descriptions and dates.
            </p>
          </div>
          <div className="px-4 pb-4">
             <button className="text-indigo-600 font-medium text-sm hover:underline">
                View Analytics
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrganizerHome;