import React, { useEffect, useState } from 'react';
import { Users, MessageSquare, TrendingUp, UserPlus } from 'lucide-react';
import { fetchCommunityStats, fetchRecentActivities } from '../../utils/admin/api';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';

const Dashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const [statsData, activitiesData] = await Promise.all([
                fetchCommunityStats(),
                fetchRecentActivities()
            ]);
            setStats(statsData.data);
            setActivities(activitiesData.data);
        };
        loadData();
    }, []);

    const StatCard = ({ icon: Icon, label, value, trend }: any) => (
        <div className="card card-compact border border-solid rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    {trend && (
                        <p className="text-sm text-green-500 flex items-center mt-1">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            +{trend}% this week
                        </p>
                    )}
                </div>
                <div className="p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-500" />
                </div>
            </div>
        </div>
    );

    if (!stats) return null;

    return (

        <div className="flex min-h-screen bg-base-200">
            <Sidebar/>
            <div className="flex-1">
                <Header/>
                <main>
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                icon={Users}
                                label="Total Users"
                                value={stats.totalUsers}
                                trend="12"
                            />
                            <StatCard
                                icon={UserPlus}
                                label="New Users Today"
                                value={stats.newUsersToday}
                                trend="8"
                            />
                            <StatCard
                                icon={MessageSquare}
                                label="Total Posts"
                                value={stats.totalPosts}
                                trend="15"
                            />
                            <StatCard
                                icon={TrendingUp}
                                label="Engagement Rate"
                                value={stats.engagementRate}
                            />
                        </div>

                        <div className="bg-base-100 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">{activity.user}</p>
                                            <p className="text-sm text-secondary">{activity.action}</p>
                                        </div>
                                        <span className="text-sm text-secondary">
                                        {new Date(activity.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>

    );
};

export default Dashboard;