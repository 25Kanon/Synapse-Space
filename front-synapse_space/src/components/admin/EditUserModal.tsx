import React, { useContext, useEffect, useState } from "react";
import { User, Briefcase, Image, Plus } from "lucide-react";
import ErrorAlert from "../ErrorAlert";
import SuccessAlert from "../SuccessAlert";
import AuthContext from "../../context/AuthContext";
import axiosInstance from "../../utils/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { TagInput } from "../TagInput";

function EditUserModal({ user }) {
    const navigate = useNavigate();
    const [tags, setTags] = useState<string[]>([]);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: "",
        student_number: 0,
        program: "",
        profile_pic: "",
        registration_form: "",
        interests: [],
        bio: "",
        is_verified: true,
    });
    const [profilePic, setProfilePic] = useState("");
    const [regForm, setRegForm] = useState("");
    const [Error, setError] = useState(null);
    const [Success, setSuccess] = useState(null);
    const [willUploadPfp, setWillUploadPfp] = useState(false);
    const [willUploadReg, setWillUploadReg] = useState(false);

    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle profile picture upload
    const handleFileChange = (e) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const blobUrl = URL.createObjectURL(file);
            setProfilePic(blobUrl);
            setWillUploadPfp(true);
            setFormData((prev) => ({ ...prev, profile_pic: e.target.files[0] }));
        }
    };

    // Handle registration form upload
    const handleRegFormFileChange = (e) => {
        if (e.target.files) {
            const file = e.target.files[0];
            const blobUrl = URL.createObjectURL(file);
            setRegForm(blobUrl);
            setWillUploadReg(true);
            setFormData((prev) => ({
                ...prev,
                registration_form: e.target.files[0],
            }));
        }
    };

    // Handle file upload to server
    const handleFileUpload = async (file) => {
        const formData = new FormData();
        formData.append("img", file);

        try {
            const response = await axiosInstance.post("/api/upload/", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(response);
            return response.data.url; // Assuming the response returns the uploaded file URL
        } catch (error) {
            console.error("Error uploading file:", error);
            setError("Error uploading file: " + error.message);
            throw error;
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const { username, student_number, program, interests, bio } = formData;

        // Validation: Ensure all required fields are filled
        if (!username || !student_number || !program || interests.length === 0) {
            setError("Please fill out all fields.");
            return;
        }

        try {
            // Prepare the final payload, only including modified fields
            const payload = {};

            if (formData.username !== user.username) payload.username = formData.username;
            if (formData.student_number !== user.student_number) payload.student_number = formData.student_number;
            if (formData.program !== user.program) payload.program = formData.program;
            if (formData.bio !== user.bio) payload.bio = formData.bio;
            if (formData.is_verified !== user.is_verified) payload.is_verified = formData.is_verified;
            if (tags !== user.interests) payload.interests = tags;

            // Only upload the profile picture if it's changed
            let profilePicUrl = formData.profile_pic;
            if (willUploadPfp) {
                profilePicUrl = await handleFileUpload(formData.profile_pic);
                payload.profile_pic = profilePicUrl;
            }

            // Only upload the registration form if it's changed
            let regFormUrl = formData.registration_form;
            if (willUploadReg) {
                regFormUrl = await handleFileUpload(formData.registration_form);
                payload.registration_form = regFormUrl;
            }

            // If no changes were made, show a message and exit
            if (Object.keys(payload).length === 0) {
                setError("No changes were made.");
                return;
            }

            payload.id = user.id; // Include the user's ID in the payload

            // Send the final payload to the server
            const response = await axiosInstance.put(
                `/api/admin/account/update/`,
                payload,
                { withCredentials: true }
            );

            setSuccess("User updated successfully");

            // Optional: Delay reload to let success message show
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error("Error submitting form:", error);
            setError("Error submitting form: " + (error.response?.data?.message || error.message));
        }
    };

    // Set initial form data from user props
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                student_number: user.student_number || 0,
                program: user.program || '',
                profile_pic: user.profile_pic || '',
                registration_form: user.registration_form || '',
                interests: user.interests || [],
                bio: user.bio || '',
                is_verified: user.is_verified || true,
            });
            setProfilePic(user.profile_pic || '');
            setRegForm(user.registration_form || '');
            setTags(user?.interests ? user?.interests : [])
        }
    }, [user]);

    return (
        <div className="bg-base-200 w-lg flex flex-col items-center justify-center">
            {Error && <ErrorAlert text={Error} />}
            {Success && <SuccessAlert text={Success} />}
            <div className="bg-base-100 shadow-xl flex flex-col rounded-lg p-6 w-full max-w-xl">
                <h2 className="text-lg font-bold mb-4 text-center">Edit User Account</h2>
                <h2 className="text-sm font-bold mb-4 text-center">
                    {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
                </h2>
                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        <div className="flex flex-col w-full max-w-xl h-100">
                            <div className="flex flex-row justify-center h-100 gap-5">
                                <div className="w-100 mx-3">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Profile Picture</span>
                                        </label>
                                        <div className="input-group">
                                            <span>
                                                <Image size={18} />
                                            </span>
                                            <input
                                                type="file"
                                                name="profile_pic"
                                                onChange={handleFileChange}
                                                className="file-input file-input-bordered w-full"
                                                accept="image/*"
                                            />
                                        </div>
                                        {profilePic && (
                                            <div className="mt-4">
                                                <img src={profilePic} alt="Profile Preview" className="w-24 h-24 rounded-full" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-control mt-4">
                                        <label className="label">
                                            <span className="label-text">Username</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            placeholder="Enter your username"
                                            className="input input-bordered w-full"
                                            required
                                        />
                                    </div>

                                    <div className="form-control mt-4">
                                        <label className="label">
                                            <span className="label-text">Student Number</span>
                                        </label>
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

                                    <div className="form-control mt-4">
                                        <label className="label">
                                            <span className="label-text">Program</span>
                                        </label>
                                        <select
                                            name="program"
                                            value={formData.program}
                                            onChange={handleInputChange}
                                            className="select select-bordered w-full"
                                            required
                                        >
                                            <option value="">Select program</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Engineering">Engineering</option>
                                            <option value="Business">Business</option>
                                            <option value="Arts">Arts</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="w-100 flex justify-center items-center mx-3">
                                    <div className="form-control mt-4">
                                        <div className="mx-auto p-4">
                                            {regForm && (
                                                <img
                                                    className="h-80 w-80"
                                                    src={regForm}
                                                    alt="Registration Form Preview"
                                                />
                                            )}
                                        </div>
                                        <div className="input-group">
                                            <span>
                                                <span>Upload Registration Form</span>
                                            </span>
                                            <input
                                                type="file"
                                                name="registration_form"
                                                onChange={handleRegFormFileChange}
                                                className="file-input file-input-bordered w-full"
                                                accept="image/*"
                                            />
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
                        <div className="flex flex-col w-full max-w-xl h-100">
                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Interests</span>
                                </label>
                                <TagInput
                                    value={tags}
                                    onChange={setTags}
                                    placeholder="Add tags (e.g., 'react', 'typescript')..."
                                />
                            </div>

                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Bio</span>
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    placeholder="Tell us about yourself"
                                    className="textarea textarea-bordered w-full"
                                />
                            </div>

                            <div className="form-control mt-4">
                                <label className="label">
                                    <span className="label-text">Verify User</span>
                                </label>
                                <select
                                    name="is_verified"
                                    value={formData.is_verified}
                                    onChange={handleInputChange}
                                    className="select select-bordered w-full"
                                >
                                    <option value={true}>Verified</option>
                                    <option value={false}>Not Verified</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full mt-6"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default EditUserModal;
