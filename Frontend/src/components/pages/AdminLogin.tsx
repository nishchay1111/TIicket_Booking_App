import React, { useState } from 'react';
// Import only the types we need using 'import type'
import type { ChangeEvent } from 'react'; 
import { useNavigate } from 'react-router-dom';

// Typed hooks and actions
import { useAppDispatch, useAppSelector } from '../../redux/hooks'; 
import { verifyAdmin } from '../../redux/slice/adminlogin'; 
import { showAlert, hideAlert } from '../../redux/slice/alert';

const Login: React.FC = () => {
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // Redux selectors
    const { isLoading, isError, errorMessage } = useAppSelector((state) => state.alogin);
    const alertState = useAppSelector((state) => state.alert);

    // Using React.FormEvent specifically to avoid deprecation warnings/global conflicts
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const resultAction = await dispatch(verifyAdmin(credentials));

        if (verifyAdmin.fulfilled.match(resultAction)) {
            dispatch(showAlert({ severity: "success", message: "Logged in Successfully" }));
            navigate("/organizershome");
        } else {
            const errorMsg = (resultAction.payload as string) || "Invalid Credentials";
            dispatch(showAlert({ severity: "error", message: errorMsg }));
        }
        
        setTimeout(() => dispatch(hideAlert()), 5000);
    };

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img 
                    className="mx-auto h-12 w-auto"
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    alt="Company Logo" 
                />
                <h2 className="mt-10 text-center text-3xl font-extrabold tracking-tight text-gray-900">
                    Organizer Portal
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    
                    {alertState.open && (
                        <div className={`mb-6 p-3 text-sm font-medium text-center rounded-md transition-all ${
                            alertState.severity === "error" ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"
                        }`}>
                            {alertState.message}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <div className="mt-1">
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    required
                                    value={credentials.email}
                                    onChange={onChange}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    required
                                    value={credentials.password}
                                    onChange={onChange}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {isError && (
                            <div className="rounded-md bg-red-50 p-2 text-center text-xs text-red-700 font-semibold">
                                {errorMessage}
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-md bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? "Verifying..." : "Sign in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;