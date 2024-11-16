import React from 'react';

const ResetPassword = () => {
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    try {
      const response = await fetch("http://localhost:8000/api/auth/reset-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message); // Show success message
      } else {
        const errorData = await response.json();
        alert(errorData.error); // Show error message
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("An error occurred. Please try again later.");
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
