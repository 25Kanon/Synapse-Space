import RegistrationForm  from "../components/RegistrationForm";
import {Helmet} from "react-helmet-async";
import React from "react";



export default function UserRegister() {
    return (
        <div>
            <Helmet>
                <title>Register - Synapse Space</title>
            </Helmet>

            <div className="hero bg-base-200 min-h-screen">
                <div className="card w-1/3 bg-base-100 shadow-xl p-5 ">
                    <RegistrationForm/> 
                </div>
            </div>
        </div>
    );
}