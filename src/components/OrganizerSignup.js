import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = (props) => {
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, cpassword } = credentials;
    if(credentials.cpassword!=credentials.password){
      return props.showAlert("Error", "Password Does not Match", "red");
    }
    const response = await fetch("http://localhost:5000/api/organizers/createorganizer", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });
    const json = await response.json();
    console.log(json);

    if (json.success) {
      // Save the auth token and redirect
      localStorage.setItem('token', json.authtoken);
      navigate("/OrganizerHome");
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Check if all fields are filled
  const isFormValid = credentials.name && credentials.email && credentials.password && credentials.cpassword;

  return (
    <div className="flex flex-col justify-center font-[sans-serif] sm:h-screen p-4">
      <div className="max-w-md w-full mx-auto border border-gray-300 rounded-2xl p-8">
        <div className="text-center mb-12">
          <img src="/" alt="logo" className="w-40 inline-block" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Name</label>
              <input name="name" type="text" onChange={onChange} value={credentials.name} className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" placeholder="Enter name" />
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Email Id</label>
              <input name="email" type="email" onChange={onChange} value={credentials.email} className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" placeholder="Enter email" />
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Password</label>
              <input name="password" type="password" onChange={onChange} value={credentials.password} className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" placeholder="Enter password" />
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Confirm Password</label>
              <input name="cpassword" type="password" onChange={onChange} value={credentials.cpassword} className="text-gray-800 bg-white border border-gray-300 w-full text-sm px-4 py-3 rounded-md outline-blue-500" placeholder="Enter confirm password" />
            </div>
          </div>

          <div className="!mt-12">
            <button 
              type="submit" 
              className={`w-full py-3 px-4 text-sm tracking-wider font-semibold rounded-md text-white 
                ${isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
              disabled={!isFormValid} 
            >
              Create an account
            </button>
            <div className="py-3">
          <a href="/organizerslogin" class="text-blue-500 underline hover:text-blue-700">Already a Organizer? Click Here to Login</a>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
