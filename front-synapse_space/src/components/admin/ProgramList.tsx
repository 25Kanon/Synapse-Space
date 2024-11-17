import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';


interface ProgramListProps {
    programs: any;
    onDelete: (id: number) => void;
    onEdit: (id: number, newName: string) => void;
}

interface program {
    id: number,
    name: string
}

export function ProgramList({ programs, onDelete, onEdit }: ProgramListProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    const startEdit = (Program: program) => {
        setEditingId(Program.id);
        setEditValue(Program.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleEdit = (id: number) => {
        if (editValue.trim()) {
            onEdit(id, editValue.trim());
            setEditingId(null);
        }
    };

    if (programs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No programs added yet. Start by adding one</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs?.map((program: program) => (
                <div
                    key={program.id}
                    className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                    {editingId === program.id ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="input input-ghost flex-1 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                            <button
                                onClick={() => handleEdit(program.id)}
                                className="p-1 text-green-600 hover:text-green-700"
                                title="Save"
                            >
                                <Check size={20} />
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="p-1 text-red-600 hover:text-red-700"
                                title="Cancel"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
              <span className="text-lg font-medium">
                {program.name}
              </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => startEdit(program)}
                                    className="p-1 text-blue-600 hover:text-blue-700"
                                    title="Edit"
                                >
                                    <Pencil size={20} />
                                </button>
                                <button
                                    onClick={() => onDelete(program.id)}
                                    className="p-1 text-red-600 hover:text-red-700"
                                    title="Delete"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}