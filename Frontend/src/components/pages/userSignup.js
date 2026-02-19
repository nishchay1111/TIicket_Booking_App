import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUserMutation } from "../../redux/slice/usersOperations";
import ticketIcon from '../../assets/icons/1.png';

const UserSignup = (props) => {
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
  const navigate = useNavigate();
  const [signup, { isLoading }] = useCreateUserMutation();

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await signup(credentials).unwrap()
      if(response.success && response.authtoken){
        localStorage.setItem("token",response.authtoken)
        console.log("🎉 USER LOGGED IN SUCCESSFULLY")
        console.log("Auth Token", response.authtoken);
        navigate("/")        
      } else{
        console.log("⚠️ Signup response received but missing token", response);
      }     
    } catch (err) {
      const errorMsg = err?.data?.error || "TRY DIFFERNT E-MAIL";
      console.error("❌ SIGNUP FAILED:", errorMsg);
    }
  };


  // Check if all fields are filled
  const isFormValid = credentials.name && credentials.email && credentials.password && credentials.cpassword;

  return (
    <div className="flex flex-col justify-center font-[sans-serif] sm:h-screen p-4">
      <div className="max-w-md w-full mx-auto border border-gray-300 rounded-2xl p-8">
        <div className="text-center mb-12">
          <img
          className="w-80 h-25" 
          src={ticketIcon}
        />
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
              disabled={!isFormValid && isLoading} 
            >
              Create an account
            </button>
          </div>
          <div className="py-3">
          <a href="/login" class="text-blue-500 underline hover:text-blue-700">Already a User? Click Here to Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSignup;
