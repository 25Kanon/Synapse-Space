import React, { useContext, useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import AuthContext from "../../context/AuthContext";
import axios from "axios";
import ErrorAlert from "../../components/ErrorAlert";
import Sidebar from "../../components/Sidebar";
import NavBar from "../../components/NavBar"
import MembersList from "../../components/community/MembersList";
import Banner from '../../components/community/Banner';
import MainContentContainer from "../../components/MainContentContainer";
import CreatePost from "../../components/community/CreatePost";

export default function Community() {
    const { user, error } = useContext(AuthContext);
    const { id } = useParams();
    const [communityDetails, setCommunityDetails] = useState([]);

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URI}/api/community/${id}`, {

                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    }
                });
                setCommunityDetails(response.data);
            } catch (error) {
                console.error('Error fetching memberships:', error);
            }
        };

        fetchCommunityDetails();
    }, [id]);


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
            {error && <ErrorAlert text={error} classExtensions="fixed z-50" />}
            <NavBar />
            <Sidebar />
            <MembersList />
            <MainContentContainer>
                <Banner communityName={communityDetails.name} commBanner={communityDetails.bannerURL} commAvatar={communityDetails.imgURL} />
                <CreatePost userName={user.username} community={communityDetails.id}/>

            </MainContentContainer>
        </>
    );
}
