import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto bg-base-200 text-base-content py-6 px-4 border-t border-gray-300">
      <div className="flex flex-col lg:flex-row justify-between items-center max-w-6xl mx-auto">
        <p className="text-sm mb-2 lg:mb-0">© 2024 Synapse Space. All rights reserved.</p>
        <div className="flex items-center space-x-4">
          <Link
            to="/help-center"
            className="text-sm text-blue-600 hover:underline"
          >
            Help Center
          </Link>
          <a
            href="/terms-of-use"
            className="text-sm text-blue-600 hover:underline"
          >
            Terms of Use
          </a>
          <a
            href="/privacy-policy"
            className="text-sm text-blue-600 hover:underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
