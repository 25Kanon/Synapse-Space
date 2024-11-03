import React, {useEffect, useState} from 'react';
import {
    Shield,
    UserX,
    MessageSquare,
    Settings,
    Pin,
    Lock,
    VolumeX,
    AlertTriangle,
    UserCheck,
    Trash2,
} from 'lucide-react';
import {User} from "../types/User";
import AxiosInstance from '../../../utils/AxiosInstance'
import {useParams} from "react-router-dom";
import {MemberActionModal} from "./MemberActionModal"

type ModActionsProps = {
    onOpenSettings: () => void;
};



export function ModActions({ onOpenSettings }: ModActionsProps) {
    const actionGroups = {
        posts: [
            {
                label: 'Lock Thread',
                icon: Lock,
                color: 'text-orange-500',
                action: () => alert('Thread locked!'),

            },
            {
                label: 'Pin Post',
                icon: Pin,
                color: 'text-blue-500',
                action: () => alert('Post pinned!'),
            },
            {
                label: 'Archive',
                icon: Shield,
                color: 'text-purple-500',
                action: () => alert('Post archived!'),
            },
        ],
        comments: [
            {
                label: 'Hide',
                icon: AlertTriangle,
                color: 'text-yellow-500',
                action: () => alert('Comment hidden!'),
            },
            {
                label: 'Delete',
                icon: Trash2,
                color: 'text-red-500',
                action: () => alert('Comment deleted!'),
            },
            {
                label: 'Mark as Answer',
                icon: MessageSquare,
                color: 'text-green-500',
                action: () => alert('Marked as answer!'),
            },
        ],
        users: [
            {
                label: 'Accept User',
                icon: UserCheck,
                color: 'text-blue-500',
                action: ()  => handleAction('accept', users.filter(u => u.status === 'pending'))
            },
            {
                label: 'Ban User',
                icon: UserX,
                color: 'text-red-500',
                action: () => handleAction('ban', users.filter(u => u.status !== 'banned'))
            },
            {
                label: 'Unban User',
                icon: UserCheck,
                color: 'text-yellow-500',
                action: ()  => handleAction('unban', users.filter(u => u.status === 'banned')),
            },
        ],
    };
    const {community_id} = useParams();
    const [users, setUsers]= useState<User[]>([]);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [modalType, setModalType] = useState<'accept' | 'ban' | 'unban' | null>(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await AxiosInstance.get(
                    `/api/community/${community_id}/pending-members/`,
                    {},
                    { withCredentials: true }
                );

                setUsers(response.data);
                console.log("members:", response.data);
            } catch (error) {
                console.error("Error fetching memberships:", error);
            }
        };

        fetchMembers();
    }, [community_id, modalType]);

    const handleAction = (type: 'accept' | 'ban' | 'unban', users: User[]) => {
        setAvailableUsers(users);
        setSelectedUserIds(new Set(users.map(u => u.user_id)));
        setModalType(type);
    };


    const handleConfirm = async () => {
        const selectedUsers = availableUsers.filter(user => selectedUserIds.has(user.user_id));

        const payload = {
            user_ids: Array.from(selectedUserIds)
        };

        try {
            const response = await AxiosInstance.post(
                `/api/membership/${modalType}/${community_id}/`,
                payload,
                { withCredentials: true }
            );

            if (response.status === 200) {
                console.log('Users processed successfully:', payload);
            } else {
                console.error('Error processing users:', response.status);
            }
        } catch (error) {
            console.error('Error making request:', error);
        }
        finally {
            setModalType(null);
            setAvailableUsers([]);
            setSelectedUserIds(new Set());
        }
    };


    const toggleUser = (userId: string) => {
        const newSelected = new Set(selectedUserIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUserIds(newSelected);
    };

    const toggleAll = () => {
        if (selectedUserIds.size === availableUsers.length) {
            setSelectedUserIds(new Set());
        } else {
            setSelectedUserIds(new Set(availableUsers.map(u => u.user_id)));
        }
    };

    const getModalTitle = () => {
        switch (modalType) {
            case 'accept':
                return 'Accept Users';
            case 'ban':
                return 'Ban Users';
            case 'unban':
                return 'Unban Users';
            default:
                return '';
        }
    };

    return (
        <div className="border rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Quick Actions</h2>
                <button
                    onClick={onOpenSettings}
                    className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-secondary text-base-content transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                </button>
            </div>

            <div className="space-y-6">
                {Object.entries(actionGroups).map(([groupName, actions]) => (
                    <div key={groupName} className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500 uppercase">
                            {groupName}
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {actions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={action.action}
                                    className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-secondary  transition-colors"
                                >
                                    <action.icon className={`w-5 h-5 ${action.color}`} />
                                    <span className="text-sm text-base-content">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <MemberActionModal
                isOpen={modalType !== null}
                onClose={() => setModalType(null)}
                title={getModalTitle()}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Select users to {modalType}:
                    </p>
                    <div className="border-b border-gray-200 pb-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedUserIds.size === availableUsers.length && availableUsers.length > 0}
                                onChange={toggleAll}
                            />
                            <span className="text-sm font-medium text-gray-700">Select All</span>
                        </label>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableUsers.map((user) => (
                            <label key={user.user_id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={selectedUserIds.has(user.user_id)}
                                    onChange={() => toggleUser(user.user_id)}
                                />
                                <img src={user.userAvatar} alt="" className="h-8 w-8 rounded-full" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{user.user_id
                                    }</p>
                                    <p className="text-sm text-gray-500">{user.username
                                    }</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={selectedUserIds.size === 0}
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed
                  ${modalType === 'accept' ? 'bg-green-600 hover:bg-green-700' :
                                modalType === 'ban' ? 'bg-red-600 hover:bg-red-700' :
                                    'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            Confirm
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalType(null)}
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </MemberActionModal>
        </div>
    );
}
