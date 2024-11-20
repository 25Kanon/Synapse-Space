import React from 'react';

type TimeRange = 'day' | 'week' | 'month' | 'year';

interface TimeRangeSelectorProps {
    selected: TimeRange;
    onChange: (range: TimeRange) => void;
}

export function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
    const ranges: TimeRange[] = ['day', 'week', 'month', 'year'];

    return (
        <div className="inline-flex rounded-lg border border-gray-200 bg-white">
            {ranges.map((range) => (
                <button
                    key={range}
                    onClick={() => onChange(range)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors
            ${selected === range
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
            ${range === 'day' && 'rounded-l-lg'}
            ${range === 'year' && 'rounded-r-lg'}
          `}
                >
                    {range}
                </button>
            ))}
        </div>
    );
}