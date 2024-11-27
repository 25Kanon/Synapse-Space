import React, { useState, useEffect, useContext } from 'react';
import { User as UserType } from '../../components/admin/types';
import CreateAccountModal from '../../components/admin/CreateAccountModal';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import Students from "../../components/admin/Students";
import Staffs from "../../components/admin/Staffs";
import AxiosInstance from "../../utils/AxiosInstance";
import EditUserModal from "../../components/admin/EditUserModal";
import ErrorAlert from "../../components/ErrorAlert";
import SuccessAlert from "../../components/SuccessAlert";
import AuthContext from '../../context/AuthContext';
import {Helmet} from "react-helmet-async";

const Users = () => {
    const { isSuperUser } = useContext(AuthContext);
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await AxiosInstance.get('/api/admin/users', {}, { withCredentials: true });
            setUsers(response.data);
            console.log(response.data);
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
            const response = await AxiosInstance.delete(`/api/admin/account/delete/${userId}`, {}, { withCredentials: true });
            setUsers(users.filter(user => user.id !== userId));
            setSuccess('User deleted successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
        }
    };

    const handleEdit = (user: UserType) => {
        setSelectedUser(user);
        document.getElementById('edit-user').showModal();
    };

    return (
        <div className="flex min-h-screen bg-base-200">
            <Helmet>
                <title> Users - Synapse Space</title>
            </Helmet>
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main>
                    <div role="tablist" className="tabs tabs-lifted m-3">
                        <input type="radio" name="my_tabs_2" role="tab" className="tab card-title" aria-label="Students" defaultChecked />
                        <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                            <Students />
                        </div>
                        {isSuperUser && (
                            <>
                                <input type="radio" name="my_tabs_2" role="tab" className="tab card-title" aria-label="Staffs" />
                                <div role="tabpanel" className="tab-content bg-base-100 border-base-300 rounded-box p-6">
                                    <Staffs />
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Users;