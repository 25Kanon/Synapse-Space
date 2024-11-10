import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

import ErrorAlert from "../components/ErrorAlert";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar";
import FriendsList from "../components/FriendsList";
import MainContentContainer from "../components/MainContentContainer";
import AxiosInstance from "../utils/AxiosInstance";


export default function Discover() {
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState([]);
    const [Error, setError] = useState(null);


    useEffect(() => {

        try {
            AxiosInstance.get(`api/recommendations/communities/`,{},{withCredentials: true})
            .then(response => {
                // On success, update state with the recommendations
                setRecommendations(response.data.recommendations);
                console.log(response.data.recommendations);
                setLoading(false);
            })
            .catch(error => {
                // On failure, handle the error
                setError(error.response ? error.response.data : 'Error fetching recommendations');
                setLoading(false);
            });
        } catch (error) {
            console.log(error);
        }
    }, []);

    if (loading) {
        return <div>Loading recommendations...</div>;
    }

    return (
        <>
            {Error || Error && <ErrorAlert text={Error} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <FriendsList />

            <MainContentContainer>
                <div>
                    <h3>Recommended Communities</h3>
                    <ul>
                        {recommendations.map((community, index) => (
                            <li key={index}>{community}</li>
                        ))}
                    </ul>
                </div>

            </MainContentContainer>
        </>
    );
}