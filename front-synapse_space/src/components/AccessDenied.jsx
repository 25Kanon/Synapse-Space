import React from "react";

const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-accent dark:text-neutral">
      <div className="p-8 text-center border border-white rounded-lg shadow-xl">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-white">Access Denied</h1>
        <p className="mb-6 text-lg text-black dark:text-white">
          You do not have the necessary permissions to access this page.
        </p>
        <button
            className="px-6 py-3 font-semibold transition-all rounded-lg bg-primary text-base-100 hover:bg-info"
            onClick={() => (window.location.href = "/auth/login/")}
            >
            Go Back to Login
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;