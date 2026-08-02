import React from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import { useGetUserQuery } from "./redux/slice/usersOperations";
import GlobalAlert from "./UI Components/GlobalAlert";
import Navbar from "./UI Components/Navbar";
import User_Home from "./Webpages/User_Home_Page";
import Show_Details from "./Webpages/Show_Details";
import User_Tickets from './Webpages/User_Tickets';
import Organizer_Events from './Webpages/Organizer_Events';

/**
 * Provides a common structural framework layout containing the persistent navigation header,
 * acting as the entry injection target for child routing nodes.
 */
const NavbarLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

/**
 * App orchestrates the root entry lifecycle, coordinating initial token-based 
 * authentication synchronization, runtime global notifications, and structural route mapping.
 */
const App: React.FC = () => {
  const { data, isLoading } = useGetUserQuery(undefined, {
    skip: !localStorage.getItem("token"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading Application...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <GlobalAlert />
        <Routes>

          <Route element={<NavbarLayout />}>
            <Route path="/" element={<User_Home />} />
            <Route path="/user_home"    element={<User_Home />} />
            <Route path="/show_details/:eventId" element={<Show_Details />} />
            <Route path="/user_tickets" element={<User_Tickets />} />
            <Route path="/organizer_events" element={<Organizer_Events />} />
          </Route>

          <Route path="*" element={<div>Page Not Found</div>} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;