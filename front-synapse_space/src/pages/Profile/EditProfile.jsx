import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../../utils/AxiosInstance";
import AuthContext from "../../context/AuthContext";
import MainContentContainer from "../../components/MainContentContainer";
import AvatarCropper from "../../components/avatarCropper";
import BannerCropper from "../../components/community/BannerCropper";

const EditProfile = () => {
    const { user } = useContext(AuthContext);
    const [username, setUsername] = useState(user.username || "");
    const [bio, setBio] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [profileBanner, setProfileBanner] = useState("");
    const [newProfilePic, setNewProfilePic] = useState(null);
    const [newProfileBanner, setNewProfileBanner] = useState(null);
    const [newProfilePicBlob, setnewProfilePicBlob] = useState(null);
    const [newProfileBannerBlob, setnewProfileBannerBlob] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    
    // State for password change
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    
    const navigate = useNavigate();

    useEffect(() => {
        AxiosInstance.get(`${import.meta.env.VITE_API_BASE_URI}/api/profile/`, { withCredentials: true })
            .then(response => {
                const { bio, profile_pic, profile_banner } = response.data;
                setBio(bio || "");
                setProfilePic(profile_pic || "");
                setProfileBanner(profile_banner || "");
            })
            .catch(error => console.error("Error fetching profile data:", error));
    }, []);
    
    const handleFileUpload = (file, type) => {
        const formData = new FormData();
        formData.append(type, file);
        
        return AxiosInstance.post(`${import.meta.env.VITE_API_BASE_URI}/api/upload/`, formData, {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
        })
        .then(response => response.data.file_url)
        .catch(error => {
            console.error(`Error uploading ${type}:`, error);
            return null;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let uploadedProfilePic = profilePic;
        let uploadedProfileBanner = profileBanner;

        if (newProfilePic) {
            uploadedProfilePic = await handleFileUpload(newProfilePic, 'profile_pic');
        }
        
        if (newProfileBanner) {
            uploadedProfileBanner = await handleFileUpload(newProfileBanner, 'profile_banner');
        }

        const formData = {
            username,
            bio,
            profile_pic: uploadedProfilePic,
            profile_banner: uploadedProfileBanner,
        };
        
        AxiosInstance.put(`${import.meta.env.VITE_API_BASE_URI}/api/profile/`, formData, { withCredentials: true })
            .then(response => {
                console.log("Profile updated successfully", response.data);
            })
            .catch(error => console.error("Error updating profile:", error));
    };

    const handlePasswordChange = () => {
        // Check if all password fields are filled and passwords match
        if (currentPassword && newPassword && newPassword === confirmNewPassword) {
            // Send the current password, new password, and confirm password to the backend
            AxiosInstance.put(`${import.meta.env.VITE_API_BASE_URI}/api/change-password/`, 
                { 
                    current_password: currentPassword, 
                    new_password: newPassword,
                    confirm_password: confirmNewPassword 
                }, 
                { withCredentials: true } // Ensure credentials are sent with the request
            )
            .then(response => {
                console.log("Password changed successfully:", response.data.message);
            })
            .catch(error => {
                console.error("Error changing password:", error.response?.data);
            });
        } else if (newPassword !== confirmNewPassword) {
            console.error("New password and confirmation do not match.");
        } else {
            console.error("Please fill in all fields.");
        }
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProfilePic(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProfileBanner(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileBanner(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBackClick = () => {
        navigate("/profile");
    };

    return (
        <MainContentContainer>
            <div className="p-6">
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
                        <label htmlFor="profilePic" className="block mb-1">
                            Profile Picture
                        </label>
                        <div className="mb-2">
                            {profilePic && (
                            <img
                                src={profilePic}
                                alt="Profile Preview"
                                className="object-cover w-32 h-32 rounded-full"
                            />
                            )}
                        </div>
                        <input
                            type="file"
                            id="profilePic"
                            accept="image/*"
                            onChange={handleProfilePicChange}
                            className="input"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="profileBanner" className="block mb-1">Profile Banner</label>
                        <div className="mb-2">
                            {profileBanner && (
                                <img 
                                    src={profileBanner} 
                                    alt="Banner Preview" 
                                    className="object-cover w-1/2 h-[20rem] mx-auto rounded-lg" 
                                />
                            )}
                        </div>
                        <input
                            type="file"
                            id="profileBanner"
                            accept="image/*"
                            onChange={handleBannerChange}
                            className="input"
                        />
                    </div>
                    
                    {/* Change Password Section */}
                    <h3 className="mt-4 text-lg font-semibold">Change Password</h3>
                    <div className="mb-4">
                        <label htmlFor="currentPassword" className="block mb-1">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block mb-1">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmNewPassword" className="block mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="input"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" onClick={handleBackClick} className="mb-4 btn btn-secondary">Back</button>
                </form>
            </div>
        </MainContentContainer>
    );
};

export default EditProfile;
