import React, { useState, KeyboardEvent, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export function TagInput({
                             value,
                             onChange,
                             placeholder = "Type and press enter..."
                         }: TagInputProps) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);



    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            e.preventDefault();
            if (!value.includes(input.trim())) {
                onChange([...value, input.trim()]);
            }
            setInput('');
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            e.preventDefault();
            onChange(value.slice(0, -1));
        }
    }, [input, value, onChange]);

    const removeTag = useCallback((tagToRemove: string) => {
        onChange(value.filter(tag => tag !== tagToRemove));
    }, [value, onChange]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    }, []);

    const handleContainerClick = useCallback(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div
            onClick={handleContainerClick}
            className="min-h-[42px] w-full border border-gray-300 rounded-lg px-3 py-2">
            <div className="flex flex-wrap gap-2">
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm group animate-fadeIn"
                    >
            {tag}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTag(tag);
                            }}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                            aria-label={`Remove ${tag} tag`}
                        >
              <X size={14} className="text-blue-700" />
            </button>
          </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="input bordered border-0  flex-1 min-w-[120px]"
                    aria-label="Add new tag"
                />
            </div>
        </div>
    );
}