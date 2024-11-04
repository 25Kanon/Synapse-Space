import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import AuthContext from "../../context/AuthContext";
import AxiosInstance from "../../utils/AxiosInstance";

const EditProfile = () => {
    const { user } = useContext(AuthContext);
    const [username, setUsername] = useState(user.username || "");
    const [bio, setBio] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [profileBanner, setProfileBanner] = useState("");
    const navigate = useNavigate();
    
    useEffect(() => {
        // Fetch initial profile data for edit fields
        AxiosInstance.get(`${import.meta.env.VITE_API_BASE_URI}/api/profile/`, { withCredentials: true })
            .then(response => {
                const { bio, profile_pic, profile_banner } = response.data;
                setBio(bio || "");
                setProfilePic(profile_pic || "");
                setProfileBanner(profile_banner || "");
            })
            .catch(error => console.error("Error fetching profile data:", error));
    }, []);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to handle profile update
        AxiosInstance.put(`${import.meta.env.VITE_API_BASE_URI}/api/profile/`, {
            username,
            bio,
            profile_pic: profilePic,
            profile_banner: profileBanner
        }, { withCredentials: true })
            .then(response => {
                console.log("Profile updated successfully", response.data);
                updateUser({ ...user, username });
                if (onProfileUpdate) onProfileUpdate(); // Trigger profile data refresh if defined
            })
            .catch(error => console.error("Error updating profile:", error));
    };

    const handleBackClick = () => {
        navigate("/profile"); // Navigate back to ProfilePage
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                    <label htmlFor="username" className="block mb-1">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="bio" className="block mb-1">Bio</label>
                    <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="textarea"
                        rows="4"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="profilePic" className="block mb-1">Profile Picture URL</label>
                    <input
                        type="text"
                        id="profilePic"
                        value={profilePic}
                        onChange={(e) => setProfilePic(e.target.value)}
                        className="input"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="profileBanner" className="block mb-1">Profile Banner URL</label>
                    <input
                        type="text"
                        id="profileBanner"
                        value={profileBanner}
                        onChange={(e) => setProfileBanner(e.target.value)}
                        className="input"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" onClick={handleBackClick} className="mb-4 btn btn-secondary">Back</button>
            </form>
        </div>
    );
};

export default EditProfile;