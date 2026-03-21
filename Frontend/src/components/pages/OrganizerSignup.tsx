import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateOrganizerMutation } from '../../redux/slice/organizerOperations';
import ticketIcon from '../../assets/icons/1.png';

// Define the shape of any props if needed, otherwise use an empty interface
interface OrganizerSignupProps {
  // Add props here if you ever pass any from App.tsx
}

const OrganizerSignup: React.FC<OrganizerSignupProps> = (props) => {
  const [credentials, setCredentials] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    cpassword: "" 
  });
  
  const navigate = useNavigate();
  const [signup, { isLoading }] = useCreateOrganizerMutation();

  // Handle Input Changes
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Simple client-side validation check
    if (credentials.password !== credentials.cpassword) {
      console.error("❌ Passwords do not match");
      return;
    }

    try {
      // .unwrap() allows us to catch the error in the 'catch' block
      const response = await signup(credentials).unwrap();
      
      if (response.success && response.authtoken) {
        localStorage.setItem("token", response.authtoken);
        console.log("🎉 USER LOGGED IN SUCCESSFULLY");
        navigate("/");        
      } else {
        console.log("⚠️ Signup response received but missing token", response);
      }     
    } catch (err: any) {
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
      <div className="max-w-md w-full mx-auto border border-gray-300 rounded-2xl p-8 shadow-sm bg-white">
        <div className="text-center mb-12">
          <img 
            className="w-80 h-25 mx-auto" 
            src={ticketIcon} 
            alt="Ticket App Logo"
          />
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
                className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500 focus:border-blue-500" 
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
                className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500 focus:border-blue-500" 
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
                className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500 focus:border-blue-500" 
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
                className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500 focus:border-blue-500" 
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
              {isLoading ? "Creating account..." : "Create an account"}
            </button>
            <div className="py-4 text-center">
              <a href="/organizerLogin" className="text-blue-500 text-sm underline hover:text-blue-700">
                Already an Organizer? Click Here to Login
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerSignup;