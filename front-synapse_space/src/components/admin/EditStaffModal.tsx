import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import AxiosInstance from "../../utils/AxiosInstance";

interface EditAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any; // Pass the existing user object here
}

export default function EditAccountModal({ isOpen, onClose, user }: EditAccountModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        username: user?.username || '',
        bio: user?.bio || '',
        profile_pic: user?.profile_pic || '',
        profile_banner: user?.profile_banner || '',
    });

    const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
    const [newProfileBanner, setNewProfileBanner] = useState<File | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                profile_pic: user.profile_pic,
                profile_banner: user.profile_banner,
            });
        }
    }, [user]);

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('img', file);

        try {
            const response = await AxiosInstance.post("/api/upload/", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data.url;
        } catch (err) {
            setError('Image upload failed');
            console.error(err);
            throw new Error('Image upload failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Create an object to hold only the changed values
        const updatedFormData: Record<string, any> = { id: user.id }; // Always include the user ID

        try {
            // Compare and add only the properties that have changed
            if (formData.first_name !== user.first_name) updatedFormData.first_name = formData.first_name;
            if (formData.last_name !== user.last_name) updatedFormData.last_name = formData.last_name;
            if (formData.email !== user.email) updatedFormData.email = formData.email;
            if (formData.username !== user.username) updatedFormData.username = formData.username;
            if (formData.bio !== user.bio) updatedFormData.bio = formData.bio;

            // Only upload new profile picture if it's changed
            if (newProfilePic) {
                updatedFormData.profile_pic = await uploadFile(newProfilePic);
            } else if (formData.profile_pic !== user.profile_pic) {
                updatedFormData.profile_pic = formData.profile_pic;  // Retain previous pic if not changed
            }

            // Only upload new profile banner if it's changed
            if (newProfileBanner) {
                updatedFormData.profile_banner = await uploadFile(newProfileBanner);
            } else if (formData.profile_banner !== user.profile_banner) {
                updatedFormData.profile_banner = formData.profile_banner; // Retain previous banner if not changed
            }

            // If the object is empty (no changes), prevent making the PUT request
            if (Object.keys(updatedFormData).length === 1) { // Only 'id' exists if no changes
                setError('No changes detected');
                setIsLoading(false);
                return;
            }

            // Submit updated data with only the changed values
            await AxiosInstance.put(`/api/admin/account/update/`, updatedFormData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 500);
        } catch (err) {
            console.error(err.response?.data);
            const errorMessage = err.response?.data ? Object.values(err.response.data)[0] : err.message;
            setError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };



    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-base-200 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-base-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <h2 className="text-2xl font-bold">Edit Account</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Username</label>
                            <input
                                type="text"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">First Name</label>
                            <input
                                type="text"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Last Name</label>
                            <input
                                type="text"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Bio</label>
                            <textarea
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Profile Picture</label>
                            {formData.profile_pic && (
                                <img
                                    src={formData.profile_pic}
                                    alt="Profile"
                                    className="w-full h-40 object-cover rounded-lg mt-2 mb-4"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewProfilePic(e.target.files ? e.target.files[0] : null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Profile Banner</label>
                            {formData.profile_banner && (
                                <img
                                    src={formData.profile_banner}
                                    alt="Banner"
                                    className="w-full h-40 object-cover rounded-lg mt-2 mb-4"
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setNewProfileBanner(e.target.files ? e.target.files[0] : null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
