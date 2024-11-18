import { Clock } from 'lucide-react';

interface ActivityCardProps {
    author: string;
    authorPic: string;
    timestamp: string;
    type: 'post' | 'comment' | 'like' | 'save';
}

export function ActivityCard({ authorPic, timestamp, type, author }: ActivityCardProps) {
    const getTypeColor = () => {
        switch (type) {
            case 'post':
                return 'bg-blue-50 border-blue-200';
            case 'comment':
                return 'bg-green-50 border-green-200';
            case 'like':
                return 'bg-pink-50 border-pink-200';
            case 'save':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className={`flex items-center gap-4 p-4 rounded-lg border ${getTypeColor()} transition-all hover:shadow-md`}>
            <img
                src={authorPic}
                alt="User"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>
                        {author}
                        {type === 'post' && ` created a post `}
                        {type === 'comment' && ` made a comment `}
                        {type === 'like' && ` liked the post `}
                    </span>

                    <Clock className="w-4 h-4"/>
                    <time dateTime={timestamp}>
                        {new Date(timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </time>
                </div>
            </div>
        </div>
    );
}