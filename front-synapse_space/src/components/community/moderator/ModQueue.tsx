import React from 'react';
import {
    Flag,
    MessageSquare,
    AlertTriangle,
    CheckCircle,
    XCircle,
    MoreVertical,
    Pin,
    Lock,
    VolumeX,
    UserCheck,
    Trash2,
} from 'lucide-react';
import type { Report } from '../types';

type ModQueueProps = {
    reports: Report[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
};

function StatusBadge({
                         status,
                         type,
                     }: {
    status: Report['status'];
    type: Report['type'];
}) {
    const badges = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    const typeIcons = {
        post: <MessageSquare className="w-3 h-3 mr-1" />,
        comment: <Flag className="w-3 h-3 mr-1" />,
        user: <UserCheck className="w-3 h-3 mr-1" />,
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}
        >
      {typeIcons[type]}
            {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
    );
}

function ActionButtons({
                           type,
                           onAction,
                       }: {
    type: Report['type'];
    onAction: (action: string) => void;
}) {
    const actionsByType = {
        post: [
            { label: 'Lock', icon: Lock, color: 'text-orange-500' },
            { label: 'Pin', icon: Pin, color: 'text-blue-500' },
        ],
        comment: [
            { label: 'Hide', icon: AlertTriangle, color: 'text-yellow-500' },
            { label: 'Delete', icon: Trash2, color: 'text-red-500' },
        ],
        user: [
            { label: 'Mute', icon: VolumeX, color: 'text-orange-500' },
            { label: 'Ban', icon: UserCheck, color: 'text-red-500' },
        ],
    };

    return (
        <>
            {actionsByType[type].map((action) => (
                <button
                    key={action.label}
                    onClick={() => onAction(action.label.toLowerCase())}
                    className={`p-2 rounded-full hover:bg-gray-100 ${action.color} transition-colors relative group`}
                    title={action.label}
                >
                    <action.icon className="w-5 h-5" />
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {action.label}
          </span>
                </button>
            ))}
        </>
    );
}

export function ModQueue({ reports, onApprove, onReject }: ModQueueProps) {
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);
    const [actionFeedback, setActionFeedback] = React.useState<{
        id: string;
        action: string;
    } | null>(null);

    const handleAction = (action: string, id: string) => {
        if (action === 'approve') {
            onApprove(id);
        } else if (action === 'reject') {
            onReject(id);
        }
        setActionFeedback({ id, action });
        setTimeout(() => setActionFeedback(null), 2000);
    };

    return (
        <div className="space-y-4">
            {reports.length === 0 ? (
                <div className="text-center py-12 rounded-lg">
                    <Flag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reports</h3>
                    <p className="mt-1 text-sm">
                        All clear! No reports need moderation.
                    </p>
                </div>
            ) : (
                reports.map((report) => (
                    <div
                        key={report.id}
                        onMouseEnter={() => setHoveredId(report.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`relative border rounded-lg p-4 transition-all duration-200 ${
                            report.status === 'pending'
                                ? 'hover:border-blue-200 hover:shadow-sm'
                                : report.status === 'approved'
                                    ? 'bg-green-50 border-green-100'
                                    : report.status === 'rejected'
                                        ? 'bg-red-50 border-red-100'
                                        : 'border-gray-200'
                        }`}
                    >
                        {actionFeedback?.id === report.id && (
                            <div className="absolute top-2 right-2 animate-fade-in-out">
                                <div
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                                        actionFeedback.action === 'approve'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {actionFeedback.action === 'approve'
                                        ? 'Content Approved'
                                        : 'Content Rejected'}
                                </div>
                            </div>
                        )}

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start space-x-3 flex-grow">
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">
                      {report.author}
                    </span>
                                        <StatusBadge status={report.status} type={report.type} />
                                        <span className="text-sm text-secondary">
                      {new Date(report.timestamp).toLocaleString()}
                    </span>
                                    </div>

                                    <p className="mt-1 text-base-content break-words">
                                        {report.content}
                                    </p>

                                    <div className="mt-2 flex items-center flex-wrap gap-3">
                                        <div className="flex items-center text-red-600">
                                            <AlertTriangle className="w-4 h-4 mr-1" />
                                            <span className="text-sm font-medium">
                        {report.reason}
                      </span>
                                        </div>
                                        <span className="text-sm text-secondary">
                      {report.reports}{' '}
                                            {report.reports === 1 ? 'report' : 'reports'}
                    </span>
                                    </div>
                                </div>
                            </div>

                            {report.status === 'pending' && (
                                <div
                                    className={`flex items-center gap-2 transition-opacity duration-200 ${
                                        hoveredId === report.id ? 'opacity-100' : 'opacity-0'
                                    }`}
                                >
                                    <ActionButtons
                                        type={report.type}
                                        onAction={(action) => handleAction(action, report.id)}
                                    />
                                    <button
                                        onClick={() => handleAction('approve', report.id)}
                                        className="p-2 rounded-full hover:bg-green-100 text-green-600 transition-colors relative group"
                                        title="Approve"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Approve
                    </span>
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject', report.id)}
                                        className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors relative group"
                                        title="Reject"
                                    >
                                        <XCircle className="w-5 h-5" />
                                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Reject
                    </span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
