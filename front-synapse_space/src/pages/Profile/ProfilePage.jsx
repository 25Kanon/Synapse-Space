import React, { useContext, useState, useEffect } from "react";
import axios from 'axios';
import 'tailwindcss/tailwind.css';
import 'daisyui';
import AuthContext from "../../context/AuthContext";
import NavBar from '../../components/NavBar';
import BannerProfile from '../../components/profile/BannerProfile';  // Updated import
import MainContentContainer from "../../components/MainContentContainer";
import ProfileTabs from '../../components/profile/ProfileTabs';
import ActivitiesDisplay from '../../components/profile/ActivitiesDisplay';
import AxiosInstance from "../../utils/AxiosInstance";


const ProfilePage = () => {
    const {user} = useContext(AuthContext); // Assuming this contains user info like username, first_name, last_name
    const [userProfile, setUserProfile] = useState({});
    const [activities, setActivities] = useState({});
    const [activeTab, setActiveTab] = useState('overview');

   

    useEffect(() => {
        // Fetch user profile
        AxiosInstance.get(`${import.meta.env.VITE_API_BASE_URI}/api/profile/`,{},   
            {withCredentials:true}
        )
            .then(response => {
                setUserProfile(response.data); // Ensure correct response structure
                console.log(response.data)
            })
            .catch(error => console.error(error));

        // Fetch user activities
        axios.get(`${import.meta.env.VITE_API_BASE_URI}/api/activities/`)
            .then(response => setActivities(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <>
            <NavBar />
            <MainContentContainer>
                <div className="p-6">
                    <BannerProfile 
                        first_name={user.username} 
                        last_name={user.username}    
                        profBanner={userProfile.bannerURL} 
                        profAvatar={userProfile.profile_pic} 
                    />
                    <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <ActivitiesDisplay activities={activities} activeTab={activeTab} />
                </div>
            </MainContentContainer>
        </>
    );  
};

export default ProfilePage;