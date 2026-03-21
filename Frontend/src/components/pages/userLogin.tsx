import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useLoginMutation } from "../../redux/slice/usersOperations";
// Using the typed hooks we created in your store/hooks.ts
import { useAppDispatch } from "../../redux/hooks";
import { showAlert } from '../../redux/slice/alert';

const UserLogin: React.FC = () => {
  // Use the typed dispatch for better IntelliSense
  const dispatch = useAppDispatch();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  // RTK Query mutation hook
  const [login, { isLoading }] = useLoginMutation();

  // Typing the input change event
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Typing the form submission event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // .unwrap() allows us to handle the result or catch the error directly
      const response = await login(credentials).unwrap();
      
      if (response.success && response.authtoken) {
        localStorage.setItem("token", response.authtoken);

        dispatch(showAlert({
          message: "Login Successful",
          severity: "success"
        }));

        navigate("/");
      }
    } catch (err: any) {
      // Accessing data.error safely from the RTK Query error object
      const errorMsg = err?.data?.error || "Invalid Credentials";
      console.error("❌ LOGIN FAILED:", errorMsg);
      
      dispatch(showAlert({
          message: `Login Failed: ${errorMsg}`,
          severity: "error"
      }));
    }
  };

  // Convert to boolean explicitly
  const isFormValid = !!(credentials.email && credentials.password);

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Sign In
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={credentials.email}
              onChange={onChange}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={credentials.password}
              onChange={onChange}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
            />
          </div>

          <div className="!mt-12">
            <button 
              type="submit" 
              className={`w-full py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white transition-colors
                ${isFormValid && !isLoading ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
              disabled={!isFormValid || isLoading} 
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="py-3 flex flex-col gap-2">
            <a
              href="/organizerLogin"
              className="text-blue-500 underline hover:text-blue-700 text-sm"
            >
              Are you an Organizer? Click Here to Log In
            </a>
            <a
              href="/userSignup"
              className="text-blue-500 underline hover:text-blue-700 text-sm"
            >
              Not a User? Click Here to Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;