import React, { useEffect, useState } from 'react';
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import { ProgramForm } from "../../components/admin/ProgramForm";
import { ProgramList } from "../../components/admin/ProgramList";
import AxiosInstance from "../../utils/AxiosInstance";
import ErrorAlert from "../../components/ErrorAlert";
import SuccessAlert from "../../components/SuccessAlert";

interface Program {
    id: number;
    name: string;
}

function Programs() {
    const [programs, setPrograms] = useState<Program[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Add Program
    const addProgram = async (name: string) => {
        setError('');
        setSuccess('');
        try {
            const response = await AxiosInstance.post('/api/admin/program/create/',
                { name },
                { withCredentials: true }
            );
            setSuccess('Program created successfully');
            setPrograms([...programs, response.data.program]); // Assuming the response has 'program' field
        } catch (error: any) {
            handleError(error);
        }
    };

    // Delete Program
    const deleteProgram = async (id: number) => {
        setError('');
        setSuccess('');
        try {
            const response = await AxiosInstance.delete(`/api/admin/program/delete/${id}/`,
                { withCredentials: true }
            );
            setSuccess('Program deleted successfully');
            setPrograms(programs.filter(program => program.id !== id));
        } catch (error: any) {
            handleError(error);
        }
    };

    // Edit Program
    const editProgram = async (id: number, newName: string) => {
        setError('');
        setSuccess('');
        try {
            const response = await AxiosInstance.put(`/api/admin/program/update/${id}/`,
                { name: newName },
                { withCredentials: true }
            );
            setSuccess('Program updated successfully');
            setPrograms(programs.map(program =>
                program.id === id ? { ...program, name: newName } : program
            ));
        } catch (error: any) {
            handleError(error);
        }
    };

    // Error Handling
    const handleError = (error: any) => {
        if (error.response) {
            // Server responded with an error status code
            setError(error.response.data.message || error.response.statusText || 'An error occurred.');
        } else if (error.request) {
            // No response from server
            setError('No response received from server.');
        } else {
            // Error setting up the request
            setError(`Error: ${error.message}`);
        }
    };

    // Fetch Programs on Mount
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const response = await AxiosInstance.get('/api/admin/program/', { withCredentials: true });
                setPrograms(response.data);
            } catch (error) {
                handleError(error);
            }
        };

        fetchPrograms();
    }, []);

    return (
        <div className="flex min-h-screen bg-base-200">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main>
                    {success && <SuccessAlert text={success} />}
                    {error && <ErrorAlert text={error} />}
                    <div className="bg-base-100 rounded-xl shadow-sm p-6 m-3">
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold mb-4">Add New Program</h2>
                            <ProgramForm onSubmit={addProgram} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold mb-4">Programs</h2>
                            <ProgramList
                                programs={programs}
                                onDelete={deleteProgram}
                                onEdit={editProgram}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Programs;
