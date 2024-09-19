import React, {useContext} from "react";
import AuthContext from "../context/AuthContext";

import Sidebar from "../components/Sidebar";

export default function Home() {
    const { user } = useContext(AuthContext);

    if (!user) {
        return (
            <div>
                <div class="hero bg-base-200 min-h-screen">
                    <p class="text-center text-xl">Welcome to Synapse Space. Please login to continue.</p>
                </div>
            </div>
        ); 
    }
    return (
        <div class="container flex mx-auto border-2 border-secondary m-2">
            <div class="flex-auto">
                <Sidebar />
            </div>
            <div class="flex-auto">
                <div class="hero bg-base-200 w-max">
                    asdasd
                </div>
            </div>
            <div class="flex-end">
                <Sidebar />
            </div>
            
        </div>
    );
}