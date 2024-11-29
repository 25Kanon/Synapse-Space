import React, { useContext, useState, useEffect } from "react";
import 'tailwindcss/tailwind.css';
import 'daisyui';
import AuthContext from "../../context/AuthContext";
import BannerProfile from '../../components/profile/BannerProfile';  
import ProfileTabs from '../../components/profile/ProfileTabs';
import ActivitiesDisplay from '../../components/profile/ActivitiesDisplay';
import LayoutProfile from '../../components/LayoutProfile';
import AxiosInstance from "../../utils/AxiosInstance";
import {Helmet} from "react-helmet-async";

const ProfilePage = () => {
    const { user } = useContext(AuthContext); 
    const [userProfile, setUserProfile] = useState({});
    const [activities, setActivities] = useState({});
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        // Fetch user profile
        AxiosInstance.get(`${import.meta.env.VITE_API_BASE_URI}/api/profile/`, { withCredentials: true })
            .then(response => {
                setUserProfile(response.data); 
                console.log(response.data);
            })
            .catch(error => console.error(error));
    }, []);

    return (
        <LayoutProfile showSidebar={true} membersListId={userProfile?.id}>
            <Helmet>
                <title>{userProfile?.username ? userProfile?.username: `Profile`} - Synapse Space</title>
            </Helmet>
            <div className="p-6">
                {/* Banner Profile Section */}
                <BannerProfile 
                    first_name={userProfile?.first_name} // Use first_name from userProfile
                    last_name={userProfile?.last_name} // Add last_name from userProfile
                    username={userProfile?.username} // Pass username
                    profBanner={userProfile?.profile_banner} 
                    profAvatar={userProfile?.profile_pic}
                    bio={userProfile?.bio}
                    interests={userProfile?.interests}
                    isSelf={true}
                />
                
                {/* Profile Tabs Section */}
                <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                
                {/* Activities Display Section */}
                <ActivitiesDisplay 
                    activities={activities} 
                    activeTab={activeTab} 
                    userID={userProfile?.id} 
                />
            </div>
        </LayoutProfile>
    );  
};

export default ProfilePage;
