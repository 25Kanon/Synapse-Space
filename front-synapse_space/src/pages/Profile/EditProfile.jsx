
import React, { useState } from "react";

const EditProfile = () => {
    const [firstName, setFirstName] = useState("");
    const [bio, setBio] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to handle profile update goes here
        console.log("Profile updated:", { firstName, bio });
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="mb-4">
                    <label htmlFor="firstName" className="block mb-1">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
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
                <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
        </div>
    );
};

export default EditProfile;
