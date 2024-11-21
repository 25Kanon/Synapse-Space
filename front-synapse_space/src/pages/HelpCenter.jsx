import React from "react";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import FriendsList from "../components/FriendsList";
import MainContentContainer from "../components/MainContentContainer";
import AuthContext from "../context/AuthContext";
import { useContext } from "react";
const HelpCenter = () => {

  const { isAuthenticated } = useContext(AuthContext);
  return (
    <>
      {isAuthenticated && (<>
        <NavBar />
        <Sidebar />
        <FriendsList /></>)}
      <MainContentContainer>
        <div className="p-6 mx-auto max-w-4xl text-center">
          <h1 className="text-2xl font-bold mb-4">Help Center</h1>
          <p className="text-gray-600">
            Welcome to the Help Center! We're here to assist you with any questions or concerns you may have.
          </p>
          <p className="text-gray-600 mt-4">
            For further assistance, contact us at <a href="mailto:support@synapsespace.com" className="text-blue-600 hover:underline">support@synapsespace.com</a>.
          </p>
        </div>
      </MainContentContainer>
    </>
  );
};

export default HelpCenter;
