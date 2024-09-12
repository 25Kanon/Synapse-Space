import React, {useContext} from "react";
import AuthContext from "../context/AuthContext";

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
        <div>
            <div class="hero bg-base-200 min-h-screen">
                <h1 class="text-5xl font-bold text-center">Synapse Space--- {user.username}</h1>
            </div>
        </div>
    );
}