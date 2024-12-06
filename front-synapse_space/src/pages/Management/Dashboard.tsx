import React, { useEffect, useState } from 'react';
import {FileText, Medal, MessageSquare, ThumbsDown, ThumbsUp, Users, Crown} from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import SuccessAlert from "../../components/SuccessAlert";
import { TimeRangeSelector } from "../../components/charts/TimeRangeSelector";
import { Metric, MetricSelector } from "../../components/charts/MetricSelector";
import { EngagementChart } from "../../components/charts/EngagementChart";
import type { TimeRange, Metric as MetricType, EngagementData } from '../../components/admin/types/activity';
import {Helmet} from "react-helmet-async";



function StatCard({ title, value, icon: Icon, color }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="flex items-center p-6 space-x-4 border shadow-sm bordered rounded-xl">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-semibold">{value?.toLocaleString()}</p>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex items-center justify-center h-[400px] bg-white rounded-xl">
            <div className="w-12 h-12 border-b-2 border-gray-900 rounded-full animate-spin"></div>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-xl">
            <p className="mb-4 text-gray-500">Failed to load engagement data</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
            >
                Try Again
            </button>
        </div>
    );
}

async function fetchEngagementData(timeRange: TimeRange): Promise<EngagementData[]> {
    try {
        const response = await AxiosInstance.get(`api/admin/interactions?range=${timeRange}`, { withCredentials: true });
        const data = await response.data;
        return data;
    } catch (error) {
        console.error('Error fetching engagement data:', error);
        throw error;
    }
}

function Dashboard() {

    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [selectedMetric, setSelectedMetric] = useState<Metric>('all');
    const [data, setData] = useState<EngagementData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<EngagementData | null>(null);


    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const newData = await fetchEngagementData(timeRange);
            setData(newData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [timeRange]);

    const latestData = data[data.length - 1] || {
        users: 0,
        communities: 0,
        posts: 0,
        comments: 0,
        liked_posts: 0,
        disliked_posts: 0,
        most_active_user: null,
        most_active_community: null,
        least_active_community: null,
    };


    return (
        <div className="flex min-h-screen bg-base-200">
            <Helmet>
                <title> Dashboard - Synapse Space</title>
            </Helmet>
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main>
                    <div className="flex flex-col m-6 space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold ">Dashboard</h1>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <StatCard
                                title="Total Users"
                                value={selectedPoint?.users || latestData.users} // Use selected point or latest data
                                icon={FileText}
                                color="bg-cyan-500"
                            />
                            <StatCard
                                title="Total Communities"
                                value={selectedPoint?.communities || latestData.communities} // Use selected point or latest data
                                icon={Users}
                                color="bg-rose-500"
                            />
                            <StatCard
                                title="Total Posts"
                                value={selectedPoint?.posts || latestData.posts} // Use selected point or latest data
                                icon={FileText}
                                color="bg-blue-500"
                            />
                            <StatCard
                                title="Total Comments"
                                value={selectedPoint?.comments || latestData.comments} // Use selected point or latest data
                                icon={MessageSquare}
                                color="bg-emerald-500"
                            />
                            <StatCard
                                title="Liked Posts"
                                value={selectedPoint?.liked_posts || latestData.liked_posts} // Use selected point or latest data
                                icon={ThumbsUp}
                                color="bg-amber-500"
                            />
                            <StatCard
                                title="Disliked Posts"
                                value={selectedPoint?.disliked_posts || latestData.disliked_posts} // Use selected point or latest data
                                icon={ThumbsDown}
                                color="bg-red-500"
                            />
                        </div>

                        <div className="p-6 shadow-sm bg-base-100 rounded-xl">
                            <div className="flex flex-col space-y-4">
                                <div
                                    className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-lg font-semibold ">Engagement Trends</h2>
                                        <p className="text-sm ">Visual representation of engagement metrics
                                            over time</p>
                                    </div>
                                    <TimeRangeSelector selected={timeRange} onChange={setTimeRange}/>
                                </div>
                                <MetricSelector selected={selectedMetric} onChange={setSelectedMetric}/>
                            </div>
                            <div className="flex flex-row mt-6">
                                <div className="w-full">
                                    {isLoading ? (
                                        <LoadingState/>
                                    ) : error ? (
                                        <ErrorState onRetry={loadData}/>
                                    ) : (
                                        <EngagementChart
                                            data={data}
                                            timeRange={timeRange}
                                            selectedMetric={selectedMetric}
                                            onPointClick={(point) => setSelectedPoint(point)} // Update selected point
                                        />

                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <StatCard
                                        title="Most Active User"
                                        value={selectedPoint?.most_active_user || latestData.most_active_user}
                                        icon={Crown}
                                        color="bg-primary"
                                    />
                                    <StatCard
                                        title="Most Active Community"
                                        value={selectedPoint?.most_active_community|| latestData.most_active_community}
                                        icon={Medal}
                                        color="bg-primary"
                                    />
                                    <StatCard
                                        title="Least Active Community"
                                        value={selectedPoint?.least_active_community || latestData.least_active_community}
                                        icon={Medal}
                                        color="bg-primary"
                                    />
                                </div>

                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
