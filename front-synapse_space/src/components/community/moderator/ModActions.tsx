import React from 'react';
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
                label: 'Ban User',
                icon: UserX,
                color: 'text-red-500',
                action: () => alert('User banned!'),
            },
            {
                label: 'Mute User',
                icon: VolumeX,
                color: 'text-orange-500',
                action: () => alert('User muted!'),
            },
            {
                label: 'Verify User',
                icon: UserCheck,
                color: 'text-blue-500',
                action: () => alert('User verified!'),
            },
        ],
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
        </div>
    );
}
