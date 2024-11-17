import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert"
import SuccessAlert from "../../components/SuccessAlert"
import {User} from "../../components/admin/types";
import { UserList } from '../../components/admin/UserList';
import { UserDetails } from '../../components/admin/UserDetails';
import {CheckCircle, XCircle} from "lucide-react";


const Verifications = () => {

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await AxiosInstance.get('/api/admin/users/unverified', {}, {withCredentials: true});
            setUsers(response.data);
            console.log(response.data)
        } catch (err: any) {
            setError(err.message || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove =async () => {
        setError('');
        setSuccess('');
        if (selectedUser) {

            const payload ={
                id: selectedUser.id,
                is_verified: true,
                is_rejected: false
            }

            try{
                const response = await AxiosInstance.patch(`/api/admin/users/unverified`, payload, {withCredentials: true});
                setSuccess("User approved successfully");

                setUsers(users.map(user =>
                    user.student_number === selectedUser.student_number
                        ? { ...user, is_verified: true as const }
                        : user
                ));
                setSelectedUser(prev => prev ? { ...prev, is_verified: true as const } : null);
            } catch (error){
                setError(error.message || 'Failed to approve user')
            }
        }
    };

    const handleReject = async () => {
        setError('');
        setSuccess('');
        if (selectedUser) {

            const payload ={
                id: selectedUser.id,
                is_verified: false,
                is_rejected: true
            }

            try{
                const response = await AxiosInstance.patch(`/api/admin/users/unverified`, payload, {withCredentials: true});
                setSuccess("User rejected successfully")

                setUsers(users.map(user =>
                    user.student_number === selectedUser.student_number
                        ? { ...user, is_rejected: true as const }
                        : user
                ));
                setSelectedUser(prev => prev ? { ...prev, is_rejected: true as const } : null);
            } catch (error){
                setError(error.message || 'Failed to approve user')
            }
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (

        <div className="flex min-h-screen bg-base-200">
            <Sidebar/>
            <div className="flex-1">
                <Header/>
                <main>
                    {success && <SuccessAlert text={success}/>}
                    {error && <ErrorAlert text={error}/>}

                    <div className="m-5">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold">Student Verification</h1>
                            <p className="mt-2 textarea-secondary">Review and verify student registrations</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <UserList
                                    users={users}
                                    selectedUser={selectedUser}
                                    onSelectUser={setSelectedUser}
                                />
                            </div>

                            {/* User Details and Actions */}
                            {selectedUser ? (
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
                                        <div className="p-6">
                                            <UserDetails user={selectedUser}/>
                                        </div>
                                    </div>

                                    {/* Verification Actions */}
                                    <div className="bg-base-100 rounded-lg shadow p-6">
                                        <h2 className="text-lg font-semibold mb-4">Verification Actions</h2>
                                        <div className="space-y-4">

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={handleApprove}
                                                    disabled={selectedUser.is_verified !== false}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CheckCircle className="w-5 h-5"/>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    disabled={selectedUser.is_rejected === true}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <XCircle className="w-5 h-5"/>
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="lg:col-span-2 flex items-center justify-center bg-base-100 rounded-lg shadow-lg p-8">
                                    <div className="text-center">
                                        <p className="textarea-secondary">
                                            Select a user from the list to view their details
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>

    );
};

export default Verifications;