import React, { useState, useEffect, useContext } from "react";
import DOMPurify from "dompurify";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faCaretSquareLeft } from "@fortawesome/free-regular-svg-icons";
import AxiosInstance from "../../utils/AxiosInstance";
import AuthContext from "../../context/AuthContext";
import AvatarCropper from "../../components/avatarCropper";
import BannerCropper from "../../components/community/BannerCropper";
import Banner from "../../components/profile/Banner";
import { TagInput } from "../../components/TagInput";
import NavBar from "../../components/profile/NavBar";
import Footer from '../../components/Footer';
import {Helmet} from "react-helmet-async";

const EditProfile = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [username, setUsername] = useState(user.username || "");
    const [bio, setBio] = useState("");
    const [interests, setInterests] = useState([]);
    const [profilePic, setProfilePic] = useState(null);
    const [profileBanner, setProfileBanner] = useState(null);
    const [profilePicBlob, setProfilePicBlob] = useState(null);
    const [profileBannerBlob, setProfileBannerBlob] = useState(null);
    const [avatarImageSrc, setAvatarImageSrc] = useState(null); // Separate state for avatar cropping
    const [bannerImageSrc, setBannerImageSrc] = useState(null); // Separate state for banner cropping
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        AxiosInstance.get("/api/profile/", { withCredentials: true })
            .then((response) => {
                const { username, bio, profile_pic, profile_banner, interests } = response.data;
                setUsername(username || "");
                setBio(bio || "");
                setInterests(interests || []);
                setProfilePic(profile_pic || null);
                setProfileBanner(profile_banner || null);
            })
            .catch((error) => console.error("Error fetching profile data:", error));
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setAvatarImageSrc(reader.result);
            reader.readAsDataURL(file);
            document.getElementById("avatar-cropper").showModal();
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setBannerImageSrc(reader.result);
            reader.readAsDataURL(file);
            document.getElementById("banner-cropper").showModal();
        }
    };

    const handleAvatarCrop = (croppedImg) => {
        setProfilePic(croppedImg);
        convertBlob(croppedImg, setProfilePicBlob);
    };

    const handleBannerCrop = (croppedImg) => {
        setProfileBanner(croppedImg);
        convertBlob(croppedImg, setProfileBannerBlob);
    };

    const convertBlob = (blobUrl, setBlob) => {
        fetch(blobUrl)
            .then((res) => res.blob())
            .then((blob) => {
                const fileName = `image_${Date.now()}.png`; // Example file name
                const file = new File([blob], fileName, { type: blob.type });
                setBlob(file);
            })
            .catch((error) => console.error("Error converting to Blob:", error));
    };

    const uploadFile = async (file) => {
        const formData = new FormData();
        formData.append("img", file);
        try {
            const response = await AxiosInstance.post("/api/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            return response.data.url;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw new Error("File upload failed");
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        
        setSuccessMessage("");

        try {
            let uploadedProfilePic = profilePicBlob ? await uploadFile(profilePicBlob,) : profilePic;
            let uploadedProfileBanner = profileBannerBlob ? await uploadFile(profileBannerBlob) : profileBanner;
            const payload = {
                username: DOMPurify.sanitize(username),
                bio: DOMPurify.sanitize(bio),
                interests,
                profile_pic: uploadedProfilePic,
                profile_banner: uploadedProfileBanner,
            };

            const response = await AxiosInstance.put("/api/profile/", payload, {
                withCredentials: true,
            });
            console.log("Profile update response:", response.data);
            setSuccessMessage("Profile updated successfully!"); // Set success message
            
            // Hide success message after 3 seconds
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        console.log("Current Password:", currentPassword);
        console.log("New Password:", newPassword);
        console.log("Confirm New Password:", confirmNewPassword);

        if (newPassword !== confirmNewPassword) {
            setPasswordError("New password and confirmation do not match.");
            return;
        }

        try {
            const response = await AxiosInstance.put(
                "/api/change-password/",
                {
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmNewPassword,
                },
                { withCredentials: true }
            );
            console.log("Password update response:", response.data); // Log successful response
            setPasswordSuccess("Password updated successfully!");

            // Hide success message after 3 seconds
            setTimeout(() => setPasswordSuccess(""), 3000);

            // Reset the input fields
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error) {
            console.error("Password update error:", error.response?.data || error.message); // Log detailed error
            setPasswordError(error.response?.data?.error || "Unknown error");
        }
    }; 

    return (
        <>
            <Helmet>
                <title>{username ? username: `Profile`} - Synapse Space</title>
            </Helmet>
        <NavBar />
        <main className="flex flex-col items-center justify-center p-5 mt-20 sm:mx-64">          
            <div className="relative w-full max-w-3xl p-10 rounded-lg shadow-lg bg-base-200">
                {/* Back Button */}
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4"
                >
                    <div className="p-3 rounded-full bg-base-200 hover:bg-neutral">
                        <FontAwesomeIcon
                            icon={faCaretSquareLeft}
                            className="text-secondary hover:text-accent"
                            size="2xl"
                        />
                    </div>
                </button>
                <br />
                <br />
                <dialog id="avatar-cropper" className="modal modal-bottom sm:modal-middle">
                    {avatarImageSrc && <AvatarCropper imageSrc={avatarImageSrc} onCropComplete={handleAvatarCrop} />}
                </dialog>
                <dialog id="banner-cropper" className="modal modal-bottom sm:modal-middle">
                    {bannerImageSrc && <BannerCropper imageSrc={bannerImageSrc} onCropComplete={handleBannerCrop} />}
                </dialog>
                <h1 className="mb-8 text-3xl font-bold">Edit Profile</h1>
                <form onSubmit={handleProfileSubmit} className="space-y-6 form-control">
                    {successMessage && <p className="text-sm text-center text-green-600">{successMessage}</p>}
                    <Banner profName={username} profAvatar={profilePic} profBanner={profileBanner} />
                    <div className="flex flex-row justify-center gap-3 ">
                        <div>
                            <label className="block m-6 mb-2 text-sm font-bold" htmlFor="avatar">
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                id="avatar"
                                onChange={handleAvatarChange}
                                className="w-full max-w-xs file-input file-input-bordered file-input-accent"
                                accept="image/png, image/jpeg"
                            />
                        </div>
                        <div>
                            <label className="block m-6 mb-2 text-sm font-bold" htmlFor="banner">
                                Profile Banner
                            </label>
                            <input
                                type="file"
                                id="banner"
                                onChange={handleBannerChange}
                                className="w-full max-w-xs file-input file-input-bordered file-input-accent"
                                accept="image/png, image/jpeg"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 text-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold" htmlFor="bio">
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            rows="4"
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full p-3 text-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold" htmlFor="interests">
                            Interests
                        </label>
                        <TagInput
                            value={interests}
                            onChange={setInterests}
                            placeholder="Add tags (e.g., food (press enter button))..."
                            className="w-full input-bordered placeholder-neutral dark:placeholder-accent"
                        />
                    </div>
                    <div className="text-center">
                        <button type="submit" className="px-6 py-3 text-white rounded-lg btn btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            <div className="w-full max-w-3xl p-10 mt-10 rounded-lg shadow-lg bg-base-200">
                <h1 className="mb-8 text-3xl font-bold">Update Password</h1>
                <form onSubmit={handlePasswordSubmit} className="space-y-6 form-control">
                    {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                    {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}

                    {/* Current Password Field */}
                    <div className="relative">
                        <label className="block mb-2 text-sm font-bold" htmlFor="currentPassword">
                            Current Password
                        </label>
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            id="currentPassword"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full p-3 text-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <FontAwesomeIcon
                            icon={showCurrentPassword ? faEye : faEyeSlash}
                            className={`absolute right-3 top-12 cursor-pointer ${
                                document.documentElement.getAttribute("data-theme") === "dark" ? "text-black" : "text-gray-600"
                            }`}
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        />
                    </div>

                    {/* New Password Field */}
                    <div className="relative">
                        <label className="block mb-2 text-sm font-bold" htmlFor="newPassword">
                            New Password
                        </label>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-3 text-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <FontAwesomeIcon
                            icon={showNewPassword ? faEye : faEyeSlash}
                            className={`absolute right-3 top-12 cursor-pointer ${
                                document.documentElement.getAttribute("data-theme") === "dark" ? "text-black" : "text-gray-600"
                            }`}
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        />
                    </div>

                    {/* Confirm New Password Field */}
                    <div className="relative">
                        <label className="block mb-2 text-sm font-bold" htmlFor="confirmNewPassword">
                            Confirm New Password
                        </label>
                        <input
                            type={showConfirmNewPassword ? "text" : "password"}
                            id="confirmNewPassword"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="w-full p-3 text-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <FontAwesomeIcon
                            icon={showConfirmNewPassword ? faEye : faEyeSlash}
                            className={`absolute right-3 top-12 cursor-pointer ${
                                document.documentElement.getAttribute("data-theme") === "dark" ? "text-black" : "text-gray-600"
                            }`}
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            className="px-6 py-3 text-white rounded-lg shadow-md bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </main>
        <Footer/>
        </>
    );
};

export default EditProfile;
