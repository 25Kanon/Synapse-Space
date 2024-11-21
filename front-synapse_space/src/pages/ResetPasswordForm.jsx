import React from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AxiosInstance from "../utils/AxiosInstance";

const ResetPassword = () => {
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    try {
      const response = await AxiosInstance.post("/api/auth/password-reset/", { email });

      if (response.status === 200) {
        toast.success(response.data.message); // Show success toast
      }
    } catch (error) {
      console.error("Error resetting password:", error);

      // Extract and display error message(s) from the response
      if (error.response?.data?.email) {
        error.response.data.email.forEach((err) => toast.error(err)); // Show each error
      } else {
        toast.error("An unknown error occurred."); // Fallback message
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleResetPassword}
        className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-semibold text-gray-800">Forgot your Password?</h1>
        <p className="text-gray-600">
          Please provide the email address that you used when you signed up for your account.
        </p>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full mt-1 input input-bordered"
            required
            placeholder="Enter your email address"
          />
        </div>
        <p className="text-gray-600">
          We will send you an email that will allow you to reset your password.
        </p>
        <button
          type="submit"
          className="w-full btn btn-primary"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
