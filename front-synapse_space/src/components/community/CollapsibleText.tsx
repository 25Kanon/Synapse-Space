import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleTextProps {
    text: string;
    maxLength?: number;
}

export function CollapsibleText({ text, maxLength = 150 }: CollapsibleTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const shouldCollapse = text.length > maxLength;

    if (!shouldCollapse) {
        return <p>{text}</p>;
    }

    return (
        <div className="space-y-2">
            <p>
                {isExpanded ? text : `${text.slice(0, maxLength)}...`}
            </p>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
            >
                {isExpanded ? (
                    <>
                        Show less
                        <ChevronUp size={16} />
                    </>
                ) : (
                    <>
                        Read more
                        <ChevronDown size={16} />
                    </>
                )}
            </button>
        </div>
    );
}