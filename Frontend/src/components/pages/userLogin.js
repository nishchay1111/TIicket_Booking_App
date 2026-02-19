import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useLoginMutation } from "../../redux/slice/usersOperations";
import ticketIcon from '../../assets/icons/1.png';

const UserLogin = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // unwrap lets us catch backend 4xx errors
      const response = await login(credentials).unwrap();

      // Backend returns: { success: true, authtoken: "..." }
      if (response.success && response.authtoken) {
        localStorage.setItem("token", response.authtoken);

        console.log("🎉 USER LOGGED IN SUCCESSFULLY");
        console.log("Auth Token:", response.authtoken);

        navigate("/");
      } else {
        console.log("⚠️ Login response received but missing token", response);
      }
    } catch (err) {
      const errorMsg = err?.data?.error || "Invalid Credentials";
      console.error("❌ LOGIN FAILED:", errorMsg);
    }
  };

  const isFormValid = credentials.email && credentials.password;

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="w-80 h-25" 
          src={ticketIcon}
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
            disabled={isLoading && !isFormValid}
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-gray-400"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="py-3">
            <a
              href="/organizerLogin"
              className="text-blue-500 underline hover:text-blue-700 text-sm"
            >
              Are you an Organizer? Click Here to Log In
            </a>
          </div>

          <div className="py-0">
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
