import React from 'react';
import { FileText, MessageSquare, ThumbsUp } from 'lucide-react';

export type Metric = 'all' | 'posts' | 'comments' | 'liked_posts';

interface MetricOption {
    value: Metric;
    label: string;
    icon: React.ElementType;
    color: string;
}

const metrics: MetricOption[] = [
    { value: 'all', label: 'All Metrics', icon: FileText, color: 'bg-gray-500' },
    { value: 'posts', label: 'Posts', icon: FileText, color: 'bg-blue-500' },
    { value: 'comments', label: 'Comments', icon: MessageSquare, color: 'bg-emerald-500' },
    { value: 'liked_posts', label: 'Liked Posts', icon: ThumbsUp, color: 'bg-amber-500' },
];

interface MetricSelectorProps {
    selected: Metric;
    onChange: (metric: Metric) => void;
}

export function MetricSelector({ selected, onChange }: MetricSelectorProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {metrics.map(({ value, label, icon: Icon, color }) => (
                <button
                    key={value}
                    onClick={() => onChange(value)}
                    className={`btn flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors
            ${selected === value
                        ? `${color} text-white border-transparent`
                        : 'border-gray-200'
                    }`}
                >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                </button>
            ))}
        </div>
    );
}