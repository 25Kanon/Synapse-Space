import React from 'react';
import { Users, MessageSquare, Flag, Shield, Rss } from 'lucide-react';
import type { Stats } from '../types';

type ModStatsProps = {
    stats: Stats;
};

export function ModStats({ stats }: ModStatsProps) {
    const statItems = [
        { label: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, color: 'text-blue-500' },
        { label: 'Pending Reports', value: stats.pendingReports.toString(), icon: Flag, color: 'text-red-500' },
        // { label: 'Mod Actions Today', value: stats.modActions.toString(), icon: Shield, color: 'text-green-500' },
        { label: 'Post Count', value: `${stats.postCount}`, icon: Rss, color: 'text-purple-500' },
    ];

    return (
        <div className="flex flex-row my-3">
            {statItems.map((stat) => (
                <div key={stat.label} className="border mx-auto rounded-lg shadow-lg w-64 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                        </div>
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}