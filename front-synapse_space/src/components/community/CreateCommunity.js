import React, { useState, useContext } from "react";
import DOMPurify from "dompurify";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";
import Banner from "./Banner";
import AvatarCropper from "../avatarCropper";
import BannerCropper from "./BannerCropper";
import { useMemberships } from "../../context/MembershipContext";


const CreateCommunity = () => {
    let [error, setError] = useState(null);
    let [success, setSuccess] = useState(null);
    const API_URL = process.env.REACT_APP_API_BASE_URI;
    const { user } = useContext(AuthContext);
    const [communityName, setCommunityName] = useState("");
    const [communityAvatar, setCommunityAvatar] = useState(null);
    const [communityBanner, setCommunityBanner] = useState(null);
    const [communityAvatarBlob, setCommunityAvatarBlob] = useState(null);
    const [communityBannerBlob, setCommunityBannerBlob] = useState(null);
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState("");
    const [keyword, setKeyword] = useState("");
    const [imageSrc, setImageSrc] = useState(null);
    const { fetchMemberships } = useMemberships();

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
            document.getElementById('avatar-cropper').showModal()
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
            document.getElementById('banner-cropper').showModal()
        }
    };

    const handleAvatarCrop = (croppedImg) => {
        setCommunityAvatar(croppedImg);
        handleAvatarCropBlob(croppedImg);
    };

    const handleBannerCrop = (croppedImg) => {
        setCommunityBanner(croppedImg);
        handleBannerCropBlob(croppedImg);
    };
    const handleAvatarCropBlob = (croppedImgUrl) => {
        // Convert the blob URL to a Blob object
        fetch(croppedImgUrl)
            .then((res) => res.blob())
            .then((blob) => {
                setCommunityAvatarBlob(blob);
            })
            .catch((error) => {
                console.error("Error converting avatar URL to Blob:", error);
            });
    };

    const handleBannerCropBlob = (croppedImgUrl) => {
        // Convert the blob URL to a Blob object
        fetch(croppedImgUrl)
            .then((res) => res.blob())
            .then((blob) => {
                setCommunityBannerBlob(blob);
            })
            .catch((error) => {
                console.error("Error converting banner URL to Blob:", error);
            });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", DOMPurify.sanitize(communityName));
        formData.append("description", DOMPurify.sanitize(description));
        formData.append("rules", DOMPurify.sanitize(rules));
        formData.append("keyword", DOMPurify.sanitize(keyword));
        formData.append("owned_by", `${user.student_number}`);

        if (communityAvatar) {
            // Assuming `communityAvatar` is a Blob or File object after cropping
            formData.append("img", communityAvatarBlob, "avatar.png");
        }

        if (communityBanner) {
            // Assuming `communityBanner` is a Blob or File object after cropping
            formData.append("banner", communityBannerBlob, "banner.png");
        }

        try {
            const response = await axios.post(`${API_URL}/api/community/create/`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 201) {
                setCommunityName("");
                setDescription("");
                setRules("");
                setKeyword("");
                setCommunityAvatar(null);
                setCommunityBanner(null);
                setSuccess("Community created successfully");
                console.log("Community created successfully");
                window.location.href = `/community/${response.data.id}`;
                // refetch memberships after creating community
                fetchMemberships();
            } else {
                setError("Failed to create community");
            }
        } catch (error) {
            setError("Error creating community: " + (error.response?.data || "Unknown error"));
            console.error("An error occurred:", error);
        }
    };


    return (
        <main className="p-5 mt-20 sm:mx-64 flex justify-center items-center">
            <div className="bg-base-200 p-10 rounded-lg shadow-lg w-full max-w-3xl">
                {error && <ErrorAlert text={error} />}
                {success && <SuccessAlert text={success} />}
                <dialog id="avatar-cropper" className="modal modal-bottom sm:modal-middle">
                    {imageSrc && (
                        <AvatarCropper imageSrc={imageSrc} onCropComplete={handleAvatarCrop} cropShape="round" />

                    )}
                </dialog>
                <dialog id="banner-cropper" className="modal modal-bottom sm:modal-middle">
                    {imageSrc && (
                        <BannerCropper imageSrc={imageSrc} onCropComplete={handleBannerCrop} cropShape="rectangle" />

                    )}
                </dialog>
                <h1 className="text-3xl font-bold mb-8">Create Community</h1>

                <form onSubmit={handleSubmit} className="form-control space-y-6">
                    <Banner communityName={communityName} commAvatar={communityAvatar} commBanner={communityBanner} />

                    <div className="flex flex-row justify-center gap-3">
                        <div>
                            <label className="block text-sm font-bold mb-2" htmlFor="commImg">
                                Community Avatar</label>
                            <input
                                type="file"
                                id="commImg"
                                onChange={handleAvatarChange}
                                className="file-input file-input-bordered file-input-accent w-full max-w-xs"
                                accept="image/png, image/jpeg"
                            />

                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2" htmlFor="commBanner">
                                Community Banner</label>
                            <input
                                type="file"
                                id="commBanner"
                                onChange={handleBannerChange}
                                className="file-input file-input-bordered file-input-accent w-full max-w-xs"
                                accept="image/png, image/jpeg"
                            />
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-bold mb-2" htmlFor="communityName">
                            Community Name
                        </label>
                        <input
                            type="text"
                            id="communityName"
                            value={communityName}
                            className="w-full p-3 rounded-lg border text-black border-gray-600 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter community name"
                            onChange={(e) => setCommunityName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            className="w-full p-3 rounded-lg border text-black border-gray-600 focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your community"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2" htmlFor="rules">
                            Community Rules and Regulations
                        </label>
                        <textarea
                            id="rules"
                            className="w-full p-3 rounded-lg border text-black border-gray-600 focus:ring-2 focus:ring-blue-500"
                            value={rules}
                            placeholder="Enter community rules"
                            rows="4"
                            onChange={(e) => setRules(e.target.value)}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-2" htmlFor="keyword">
                            Community Keyword
                            <p className="text-xs font-light mb-2">Seperate keywords with comma ","</p>
                        </label>

                        <input
                            type="text"
                            id="keyword"
                            value={keyword}
                            className="w-full p-3 rounded-lg border text-black border-gray-600 focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter keywords"
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className="text-center">
                        <button type="submit" className="btn btn-primary text-white px-6 py-3 rounded-lg">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default CreateCommunity;
