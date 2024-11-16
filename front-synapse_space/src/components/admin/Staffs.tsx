import React, { useState, useEffect } from 'react';
import {User, Shield, MoreVertical, Edit, Trash2, UserPlus, MessageSquare, TrendingUp} from 'lucide-react';
import { User as UserType } from '../../components/admin/types'
import CreateAccountModal from './CreateAccountModal'
import AxiosInstance from "../../utils/AxiosInstance";
import EditStaffModal from "./EditStaffModal";
import ErrorAlert from "../ErrorAlert"
import SuccessAlert from "../SuccessAlert"



const Students = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await AxiosInstance.get('/api/admin/users/staffs', {}, {withCredentials: true});
            setUsers(response.data);
            console.log(response.data)
        } catch (err: any) {
            setError(err.message || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleDelete = async (userId: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await AxiosInstance.delete(`/api/admin/account/delete/${userId}`, {}, {withCredentials: true});
            setUsers(users.filter(user => user.id !== userId));
            setSuccess('User deleted successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
        }
    };
    const handleEdit = (user: UserType) => {
        setIsEditModalOpen(true)
        setSelectedUser(user)
    };





return (
        <main>
            {error && <ErrorAlert text={error}/>}
            {success && <SuccessAlert text={success}/>}
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Staffs</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4"/>
                        Add Staff
                    </button>
                </div>

                <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-secondary">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-content uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-content uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-content uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-secondary-content uppercase tracking-wider">Last
                                Active
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-secondary-content uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <div
                                                className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500"/>
                                                {user.profile_pic ?
                                                    <>
                                                        <img className="avatar rounded-full"
                                                             src={user.profile_pic}/>
                                                    </> :
                                                    <></>}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        {user.is_superuser ?
                                            <>
                                                <Shield className="h-4 w-4 text-gray-400 mr-2"/>
                                                <span className="text-sm">Super User</span>
                                            </> :
                                            <>
                                                <User className="h-4 w-4 text-gray-400 mr-2"/>
                                                <span className="text-sm">Staff</span>
                                            </>
                                        }

                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                            <span className="text-sm"> {user.is_verified ?
                                                <>
                                                    <span className="text-sm text-primary">Verified</span>
                                                </> :
                                                <>
                                                    <span className="text-sm text-warning">Not Verified</span>
                                                </>
                                            }</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {new Date(user.last_login).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="text-gray-400 hover:text-blue-600"
                                        >
                                            <Edit className="h-4 w-4"/>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4"/>
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="h-4 w-4"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
            <dialog id="edit-staff" className="modal modal-bottom sm:modal-middle">
                <EditStaffModal user={selectedUser}/>
            </dialog>
            <CreateAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <EditStaffModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}/>
        </main>


    );
};

export default Students;