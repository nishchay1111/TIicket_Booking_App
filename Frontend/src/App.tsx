import React from "react";
import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import { useGetUserQuery } from "./redux/slice/usersOperations";
import GlobalAlert from "./UI Components/GlobalAlert";
import Navbar from "./UI Components/Navbar";
import User_Login from "./Webpages/User_Login";
import Organizer_Login from "./Webpages/Organizer_Login";
import User_Signup from "./Webpages/User_Signup";
import Organizer_Signup from "./Webpages/Organizer_Signup";
import User_Home from "./Webpages/User_Home_Page";

// ─── Layout with Navbar ───────────────────────────────────────────────────────
const NavbarLayout = () => (
  <>
    <Navbar />
    <Outlet />        {/* 👈 page content renders here */}
  </>
);

// ─── App ──────────────────────────────────────────────────────────────────────
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

          {/* ── Public Routes (no Navbar) ──────────────────────────── */}
          <Route path="/user_login"       element={<User_Login />} />
          <Route path="/organizer_login"  element={<Organizer_Login />} />
          <Route path="/user_signup"      element={<User_Signup />} />
          <Route path="/organizer_signup" element={<Organizer_Signup />} />

          {/* ── Protected Routes (with Navbar) ─────────────────────── */}
          <Route element={<NavbarLayout />}>
            <Route path="/user_home" element={<User_Home />} />
            {/* 👈 Add more protected pages here as you build them:   */}
            {/* <Route path="/mytickets"  element={<MyTickets />} />   */}
            {/* <Route path="/profile"    element={<Profile />} />     */}
          </Route>

          {/* ── Fallback ───────────────────────────────────────────── */}
          <Route path="*" element={<div>Page Not Found</div>} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;