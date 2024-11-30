import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bottom-0 w-full px-4 py-6 mt-auto border-t border-gray-300 bg-base-200 text-base-content">
      <div className="flex flex-col items-center justify-between max-w-6xl mx-auto lg:flex-row">
        <p className="mb-2 text-sm lg:mb-0">© 2024 Synapse Space. All rights reserved.</p>
        <div className="flex items-center space-x-4">
          <Link
            to="/help-center"
            className="text-sm text-blue-600 hover:underline"
          >
            Help Center
          </Link>
          <Link
            to="/terms-of-use"
            className="text-sm text-blue-600 hover:underline"
          >
            Terms of Use
          </Link>
          <Link
            to="/privacy-policy"
            className="text-sm text-blue-600 hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            to="/feedback"
            className="text-sm text-blue-600 hover:underline"
          >
            Feedback
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
