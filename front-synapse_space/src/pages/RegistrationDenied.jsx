import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { Clock, XCircle } from "lucide-react";
import {Helmet} from "react-helmet-async";

export default function RegistrationNotApproved() {
  const [dots, setDots] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Helmet>
        <title>Registration Denied - Synapse Space</title>
      </Helmet>
      <NavBar />
      <div className="flex items-center justify-center min-h-screen p-4 bg-base-300">
        <div className="w-full max-w-md">
          <div className="p-8 space-y-6 shadow-xl bg-base-100 rounded-2xl">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full opacity-75 animate-ping"></div>
                <div className="relative p-3 bg-white rounded-full">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
            </div>

            <div className="space-y-3 text-center">
              <h1 className="text-2xl font-bold text-red-600">Registration Not Approved</h1>
              <p className="text-secondary">
                Unfortunately, your registration request was not approved{dots}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-red-50">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-red-600" />
                <div className="text-sm text-red-800">
                  You may contact our support team for more information.
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="space-y-2 text-sm text-accent">
                <p>What you can do next:</p>
                <ul className="ml-2 space-y-1 list-disc list-inside">
                  <li>Verify your submitted information</li>
                  <li>Reach out to support for clarification</li>
                  <li>Review our guidelines and reapply</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
