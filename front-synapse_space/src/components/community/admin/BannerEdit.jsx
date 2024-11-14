import React, { useEffect, useRef, useState } from "react";
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { Lock, Unlock } from 'lucide-react';
import AvatarCropper from "../../avatarCropper";
import BannerCropper from "../BannerCropper";
import SuccessAlert from '../../SuccessAlert';
import ErrorAlert from '../../ErrorAlert';
import Loading from '../../Loading';
import AxiosInstance from "../../../utils/AxiosInstance";


const BannerEdit = ({ communityName, commAvatar, commBanner, communityID, communityPrivacy, onUpdate }) => {
    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const [communityAvatarBlob, setCommunityAvatarBlob] = useState(null);
    const [communityBannerBlob, setCommunityBannerBlob] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');
    const dialogRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    const handleAvatarIconClick = () => {
        avatarInputRef.current.click();
    };

    const handleBannerIconClick = () => {
        bannerInputRef.current.click();
    };

    // Handle Avatar Change
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
            document.getElementById('avatar-cropper').showModal();
        }
    };

    // Handle Banner Change
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageSrc(reader.result);
            };
            reader.readAsDataURL(file);
            document.getElementById('banner-cropper').showModal();
        }
    };

    const blobToFile = (blob, fileName) => {
        return new File([blob], fileName, { type: blob.type });
    };

    // Handle Avatar Crop and Upload
    const handleAvatarCrop = (croppedImgUrl) => {
        fetch(croppedImgUrl)
            .then(res => res.blob())
            .then((blob) => {
                const file = blobToFile(blob, `avatar-${Date.now()}.png`);
                uploadImage(file, "avatar");
            })
            .catch((error) => {
                console.error("Error converting avatar URL to Blob:", error);
            });
    };

    // Handle Banner Crop and Upload
    const handleBannerCrop = (croppedImgUrl) => {
        fetch(croppedImgUrl)
            .then(res => res.blob())
            .then((blob) => {
                const file = blobToFile(blob, `banner-${Date.now()}.png`);
                uploadImage(file, "banner");
            })
            .catch((error) => {
                console.error("Error converting banner URL to Blob:", error);
            });
    };

    // Upload Image to the backend and get the URL
    const uploadImage = async (imageBlob, type) => {
        const formData = new FormData();
        formData.append("img", imageBlob, `${type}-${Date.now()}.png`);
        setLoading(true);
        try {
            const response = await AxiosInstance.post('/api/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = response.data.url;
            if (type === "avatar") {
                updateCommunity({ imgURL: imageUrl });
            } else if (type === "banner") {
                updateCommunity({ bannerURL: imageUrl });
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setLoading(false)
        }
    };

    // Function to update community name
    const updateCommunityName = async (event) => {
        event.preventDefault(); // Prevent form submission

        const name = event.target.commName.value; // Get value from the input field
        if (!name) {
            setError("Community Name is required");
        } else {
            updateCommunity({ name: name });
        }
    };

    // Function to update community privacy
    const updateCommunityPrivacy = async (event) => {
        event.preventDefault(); // Prevent form submission

        // Toggle privacy based on current privacy status
        const newPrivacy = communityPrivacy === "private" ? "public" : "private";
        updateCommunity({ privacy: newPrivacy });
    };

    // Function to update the community with new data
    const updateCommunity = async (updatedData) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.put(`/api/community/update/${communityID}/`, updatedData, {
                withCredentials: true
            });
            setSuccess("Community updated successfully!");
            console.log("Community updated successfully:", response.data);
            onUpdate();
        } catch (error) {
            setError("Error updating community");
            console.error("Error updating community:", error);
        } finally {
            setLoading(false);
            document.getElementById('loading').close();
        }
    };

    useEffect(() => {
        const dialog = dialogRef.current;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        if (dialog) {
            dialog.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (dialog) {
                dialog.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    useEffect(() => {
        if (loading) {
            document.getElementById('loading').showModal();
        }
    }, [loading]);

    return (
        <>
            {error && <ErrorAlert text={error} />}
            {success && <SuccessAlert text={success} />}
            <dialog
                ref={dialogRef}
                id="loading"
                className="modal modal-bottom sm:modal-middle"
                onClose={(e) => e.preventDefault()}
                onCancel={(e) => e.preventDefault()}
            >
                <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
                    <Loading loadingText="Please wait..." />
                </form>
            </dialog>

            <div>
                <button className="absolute z-2 btn btn-circle btn-accent" onClick={handleBannerIconClick}>
                    <PencilSquareIcon className="h-5 w-5" />
                </button>

                <input
                    type="file"
                    ref={bannerInputRef}
                    id="commImg"
                    onChange={handleBannerChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                />

                <div className="px-3 pb-4 bg-base-200 my-3 rounded-lg">
                    <div className="rounded-t-lg h-32 overflow-hidden">
                        <div className="bg-neutral text-neutral-content rounded h-32">
                            {commBanner ? (
                                <img className="object-cover object-top h-full w-full" src={commBanner} alt={`Banner-${communityName}`} />
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>

                    <div className="ml-3 w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
                        <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content h-32 rounded-full">
                                {commAvatar ? (
                                    <img src={commAvatar} alt={`avatar-${communityName}`} />
                                ) : (
                                    <h2 className="text-lg font-bold">{getInitials(communityName)}</h2>
                                )}
                            </div>
                        </div>
                    </div>
                    <button className="absolute z-40 -mt-10 mr-20 btn btn-circle btn-accent" onClick={handleAvatarIconClick}>
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>

                    <input
                        type="file"
                        ref={avatarInputRef}
                        id="commImg"
                        onChange={handleAvatarChange}
                        className="hidden"
                        accept="image/png, image/jpeg"
                    />

                    <dialog id="avatar-cropper" className="modal modal-bottom sm:modal-middle">
                        {imageSrc && <AvatarCropper imageSrc={imageSrc} onCropComplete={handleAvatarCrop} cropShape="round" />}
                    </dialog>
                    <dialog id="banner-cropper" className="modal modal-bottom sm:modal-middle">
                        {imageSrc && <BannerCropper imageSrc={imageSrc} onCropComplete={handleBannerCrop} cropShape="rectangle" />}
                    </dialog>

                    <div className="flex flex-row space-between gap-52 px-36">
                        <div className="text-left">
                            <form className="-mt-8" onSubmit={updateCommunityName}>
                                <label className="label" htmlFor="commName">
                                    <span className="label-text">Community Name</span>
                                </label>
                                <input name="commName" type="text" defaultValue={communityName} className="input input-bordered w-wrap" />
                                <button type="submit" className="btn btn-primary m-2">Save</button>
                            </form>
                        </div>

                        <div className="text-end">
                            <form className="-mt-8" onSubmit={updateCommunityPrivacy}>
                                <label className="label text-center" htmlFor="commPrivacy">
                                    <span className="label-text">Community Privacy</span>
                                </label>
                                <button type="submit" className="btn btn-warning m-2 w-full">
                                    {communityPrivacy === "private" ? <><Unlock /> Make Community Public</> : <><Lock /> Make Community Private</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BannerEdit;
