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
import AxiosInstance from "../../utils/AxiosInstance";
import { TagInput } from '../TagInput';


const CreateCommunity = () => {
    let [error, setError] = useState(null);
    let [success, setSuccess] = useState(null);
    const [tags, setTags] = useState<string[]>([]);
    const API_URL = import.meta.env.VITE_API_BASE_URI;
    const { user } = useContext(AuthContext);
    const [communityName, setCommunityName] = useState("");
    const [communityAvatar, setCommunityAvatar] = useState(null);
    const [communityBanner, setCommunityBanner] = useState(null);
    const [communityAvatarBlob, setCommunityAvatarBlob] = useState(null);
    const [communityBannerBlob, setCommunityBannerBlob] = useState(null);
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState("");
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
        tags.forEach((tag, index) => {
            formData.append(`keyword[${index}]`, tag);
        });

        if (communityAvatar) {
            // Assuming communityAvatar is a Blob or File object after cropping
            formData.append("img", communityAvatarBlob, "avatar.png");
        }

        if (communityBanner) {
            // Assuming communityBanner is a Blob or File object after cropping
            formData.append("banner", communityBannerBlob, "banner.png");
        }

        try {
            const response = await AxiosInstance.post('/api/community/create/', formData, { withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (response.status === 201) {
                setCommunityName("");
                setDescription("");
                setRules("");
                setTags([]);
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
        <main className="flex items-center justify-center p-5 mt-20 sm:mx-64">
            <div className="w-full max-w-3xl p-10 rounded-lg shadow-lg bg-base-200">
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
                <h1 className="mb-8 text-3xl font-bold">Create Community</h1>

                <form onSubmit={handleSubmit} className="space-y-6 form-control">
                    <Banner communityName={communityName} commAvatar={communityAvatar} commBanner={communityBanner} />

                    <div className="flex flex-row justify-center gap-3">
                        <div>
                            <label className="block mb-2 text-sm font-bold" htmlFor="commImg">
                                Community Avatar</label>
                            <input
                                type="file"
                                id="commImg"
                                onChange={handleAvatarChange}
                                className="w-full max-w-xs file-input file-input-bordered file-input-accent"
                                accept="image/png, image/jpeg"
                            />

                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-bold" htmlFor="commBanner">
                                Community Banner</label>
                            <input
                                type="file"
                                id="commBanner"
                                onChange={handleBannerChange}
                                className="w-full max-w-xs file-input file-input-bordered file-input-accent"
                                accept="image/png, image/jpeg"
                            />
                        </div>
                    </div>


                    <div>
                        <label className="block mb-2 text-sm font-bold" htmlFor="communityName">
                            Community Name
                        </label>
                        <input
                            type="text"
                            id="communityName"
                            value={communityName}
                            className="w-full p-3 text-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter community name"
                            onChange={(e) => setCommunityName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold" htmlFor="description">
                            Description
                        </label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            className="w-full p-3 text-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe your community"
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold" htmlFor="rules">
                            Community Rules and Regulations
                        </label>
                        <textarea
                            id="rules"
                            className="w-full p-3 text-black border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={rules}
                            placeholder="Enter community rules"
                            rows="4"
                            onChange={(e) => setRules(e.target.value)}
                        ></textarea>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-bold" htmlFor="keyword">
                            Community Tags
                        </label>

                        <TagInput
                            value={tags}
                            onChange={setTags}
                            placeholder="Add tags (e.g., 'react', 'typescript')..."
                        />
                    </div>
                    <div className="text-center">
                        <button type="submit" className="px-6 py-3 text-white rounded-lg btn btn-primary">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default CreateCommunity;