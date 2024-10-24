import React from 'react';
import { Bell, Search, Shield, Users, MessageSquare, Flag } from 'lucide-react';
import { ModQueue } from '../../components/community/moderator/ModQueue';
import { ModStats } from '../../components/community/moderator/ModStats';
import { ModActions } from '../../components/community/moderator/ModActions';
import { ModSettingsModal } from '../../components/community/moderator/ModSettings';
import { useModeration } from '../../hooks/useModeration';


function ModDashboard() {
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
    } = useModeration();

    return (
        <div className="min-h-screen bg-base-100">
            {/* Header */}
            <header className="bg-base-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold ">Mod Dashboard</h1>
                        <div className="flex items-center space-x-4">

                            <button className="relative p-2 text-gray-400 hover:text-gray-500">
                                <Bell className="w-6 h-6" />
                                {notifications > 0 && (
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl rounded rounded-lg bg-base-200 my-5 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ModStats stats={stats} />
                <ModActions onOpenSettings={() => setIsSettingsOpen(true)} />

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