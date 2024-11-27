import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../utils/AxiosInstance";
import {Helmet} from "react-helmet-async";

const ResetPasswordConfirm = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await AxiosInstance.post("/api/auth/password-reset/confirm/", {
        password,
        uid,
        token,
      });

      if (response.status === 200) {
        setSuccessMessage("Your password has been reset successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "An unexpected error occurred. Please try again later."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Helmet>
        <title>Reset Password - Synapse Space</title>
      </Helmet>
      <form
        onSubmit={handlePasswordReset}
        className="w-full max-w-md p-6 space-y-6 bg-white rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-semibold text-gray-800">Reset Password</h1>
        <p className="text-gray-600">
          Please enter a new password to reset your account.
        </p>

        {error && <p className="text-red-600">{error}</p>}
        {successMessage && <p className="text-green-600">{successMessage}</p>}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full mt-1 input input-bordered"
            required
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="w-full mt-1 input input-bordered"
            required
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

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

export default ResetPasswordConfirm;
