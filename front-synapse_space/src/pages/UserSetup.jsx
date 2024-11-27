import React, {useContext, useEffect, useRef, useState} from "react";
import { User, Briefcase, Image, Plus } from "lucide-react";
import ErrorAlert from "../components/ErrorAlert";
import SuccessAlert from "../components/SuccessAlert";
import Loading from "../components/Loading";
import AuthContext from "../context/AuthContext";
import AxiosInstance from "../utils/AxiosInstance";
import {useNavigate} from "react-router-dom";
import { TagInput } from "../components/TagInput";
import {Helmet} from "react-helmet-async";

const interestOptions = [
    "Sports", "Music", "Art", "Technology", "Science", "Literature", "Travel", "Cooking", "Photography", "Gaming"
];


function UserSetup() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const dialogRef = useRef(null);
    const { user } = useContext(AuthContext);
    const [programs, setPrograms] = useState([]);
    const [formData, setFormData] = useState({
        username: "",              // Matches 'username'
        student_number: 0,         // Matches 'student_number'
        program: null,                // Matches 'program'
        profile_pic: "",            // Temporary Blob URL for 'profile_pic'
        registration_form: "",      // Temporary Blob URL for 'registration_form'
        interests: [],              // Matches 'interests'
        bio: "",                    // Matches 'bio'
        is_verified: false,
        is_rejected: false// Matches 'is_verified'
    });
    const [profilePic, setProfilePic] = useState("https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp");
    const [regForm, setRegForm] = useState("https://placehold.jp/300x300.png");
    const [customInterest, setCustomInterest] = useState("");
    const [Error, setError] = useState(null);
    const [Success, setSuccess] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTagChange = (newTags) => {
        setTags(newTags);
        setFormData(prev => ({ ...prev, interests: newTags }));
    };

    const handleFileChange = (e) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const blobUrl = URL.createObjectURL(file);
            setProfilePic(blobUrl);
            setFormData((prev) => ({ ...prev, profile_pic: e.target.files[0] }));
        }
    };

    const handleRegFormFileChange = (e) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const blobUrl = URL.createObjectURL(file);
            setRegForm(blobUrl);
            setFormData((prev) => ({ ...prev, registration_form: e.target.files[0] }));
        }
    };


    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append('img', file);


        try {
            const response = await AxiosInstance.post('/api/upload/', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.url; // Assuming the response returns the uploaded file URL
        } catch (error) {
            setError('Error uploading file: ' + error.message);
            throw error;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        const { username, student_number, program, interests } = formData;
        if (!username || !student_number || !program || interests.length === 0) {
            setError("Please fill out all fields.");
            return;
        }
        setLoading(true)
        try {
            // Upload profile picture and registration form
            const profilePicUrl = formData.profile_pic ? await handleFileUpload(formData.profile_pic):"";
            const regFormUrl = await handleFileUpload(formData.registration_form);

            // Prepare the final payload
            const payload = {
                ...formData,
                profile_pic: profilePicUrl,
                registration_form: regFormUrl,
            };
            // Send the final payload to the server
            const response = await AxiosInstance.put(`/api/verify/account/`, payload, {
                withCredentials: true,
            });
            setSuccess("User setup successful");
            window.location.reload();
            setSuccess(null);

        } catch (error) {
            console.error('Error submitting form:', error);
            setLoading(false);

            if (error.response) {
                // Assuming error.response.data is the object you provided
                const errorData = error.response.data;

                // Get the keys of the error object
                const errorKeys = Object.keys(errorData);

                // Check if there are any errors and get the first one
                if (errorKeys.length > 0) {
                    const firstErrorKey = errorKeys[0]; // Get the first error key
                    const firstErrorMessage = errorData[firstErrorKey][0]; // Get the first error message for that key
                    setError(`Error: ${firstErrorMessage}`);
                } else {
                    setError('Unknown error occurred.');
                }
            } else {
                // Fallback for network or other errors
                setError('Error submitting form: ' + error.message);
            }
        } finally {
            setLoading(false);
            document.getElementById('loading-modal').close();
        }
    };


    useEffect(() => {
        try {
            AxiosInstance.get('/api/admin/program/')
                .then(response => {
                    setPrograms(response.data);
                    // Set the program to the first item in the response
                    if (response.data && response.data.length > 0) {
                        setFormData(prevData => ({
                            ...prevData,
                            program: response.data[0].id
                        }));
                    }
                })
                .catch(error => {
                    setError(error)
                });
        } catch (error) {
            setError(error)
        }
    }, []);

    useEffect(() => {
        if (loading) {
            document.getElementById('loading-modal').showModal();
        }
    }, [loading]);

    return (
        <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-4">
            <Helmet>
                <title>Account Setup - Synapse Space</title>
            </Helmet>
            {Error && <ErrorAlert text={Error}/>}
            {Success && <SuccessAlert text={Success}/>}
            <dialog
                ref={dialogRef}
                id="loading-modal"
                className="modal modal-bottom sm:modal-middle"
                onClose={(e) => e.preventDefault()}
                onCancel={(e) => e.preventDefault()}
            >
                <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
                    <Loading loadingText="Please wait..."/>
                </form>
            </dialog>

            <div className="bg-base-100 shadow-xl flex flex-col rounded-lg p-6 w-full max-w-xl">
                <h2 className="text-lg font-bold mb-4 text-center">Setup your Account</h2>
                <h2 className="text-sm font-bold mb-4 text-center">{step === 1 ? "Step 1 of 2" : "Step 2 of 2"}</h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <div className="flex flex-col w-full max-w-xl h-100">
                            <div className="flex flex-row justify-center h-100 gap-5">
                                <div className="w-100 mx-3">
                                    <div className="form-control">
                                        <div className="form-control mt-4">
                                            <div className="avatar">
                                                <div className="w-24 rounded-full mx-auto">
                                                    <img src={profilePic} alt="profilePic"/>
                                                </div>
                                            </div>
                                            <label className="label">
                                                <span className="label-text">Profile Picture</span>
                                            </label>
                                            <div className="input-group">
                                                <span><Image size={18}/></span>
                                                <input
                                                    type="file"
                                                    name="profile_pic"
                                                    onChange={handleFileChange}
                                                    className="file-input file-input-bordered w-full"
                                                    accept="image/*"
                                                />
                                            </div>
                                        </div>
                                        <label className="label">
                                            <span className="label-text">Username</span>
                                        </label>
                                        <div className="input-group">
                                            <span><User size={18}/></span>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                placeholder='Enter your username'
                                                className="input input-bordered w-full"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control mt-4">
                                        <label className="label">
                                            <span className="label-text">Student Number</span>
                                        </label>
                                        <div className="input-group">
                                            <span><Briefcase size={18}/></span>
                                            <input
                                                type="number"
                                                name="student_number"
                                                value={formData.student_number}
                                                onChange={handleInputChange}
                                                placeholder="Enter student number"
                                                className="input input-bordered w-full"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-control mt-4">
                                        <label className="label">
                                            <span className="label-text">Program</span>
                                        </label>
                                        <select
                                            name="program"
                                            value={formData?.program}
                                            onChange={handleInputChange}
                                            className="select select-bordered w-full"
                                            required
                                        >
                                            {programs?.map((program) => (
                                                <option key={program?.id} value={program?.id}>
                                                    {program?.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="w-100 flex justify-center items-center mx-3">
                                    <div className="form-control">
                                        <div className="form-control mt-4">
                                            <div className="mx-auto p-4 object-none ">
                                                <img className="h-80 w-80" src={regForm} alt="regform"/>
                                            </div>
                                            <div className="input-group">
                                                <span><span>Upload Registration Form</span></span>
                                                <input
                                                    type="file"
                                                    name="registration_form"
                                                    onChange={handleRegFormFileChange}
                                                    className="file-input file-input-bordered w-full"
                                                    accept="image/*"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="btn btn-primary w-full mt-6"
                            >
                                Next
                            </button>
                        </div>
                    ) : (
                        <>
                            <label className="block text-sm font-medium">
                                <span>Interests</span>
                                <label className="block text-sm font-medium">
                                    <span className="text-xs text-secondary">Press Enter to add an interest</span>
                                </label>
                            </label>

                            <TagInput
                                value={tags}
                                onChange={handleTagChange}
                                placeholder="Add tags (e.g., 'react', 'typescript')..."
                            />

                            <div className="form-control mt-4">
                                <label className="label"><span className="label-text">Bio</span></label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Write a short bio"
                                    rows={5}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-6"
                            >
                                Submit
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="btn btn-secondary w-full mt-2"
                            >
                                Back
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}

export default UserSetup;
