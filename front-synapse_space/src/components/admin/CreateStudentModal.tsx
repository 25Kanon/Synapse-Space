import React, { useEffect, useState } from 'react';
import { X, Loader2, Eye, EyeOff } from 'lucide-react';
import { TagInput } from "../TagInput";
import AxiosInstance from "../../utils/AxiosInstance";

interface CreateAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Program {
    id: number;
    name: string;
}

export default function CreateStudentModal({ isOpen, onClose }: CreateAccountModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [formData, setFormData] = useState({
        student_number: '',
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        bio: '',
        profile_pic: '',
        profile_banner: '',
        program: null as Program | null, // `program` now stores the Program object or null
        registration_form: '',
        is_verified: false,
    });

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('img', file);
        console.log("uploading: ", file.name);

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
            console.log(err);
            throw new Error('Image upload failed');
        }
    };

    useEffect(() => {
        try {
            AxiosInstance.get('/api/admin/program/')
                .then(response => {
                    setPrograms(response.data);
                })
                .catch(error => {
                    console.log(error);
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

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

            const { confirmPassword, profile_pic, profile_banner, registration_form, program, ...submitData } = formData;

            // Determine the value for `is_rejected` based on `is_verified`
            const isRejected = formData.is_verified ? false : null;

            // Prepare the payload with only the program ID
            const payload = {
                ...submitData,
                profile_pic: pfp,
                profile_banner: banner,
                registration_form: regform,
                interests: tags,
                is_verified: formData.is_verified,
                is_rejected: isRejected,  // Add the is_rejected field here
                last_login: new Date().toISOString(),
                date_joined: new Date().toISOString(),
                program: formData.program ? formData.program.id : null,  // Only attach the `id` of the program
            };

            if (tags.length < 1) {
                setError('Provide at least one interest');
                throw new Error('Provide at least one interest');
            }

            const response = await AxiosInstance.post("/api/admin/account/create/", payload, {
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
                        <div>
                            <label className="block text-sm font-medium">Student Number</label>
                            <input
                                type="number"
                                required
                                className="input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.student_number}
                                onChange={(e) => setFormData({...formData, student_number: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Username</label>
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
                            <label className="block text-sm font-medium">Bio</label>
                            <textarea
                                className="textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.bio}
                                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Profile Picture</label>
                            <input
                                type="file"
                                className="file-input mt-1 block w-full"
                                onChange={(e) => setFormData({...formData, profile_pic: e.target.files ? e.target.files[0] : null})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Profile Banner</label>
                            <input
                                type="file"
                                className="file-input mt-1 block w-full"
                                onChange={(e) => setFormData({...formData, profile_banner: e.target.files ? e.target.files[0] : null})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Program</label>
                            <select
                                className="select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.program?.id || ''}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    program: programs.find(p => p.id === Number(e.target.value)) || null
                                })}
                            >
                                <option value="">Select Program</option>
                                {programs?.map((program) => (
                                    <option key={program.id} value={program.id}>
                                        {program.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium">Interests</label>
                            <TagInput
                                value={tags}
                                onChange={setTags}
                                placeholder="Add tags (e.g., 'react', 'typescript')..."
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_verified"
                                className="checkbox checkbox-warning"
                                checked={formData.is_verified} // Bind to is_verified
                                onChange={(e) => setFormData({
                                    ...formData,
                                    is_verified: e.target.checked
                                })} // Update formData when toggled
                            />
                            <label htmlFor="is_verified" className="ml-2 text-sm">
                                Verify User
                            </label>
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
