import { React, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../redux/slice/events"; // Import the setAlert action
import sampleImage from "../images/9.jpg";

const Home = () => {
  const dispatch = useDispatch();
  const { isLoading, events, isError } = useSelector((state) => state.allEvents);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching events</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {events.length > 0 ? (
        events.map((event, index) => (
          <div
            key={index}
            className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden mx-auto"
          >
            <div className="relative h-48">
              <img
                className="absolute inset-0 w-full h-full object-cover"
                src={event.image || sampleImage} // Use actual event image
                alt={`Event Image ${index + 1}`}
              />
            </div>
            <div className="p-4">
              <h5 className="text-lg font-bold mb-2">{event.eventName}</h5>
              <p className="text-gray-600 text-sm">
                {event.type} - {event.genre}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No events available</p>
      )}
    </div>
  );
};

export default Home;
