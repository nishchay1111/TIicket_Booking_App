import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizerLoginMutation } from '../../redux/slice/organizerOperations';
import ticketIcon from '../../assets/icons/1.png';

const OrganizerLogin: React.FC = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    // The mutation hook is now typed based on your slice definition
    const [login, { isLoading, isError, error }] = useOrganizerLoginMutation();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            // .unwrap() gives us the plain response or throws the error
            const response = await login(credentials).unwrap();
            
            if (response.success) {
                // Using a fallback for token naming conventions
                const token = response.authToken || response.authtoken;
                if (token) {
                    localStorage.setItem('token', token);
                    navigate("/organizershome");
                }
            }
        } catch (err) {
            // Error handling is managed by the RTK Query 'error' object
            console.error("Login failed:", err);
        }
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img 
                    className="w-80 h-25 mx-auto" 
                    src={ticketIcon} 
                    alt="Ticket Icon" 
                />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
                    Sign in to your Organizer Account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                            Email Address
                        </label>
                        <div className="mt-2">
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
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                            Password
                        </label>
                        <div className="mt-2">
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
                    </div>

                    {/* Type-safe error rendering */}
                    {isError && (
                        <p className="text-red-500 text-sm font-semibold">
                            {(error as any)?.data?.error || "Invalid Credentials"}
                        </p>
                    )}

                    <div>
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300 transition-colors"
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>

                    <div className="py-3 text-center">
                        <a href="/organizerSignup" className="text-blue-500 underline hover:text-blue-700 text-sm">
                            Not an Organizer? Click Here to Sign Up
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrganizerLogin;