import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import UserLogin from "./components/pages/userLogin";
import { useGetUserQuery } from "./redux/slice/usersOperations"; 
import UserSignup from "./components/pages/userSignup";
import OrganizerSignup from "./components/pages/organizerSignup";
import OrganizerLogin from "./components/pages/organizerLogin";
// Import your Home component (make sure the path is correct)
// import OrganizersHome from "./components/pages/organizersHome"; 

function App() {  
  const { data, isLoading } = useGetUserQuery(undefined, {
    skip: !localStorage.getItem("token"), 
  });

  if (isLoading) return <div>Loading Application...</div>;

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Landing / User Login */}
          <Route path="/" element={<UserLogin />} />
          
          {/* Signups */}
          <Route path="/userSignup" element={<UserSignup />} />
          <Route path="/organizerSignup" element={<OrganizerSignup />} />
          
          {/* Logins */}
          <Route path="/organizerLogin" element={<OrganizerLogin />} />
          
          {/* Dashboard / Home - Ensure this matches your navigate() call */}
          {/* <Route path="/organizershome" element={<OrganizersHome />} /> */}
          
          {/* Fallback for 404 */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;