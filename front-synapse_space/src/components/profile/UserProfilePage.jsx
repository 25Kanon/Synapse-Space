import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../../components/profile/NavBar";
import BannerProfile from "../../components/profile/BannerProfile";
import ProfileTabs from "../../components/profile/ProfileTabs";
import ActivitiesDisplay from "../../components/profile/ActivitiesDisplay";
import AxiosInstance from "../../utils/AxiosInstance";
import AuthContext from "../../context/AuthContext";
import Footer from '../../components/Footer';
import MainContentContainer from "../../components/MainContentContainer";
const UserProfilePage = () => {
    const { user } = useContext(AuthContext); // Logged-in user
    const { userId } = useParams(); // Get the profile user's ID from the URL
    const navigate = useNavigate();

    const [userProfile, setUserProfile] = useState({});
    const [activeTab, setActiveTab] = useState("posts");
    const [isFriend, setIsFriend] = useState(false);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        // Fetch the profile data of the other user
        AxiosInstance.get(`/api/profile/${userId}/`, { withCredentials: true })
            .then((response) => {
                setUserProfile(response.data);
                setIsFriend(response.data.is_friend); // Assuming the API provides `is_friend` boolean
            })
            .catch((error) => {
                console.error("Error fetching user profile:", error);
                navigate("/not-found"); // Redirect if user profile not found
            });
    }, [userId, navigate]);

    const handleAddFriend = () => {
        AxiosInstance.post(`/api/friend/send-request/`, { receiver: userId }, { withCredentials: true })
            .then(() => {
                alert("Friend request sent!");
            })
            .catch((error) => {
                console.error("Error sending friend request:", error);
            });
    };
    const isSelf = () => userId == user.id;
    console.log(userId, user.id, isSelf());
    return (
        <>
            <NavBar />
            <MainContentContainer>
                <div className="p-6">
                    <BannerProfile
                        first_name={userProfile.first_name}
                        last_name={userProfile.last_name}
                        username={userProfile.username}
                        profAvatar={userProfile.profile_pic}
                        profBanner={userProfile.profile_banner}
                        bio={userProfile.bio}
                        profileId={userProfile.id}
                        isSelf={isSelf()}
                    />
                    <div className="flex justify-end mt-2">
                        {!isFriend && !isSelf && (
                            <button onClick={handleAddFriend} className="btn btn-primary btn-sm">
                                Add Friend
                            </button>
                        )}
                    </div>
                    {(isFriend || isSelf()) && (
                        <>
                            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                            <ActivitiesDisplay activities={activities} activeTab={activeTab} userID={userProfile.id}/>
                        </>
                    )}
                    {!isFriend && <p className="mt-6 text-center">You must be friends to see their activities.</p>}
                </div>

            </MainContentContainer>
            <Footer/>           
        </>
    );
};

export default UserProfilePage;
