import React, {useState} from 'react';
import {Activity, BarChart3, Heart, MessageSquare, Bookmark} from 'lucide-react';
import {ActivitySection} from "../../components/admin/ActivitySection";
import {TabNavigation} from "../../components/admin/TabNavigation";
import {useActivityData} from "../../hooks/useActivityData";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";


const tabs = [
    {id: 'all', label: 'All Activity', icon: Activity},
    {id: 'posts', label: 'Posts', icon: BarChart3},
    {id: 'comments', label: 'Comments', icon: MessageSquare},
    {id: 'likes', label: 'Likes', icon: Heart},
] as const;

type TabId = (typeof tabs)[number]['id'];

export function Activities() {
    const [activeTab, setActiveTab] = useState<TabId>('all');
    const {data, isLoading, error} = useActivityData();

    if (error) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
                <p className="text-gray-600">{error.message}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
                <p className="text-gray-600">Fetching activity data</p>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <ActivitySection
                        title="Posts"
                        data={data.posts}
                        type="post"
                    />
                );
            case 'comments':
                return (
                    <ActivitySection
                        title="Comments"
                        data={data.comments}
                        type="comment"
                    />
                );
            case 'likes':
                return (
                    <ActivitySection
                        title="Likes"
                        data={data.liked_posts}
                        type="like"
                    />
                );
            default:
                return (
                    <div className="space-y-6">
                        <ActivitySection
                            title="Recent Posts"
                            data={data.posts}
                            type="post"
                            limit={3}
                        />
                        <ActivitySection
                            title="Recent Comments"
                            data={data.comments}
                            type="comment"
                            limit={3}
                        />
                        <ActivitySection
                            title="Recent Likes"
                            data={data.liked_posts}
                            type="like"
                            limit={3}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-base-200">
            <Sidebar/>
            <div className="flex-1">
                <Header/>
                <main>
                    <div className="p-6">
                        <main className="rounded-xl shadow-sm p-6">
                            <TabNavigation
                                tabs={tabs}
                                activeTab={activeTab}
                                onTabChange={(id) => setActiveTab(id as TabId)}
                            />
                            {renderContent()}
                        </main>
                    </div>
                </main>
            </div>
        </div>
    );
}

