import React from 'react';
import { User } from './types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface UserListProps {
    users: User[];
    selectedUser: User | null;
    onSelectUser: (user: User) => void;
}

export function UserList({ users, selectedUser, onSelectUser }: UserListProps) {
    const getStatusIcon = (is_verified: boolean) => {
        switch (is_verified) {

            case true:
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case false:
                if(selectedUser.is_rejected)
                    return <XCircle className="w-5 h-5 text-red-500" />;
                return <Clock className="w-5 h-5 text-yellow-500" />;

            default:
                return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    return (
        <div className="bg-base-100 rounded-lg border overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold ">Pending Verifications</h2>
                <p className="text-sm text-secondary">Select a user to review their details</p>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {users.map((user) => (
                    <button
                        key={user.student_number}
                        onClick={() => onSelectUser(user)}
                        className={`w-full text-left  p-4 hover:bg-secondary transition-colors flex items-center space-x-4 ${
                            selectedUser?.student_number === user.student_number ? 'bg-blue-50' : ''
                        }`}
                    >
                        <img
                            src={user.profile_pic}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                {getStatusIcon(user.is_verified)}
                            </div>
                            <p className="text-sm  truncate">{user.student_number}</p>
                            <p className="text-sm  truncate">{user.program?.name}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}