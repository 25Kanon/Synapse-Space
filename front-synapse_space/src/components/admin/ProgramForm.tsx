import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface ProgramFormProps {
    onSubmit: (name: string) => void;
}

export function ProgramForm({ onSubmit }: ProgramFormProps) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSubmit(name.trim());
            setName('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter program name"
                className="input flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
                type="submit"
                className="btn btn-primary flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200"
            >
                <Plus size={20} />
                <span>Add Program</span>
            </button>
        </form>
    );
}