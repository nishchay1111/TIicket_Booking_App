import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyOrganizer } from '../redux/slice/organizerlogin'; // Redux action for login
import { setAlert, clearAlert } from '../redux/slice/alert'; // Redux action for alerts

const Login = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isLoading, isError, errorMessage } = useSelector(state => state.ologin);
    const alert = useSelector(state => state.alert.alert); // Get alert from Redux store

    const handleSubmit = async (e) => {
        e.preventDefault();

        const resultAction = await dispatch(verifyOrganizer(credentials));

        if (verifyOrganizer.fulfilled.match(resultAction)) {
            dispatch(setAlert({ type: "success", message: "Logged in Successfully" })); // Dispatch success alert
            navigate("/organizershome");
        } else {
            dispatch(setAlert({ type: "error", message: resultAction.payload || "Invalid Credentials" })); // Dispatch error alert
        }
        setTimeout(() => dispatch(clearAlert()), 5000); // Clear alert after 3 seconds
    };

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img className="mx-auto h-10 w-auto"
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    alt="Your Company" />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                    Sign in to your Organizer Account
                </h2>
            </div>

            {alert && (
                <div className={`mt-4 p-2 text-white text-center rounded-md ${alert.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
                    {alert.message}
                </div>
            )}

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                            Email Address
                        </label>
                        <div className="mt-2">
                            <input type="email" name="email" id="email" autoComplete="email" required
                                value={credentials.email}
                                onChange={onChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                            Password
                        </label>
                        <div className="mt-2">
                            <input type="password" name="password" id="password" autoComplete="current-password" required
                                value={credentials.password}
                                onChange={onChange}
                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-indigo-600 sm:text-sm"
                            />
                        </div>
                    </div>
                    {isError && <p className="text-red-500 text-sm">{errorMessage}</p>}
                    <div>
                        <button type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                    <div className="py-3">
                        <a href="/organizerssignup" className="text-blue-500 underline hover:text-blue-700">Not an Organizer? Click Here to Sign Up</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
