import React, {useEffect, useState} from 'react';
import { Bell, Search, Shield, Users, MessageSquare, Flag } from 'lucide-react';
import { ModQueue } from '../../components/community/moderator/ModQueue';
import { ModStats } from '../../components/community/moderator/ModStats';
import { ModActions } from '../../components/community/moderator/ModActions';
import { ModSettingsModal } from '../../components/community/moderator/ModSettings';
import { useModeration } from '../../hooks/useModeration';
import {useParams} from "react-router-dom";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import SuccessAlert from "../../components/SuccessAlert";



function ModDashboard() {

    const {community_id} = useParams();
    const [community_details, setCommunityDetails]= useState('') ;
    const [Error, setError] = useState('');


    const {
        reports,
        filter,
        setFilter,
        setSearchQuery,
        notifications,
        handleApprove,
        handleReject,
        stats,
        settings,
        isSettingsOpen,
        setIsSettingsOpen,
        handleSettingsSave
    } = useModeration(community_id);

    const getInitials = (name) => {
        if (!name) return '';
        return name.split(' ').map(word => word[0]).join('');
    };

    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await AxiosInstance.get(`/api/community/${community_id}`, {}, { withCredentials: true,});
                setCommunityDetails(response.data);
                console.log(response.data)
            } catch (error) {
                setError(`Error fetching community details: ${error.message}`);
                console.error('Error fetching memberships:', error);
            }
        };

        fetchCommunityDetails();
    }, [community_id]);



    return (
        <div className="min-h-screen bg-base-100">
            {/* Header */}
            <header className="bg-base-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center">

                        <div
                            className="ml-3 w-24 h-24 relative  border-4 border-white rounded-full overflow-hidden mx-3">
                            <div className="avatar placeholder">
                                <div className="bg-neutral text-neutral-content h-24 rounded-full">
                                    {community_details.imgURL ? (
                                        <img src={community_details.imgURL} alt={`avatar-${community_details.name}`}/>
                                    ) : (
                                        <h2 className="text-lg font-bold">{getInitials(community_details.name)}</h2>
                                    )}
                                </div>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold ">{community_details.name}</h1>
                        <div className="flex items-center space-x-4">

                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl rounded rounded-lg bg-base-200 my-5 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ModStats stats={stats} />
                <ModActions onOpenSettings={() => setIsSettingsOpen(true)}/>

                <div className="border rounded-lg shadow-sm p-4 mb-6 ">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Moderation Queue</h2>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="select select-bordered rounded-md  py-1.5  text-sm"
                        >
                            <option value="all">All Reports</option>
                            <option value="posts">Posts</option>
                            <option value="comments">Comments</option>
                            <option value="users">Users</option>
                        </select>
                    </div>
                    <ModQueue
                        reports={reports}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                </div>

                <ModSettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    settings={settings}
                    onSave={handleSettingsSave}
                />
            </main>
        </div>
    );
}

export default ModDashboard;