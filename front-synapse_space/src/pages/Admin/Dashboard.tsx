import React, { useEffect, useState } from 'react';
import {FileText, MessageSquare, ThumbsDown, ThumbsUp, Users} from 'lucide-react';
import Sidebar from '../../components/admin/Sidebar';
import Header from '../../components/admin/Header';
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import SuccessAlert from "../../components/SuccessAlert";
import { TimeRangeSelector } from "../../components/charts/TimeRangeSelector";
import { Metric, MetricSelector } from "../../components/charts/MetricSelector";
import { EngagementChart } from "../../components/charts/EngagementChart";
import type { TimeRange, Metric as MetricType, EngagementData } from '../../components/admin/types/activity';


function StatCard({ title, value, icon: Icon, color }: {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="bordered border rounded-xl shadow-sm p-6 flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-2xl font-semibold">{value.toLocaleString()}</p>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="flex items-center justify-center h-[400px] bg-white rounded-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
    );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] bg-white rounded-xl">
            <p className="text-gray-500 mb-4">Failed to load engagement data</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
    };


    return (
        <div className="flex min-h-screen bg-base-200">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main>
                    <div className="flex flex-col space-y-6 m-6">
                        <div>
                            <h1 className="text-2xl font-bold ">Dashboard</h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                        <div className="bg-base-100 rounded-xl shadow-sm p-6">
                            <div className="flex flex-col space-y-4">
                                <div
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold ">Engagement Trends</h2>
                                        <p className="text-sm ">Visual representation of engagement metrics
                                            over time</p>
                                    </div>
                                    <TimeRangeSelector selected={timeRange} onChange={setTimeRange}/>
                                </div>
                                <MetricSelector selected={selectedMetric} onChange={setSelectedMetric}/>
                            </div>
                            <div className="mt-6">
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
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
