import React, { useContext, useState, useEffect } from "react";
import 'tailwindcss/tailwind.css';
import 'daisyui';
import AuthContext from "../../context/AuthContext";
import NavBar from "../../components/profile/NavBar";
import BannerProfile from '../../components/profile/BannerProfile';  
import MainContentContainer from "../../components/MainContentContainer";
import ProfileTabs from '../../components/profile/ProfileTabs';
import ActivitiesDisplay from '../../components/profile/ActivitiesDisplay';
import AxiosInstance from "../../utils/AxiosInstance";

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
        <>
            <NavBar />
            <MainContentContainer>
                <div className="p-6">
                    <BannerProfile 
                        first_name={userProfile.first_name} // Use first_name from userProfile
                        last_name={userProfile.last_name} // Add last_name from userProfile
                        username={userProfile.username} // Pass username
                        profBanner={userProfile.profile_banner} 
                        profAvatar={userProfile.profile_pic}
                        bio={userProfile.bio}
                        isSelf={true}
                    />
                    <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <ActivitiesDisplay activities={activities} activeTab={activeTab} userID={userProfile.id}/>
                </div>
            </MainContentContainer>
        </>
    );  
};

export default ProfilePage;
