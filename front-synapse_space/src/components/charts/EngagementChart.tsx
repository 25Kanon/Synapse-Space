import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { Metric } from './MetricSelector';

type TimeRange = 'day' | 'week' | 'month' | 'year';

interface DataPoint {
    timestamp: string;
    posts: number;
    comments: number;
    liked_posts: number;
}

interface MetricConfig {
    key: keyof Omit<DataPoint, 'timestamp'>;
    color: string;
    label: string;
}

const metrics: MetricConfig[] = [
    { key: 'posts', color: '#3B82F6', label: 'Posts' },
    { key: 'comments', color: '#10B981', label: 'Comments' },
    { key: 'liked_posts', color: '#F59E0B', label: 'Liked Posts' },
];

interface EngagementChartProps {
    data: DataPoint[];
    timeRange: TimeRange;
    selectedMetric: Metric;
}

export function EngagementChart({
                                    data,
                                    timeRange,
                                    selectedMetric,
                                    onPointClick,
                                }: EngagementChartProps & { onPointClick: (data: DataPoint) => void }) {
    const formatXAxis = (timestamp: string) => {
        const date = new Date(timestamp);
        switch (timeRange) {
            case 'day':
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            case 'week':
                return date.toLocaleDateString([], { weekday: 'short' });
            case 'month':
                return date.toLocaleDateString([], { day: 'numeric' });
            case 'year':
                return date.toLocaleDateString([], { month: 'short' });
            default:
                return timestamp;
        }
    };

    const visibleMetrics = selectedMetric === 'all'
        ? metrics
        : metrics.filter(m => m.key === selectedMetric);

    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%" className="bg-base-100" >
                <LineChart
                    data={data}
                    onClick={(event) => {
                        if (event && event.activePayload && event.activePayload[0]) {
                            onPointClick(event.activePayload[0].payload); // Pass clicked data point
                        }
                    }}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={formatXAxis}
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#9CA3AF' }}
                    />
                    <YAxis
                        tick={{ fill: '#6B7280' }}
                        axisLine={{ stroke: '#9CA3AF' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1F2937',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#F3F4F6',
                        }}
                        labelFormatter={formatXAxis}
                    />
                    <Legend />
                    {visibleMetrics.map((metric) => (
                        <Line
                            key={metric.key}
                            type="monotone"
                            dataKey={metric.key}
                            name={metric.label}
                            stroke={metric.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
