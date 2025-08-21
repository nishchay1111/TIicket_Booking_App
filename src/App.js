import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import TNavbar from "./components/TNavbar";
import Mytickets from "./components/Mytickets";
import OLogin from "./components/OrganizerLogin";
import OSignup from "./components/OrganizerSignup";
import ONavbar from "./components/ONavbar";
import OrganizerHome from "./components/OrganizerHome";
import { Alert } from "./components/Alert";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "./redux/slice/user"; // Assuming you've defined the user slice

function App() {
  const dispatch = useDispatch();
  const alert = useSelector((state) => state.alert); // Access the alert state from Redux
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("http://localhost:5000/api/auth/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        })
        .catch(() => setUser(null));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Pass alert state from Redux to the Alert component */}
        <Alert alert={alert} />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <Navbar user={user} />
                <Home />
              </>
            }
          />

          <Route
            path="/login"
            element={
              <>
                <TNavbar />
                <Login setUser={setUser} />
              </>
            }
          />

          <Route path="/signup" element={<Signup />} />

          <Route
            path="/MyTickets"
            element={
              <>
                <Navbar user={user} />
                <Mytickets />
              </>
            }
          />

          <Route path="/organizerssignup" element={<OSignup />} />

          <Route path="/organizerslogin" element={<OLogin />} />

          <Route
            path="/organizershome"
            element={
              <>
                <ONavbar />
                <OrganizerHome />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
