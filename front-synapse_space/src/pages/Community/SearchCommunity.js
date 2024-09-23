import React, { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import Search from '../../components/community/Search';
import ErrorAlert from "../../components/ErrorAlert";
export default function SearchCommunity() {
    const { user, error } = useContext(AuthContext);

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
        <>
            {error && <ErrorAlert text={error} />}
            <Search />
        </>

    );
}
