import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAlert } from '../redux/slice/alert'; // Import setAlert action
import { useDispatch } from "react-redux"; // Use dispatch hook

const Login = ({ setUser }) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  let navigate = useNavigate();
  const dispatch = useDispatch(); // Get dispatch function

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const json = await response.json();
    console.log("Login Response:", json);

    if (json.success) {
      localStorage.setItem("token", json.authtoken);

      // Fetch user details after login
      const userResponse = await fetch("http://localhost:5000/api/auth/getuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": json.authtoken,
        },
      });

      const userData = await userResponse.json();

      if (userData.success) {
        setUser(userData.user); // Store user details in state
      }

      // Dispatch success alert
      dispatch(setAlert({ type: 'success', title: 'Success', msg: 'Logged in Successfully' }));
      navigate("/"); // Redirect after successful login
    } else {
      // Dispatch error alert
      dispatch(setAlert({ type: 'error', title: 'Error', msg: 'Invalid Credentials' }));
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
              autoComplete="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, [e.target.name]: e.target.value })}
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
              autoComplete="current-password"
              required
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, [e.target.name]: e.target.value })}
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Sign in
          </button>
          <div className="py-3">
            <a href="/organizerslogin" className="text-blue-500 underline hover:text-blue-700">
              Are you an Organizer? Click Here to Log In
            </a>
          </div>
          <div className="py-0">
            <a href="/signup" className="text-blue-500 underline hover:text-blue-700">
              Not a User? Click Here to Sign Up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
