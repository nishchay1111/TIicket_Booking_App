import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserLogin from "./components/pages/userLogin";
import { useGetUserQuery } from "./redux/slice/usersOperations"; 
import UserSignup from "./components/pages/userSignup";
import OrganizerSignup from "./components/pages/OrganizerSignup";
import OrganizerLogin from "./components/pages/OrganizerLogin";
import UserHome from "./components/pages/userHome";
import NavBar from "./components/UI/Navbar";
import GlobalAlert from "./components/UI/GlobalAlert";

const App: React.FC = () => {  
  // Using 'undefined' as the first argument because the hook expects an argument (void)
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
          {/* Layout Route: Wrap pages that should HAVE the Navbar here */}
          <Route element={<NavBar />}>
            <Route path="/userHome" element={<UserHome />} />
            {/* Add other protected pages here later */}
            <Route path="/userLogin" element={<UserLogin />} />
          </Route>

          {/* Pages WITHOUT Navbar (Login/Signup) */}
          <Route path="/userSignup" element={<UserSignup />} />
          <Route path="/organizerSignup" element={<OrganizerSignup />} />
          <Route path="/organizerLogin" element={<OrganizerLogin />} />
          
          {/* Fallback for 404 */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;