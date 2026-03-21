import React from "react";
// Import only the hook you need from your operations file
import { useGetUserQuery } from "../redux/slice/usersOperations";

const Profile: React.FC = () => {
  // RTK Query handles the token (via prepareHeaders in your API) and the fetch 
  // automatically as soon as this component mounts.
  const { data: user, isLoading, isError, error } = useGetUserQuery();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="ml-3 text-gray-500">Loading profile...</p>
      </div>
    );
  }

  // 2. Error State
  if (isError) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600 font-medium">
          Error: { (error as any)?.data?.message || "Could not fetch profile" }
        </p>
      </div>
    );
  }

  // 3. Success State
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
        User Profile
      </h2>
      <div className="space-y-3">
        <p className="text-gray-700">
          <strong className="text-gray-900">Name:</strong> {user?.name || "N/A"}
        </p>
        <p className="text-gray-700">
          <strong className="text-gray-900">Email:</strong> {user?.email || "N/A"}
        </p>
      </div>
    </div>
  );
};

export default Profile;