import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUserMutation } from "../../redux/slice/usersOperations";
import ticketIcon from '../../assets/icons/1.png';

const UserSignup: React.FC = () => {
  const [credentials, setCredentials] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    cpassword: "" 
  });
  
  const navigate = useNavigate();
  const [signup, { isLoading }] = useCreateUserMutation();

  // Handle input changes with proper React types
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Handle form submission with proper React types
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Optional: Add a quick password match check before hitting the API
    if (credentials.password !== credentials.cpassword) {
      console.error("❌ Passwords do not match");
      return;
    }

    try {
      const response = await signup(credentials).unwrap();
      
      if (response.success && response.authtoken) {
        localStorage.setItem("token", response.authtoken);
        console.log("🎉 USER SIGNED UP AND LOGGED IN SUCCESSFULLY");
        navigate("/");        
      } else {
        console.log("⚠️ Signup response received but missing token", response);
      }     
    } catch (err: any) {
      // Cast err to any to access the RTK Query error structure safely
      const errorMsg = err?.data?.error || "TRY DIFFERENT E-MAIL";
      console.error("❌ SIGNUP FAILED:", errorMsg);
    }
  };

  // Check if all fields are filled
  const isFormValid = !!(
    credentials.name && 
    credentials.email && 
    credentials.password && 
    credentials.cpassword
  );

  return (
    <div className="flex flex-col justify-center font-[sans-serif] sm:min-h-screen p-4">
      <div className="max-w-md w-full mx-auto border border-gray-300 rounded-2xl p-8 bg-white shadow-sm">
        
        {/* Optional: Add back the logo if you'd like it consistent with OrganizerSignup */}
        <div className="text-center mb-8">
             <img className="w-60 h-auto mx-auto" src={ticketIcon} alt="Logo" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="text-gray-800 text-sm mb-2 block font-medium">Name</label>
              <input 
                name="name" 
                type="text" 
                onChange={onChange} 
                value={credentials.name} 
                className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" 
                placeholder="Enter name" 
                required 
              />
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block font-medium">Email Id</label>
              <input 
                name="email" 
                type="email" 
                onChange={onChange} 
                value={credentials.email} 
                className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" 
                placeholder="Enter email" 
                required 
              />
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block font-medium">Password</label>
              <input 
                name="password" 
                type="password" 
                onChange={onChange} 
                value={credentials.password} 
                className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" 
                placeholder="Enter password" 
                required 
              />
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block font-medium">Confirm Password</label>
              <input 
                name="cpassword" 
                type="password" 
                onChange={onChange} 
                value={credentials.cpassword} 
                className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" 
                placeholder="Enter confirm password" 
                required 
              />
            </div>
          </div>

          <div className="mt-10">
            <button 
              type="submit" 
              className={`w-full py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white transition-all
                ${isFormValid && !isLoading ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
              disabled={!isFormValid || isLoading} 
            >
              {isLoading ? "Creating Account..." : "Create an account"}
            </button>
          </div>
          
          <div className="py-4 text-center">
            <a href="/userLogin" className="text-blue-500 text-sm underline hover:text-blue-700">
              Already a User? Click Here to Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;