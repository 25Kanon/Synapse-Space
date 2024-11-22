import React, {useEffect, useState} from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { TagInput } from "../TagInput";
import axiosInstance from "../../utils/AxiosInstance";

interface CreateAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateAccountModal({ isOpen, onClose }: CreateAccountModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        student_number: null,
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        bio: '',
        profile_pic: '',
        profile_banner: '',
        program: null,
        registration_form: '',
        is_verified: true,
        is_superuser: false,
        is_staff: true,
    });

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('img', file);

        try {
            const response = await axiosInstance.post("/api/upload/", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });


            return response.data.url;
        } catch (err) {
            setError('Image upload failed');
            console.log(err);
            throw new Error('Image upload failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Prepare for uploading files
            let pfp = formData.profile_pic ? await uploadFile(formData.profile_pic) : null;
            let banner = formData.profile_banner ? await uploadFile(formData.profile_banner) : null;
            let regform = formData.registration_form ? await uploadFile(formData.registration_form) : null;

            const { confirmPassword, profile_pic, profile_banner, registration_form, ...submitData } = formData;

            const payload = {
                ...submitData,
                profile_pic: pfp,
                profile_banner: banner,
                registration_form: regform,
                is_verified: formData.is_verified,
                is_superuser: formData.is_superuser, // Send the is_superuser value based on role
                is_staff: formData.is_staff, // Send the is_staff value based on role
                is_rejected: false,
                date_joined: new Date().toISOString(),
            };


            const response = await axiosInstance.post("/api/admin/account/create/", payload, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            });

            onClose();
        } catch (err) {
            console.log(JSON.stringify(err.response?.data));
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
                <div
                    className="sticky top-0 bg-base-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <h2 className="text-2xl font-bold ">Create Account</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5"/>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mt-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}


                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                        <div className="md:col-span-2">
                            <label className="block col-span-2 text-sm font-medium">Username</label>
                            <input
                                type="text"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">First Name</label>
                            <input
                                type="text"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.first_name}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Last Name</label>
                            <input
                                type="text"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.last_name}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium">Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    className="input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400"/> :
                                        <Eye className="h-4 w-4 text-gray-400"/>}
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium">Confirm Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    minLength={8}
                                    className="input block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400"/> :
                                        <Eye className="h-4 w-4 text-gray-400"/>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Profile Picture (Optional)</label>
                            <input
                                type="file"
                                className="file-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                accept="image/*"
                                onChange={(e) => e.target.files && setFormData({
                                    ...formData,
                                    profile_pic: e.target.files[0]
                                })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Profile Banner (Optional)</label>
                            <input
                                type="file"
                                className="file-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                accept="image/*"
                                onChange={(e) => e.target.files && setFormData({
                                    ...formData,
                                    profile_banner: e.target.files[0]
                                })}
                            />
                        </div>

                        <div className="flex items-center">
                            <label htmlFor="is_verified" className="ml-3  text-sm">
                                Is Super user?
                            </label>
                            <input
                                type="checkbox"
                                id="is_verified"
                                className="checkbox checkbox-warning mx-1"
                                checked={formData.is_superuser} // Bind to is_verified
                                onChange={(e) => setFormData({
                                    ...formData,
                                    is_superuser: e.target.checked
                                })} // Update formData when toggled
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
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4"/>
                                    Creating...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
