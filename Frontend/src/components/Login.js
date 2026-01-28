import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAlert } from '../redux/slice/alert'; 
import { useDispatch } from "react-redux"; 
import { useLoginMutation } from "../redux/slice/usersOperations";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [login, { isLoading }] = useLoginMutation();

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // .unwrap() allows us to catch the 400 errors from your auth.js
      const response = await login(credentials).unwrap();

      // MATCHING BACKEND: your auth.js sends 'authtoken' (lowercase)
      if (response.success && response.authtoken) {
        localStorage.setItem("token", response.authtoken);
        
        dispatch(setAlert({ 
          type: "success", 
          title: "Success", 
          msg: "Logged in successfully!" 
        }));
        
        navigate("/"); 
      }
    } catch (err) {
      // Backend returns errors in err.data.error (e.g., "No user found with this E-Mail")
      const errorMsg = err.data?.error || "Invalid Credentials";
      dispatch(setAlert({ 
        type: "danger", 
        title: "Login Failed", 
        msg: errorMsg 
      }));
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          Log Into Your Account
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

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="py-3">
            <a href="/organizerslogin" className="text-blue-500 underline hover:text-blue-700 text-sm">
              Are you an Organizer? Click Here to Log In
            </a>
          </div>
          <div className="py-0">
            <a href="/signup" className="text-blue-500 underline hover:text-blue-700 text-sm">
              Not a User? Click Here to Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;