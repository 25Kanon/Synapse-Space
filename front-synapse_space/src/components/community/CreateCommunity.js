import React, { useState, useCallback, useContext } from "react";
import DOMPurify from "dompurify";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";
import Banner from "./Banner";
import AvatarCropper from "../avatarCropper";

const CreateCommunity = () => {
    let [error, setError] = useState(null);
    let [success, setSuccess] = useState(null);
    const { user } = useContext(AuthContext);

    const [communityName, setCommunityName] = useState("");
    const [communityAvatar, setCommunityAvatar] = useState("");
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState("");
    const [keyword, setKeyword] = useState("");
    const API_URL = process.env.REACT_APP_API_BASE_URI;

    const [imageSrc, setImageSrc] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);

    const handleImageChange = (e) => {
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

    const handleCropComplete = (croppedImg) => {
        setCroppedImage(croppedImg);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            name: DOMPurify.sanitize(communityName),
            description: DOMPurify.sanitize(description),
            rules: DOMPurify.sanitize(rules),
            keyword: DOMPurify.sanitize(keyword),
            owned_by: `${user.student_number}`,
        };

        try {
            const response = await axios.post(`${API_URL}api/community/create/`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 200 || 201) {
                setCommunityName("");
                setDescription("");
                setRules("");
                setKeyword("");
                setSuccess("Community created successfully");
            } else {
                setError("Failed to create community");
            }
        } catch (error) {
            setError("Error creating community:", error.response.data);
            console.error("An error occurred:", error.response.data);
        }
    };

    return (
        <main className="p-5 mt-20 sm:mx-64 flex justify-center items-center">
            <div className="bg-base-200 p-10 rounded-lg shadow-lg w-full max-w-3xl">
                {error && <ErrorAlert text={error} />}
                {success && <SuccessAlert text={success} />}
                <dialog id="avatar-cropper" className="modal modal-bottom sm:modal-middle">
                    {imageSrc && (
                        <AvatarCropper imageSrc={imageSrc} onCropComplete={handleCropComplete} />

                    )}
                </dialog>
                <h1 className="text-3xl font-bold mb-8">Create Community</h1>

                <form onSubmit={handleSubmit} className="form-control space-y-6">
                    <Banner communityName={communityName} commAvatar={croppedImage} />

                    <div>
                        <input
                            type="file"
                            id="commImg"
                            onChange={handleImageChange}
                            className="w-full p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                            accept=".jpg, .jpeg, .png"
                        />
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
