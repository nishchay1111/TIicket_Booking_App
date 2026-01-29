import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import UserLogin from "./components/pages/userLogin"; // Ensure this import exists
// Only one import allowed! Use the relative path from App.js to your API file
import { useGetUserQuery } from "./redux/slice/usersOperations"; 
import UserSignup from "./components/pages/userSignup";

function App() {  
  const { data, isLoading } = useGetUserQuery(undefined, {
    skip: !localStorage.getItem("token"), 
  });

  if (isLoading) return <div>Loading Application...</div>;

  return (
    <Router>
      <div className="App">
        {/* You can put your Alert component here if you have it */}
        <Routes>
          {/* Change the default path to show Login first */}
          <Route path="/" element={<UserLogin/>} />
        </Routes>
        <Routes>
          {/* Change the default path to show Login first */}
          <Route path="/userSignup" element={<UserSignup/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;