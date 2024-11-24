import React, { useEffect, useState} from "react";
import NavBar from "../components/NavBar";
import {Clock, ShieldCheck} from "lucide-react";


export default function ForApproval() {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <NavBar/>
            <div
                className="min-h-screen bg-base-300 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-base-100 rounded-2xl shadow-xl p-8 space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div
                                    className="absolute inset-0 animate-ping bg-blue-100 rounded-full opacity-75"></div>
                                <div className="relative bg-white rounded-full p-3">
                                    <ShieldCheck className="w-12 h-12 text-blue-600"/>
                                </div>
                            </div>
                        </div>

                        <div className="text-center space-y-3">
                            <h1 className="text-2xl font-bold text-primary">Waiting for Approval</h1>
                            <p className="text-secondary">
                                Your request is being reviewed by our team{dots}
                            </p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                                <Clock className="w-5 h-5 text-blue-600"/>
                                <div className="text-sm text-blue-800">
                                    Average response time: 24-48 hours
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <div className="text-sm text-accent space-y-2">
                                <p>While you wait:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>Make sure your contact information is up to date</li>
                                    <li>Check your email for any additional requirements</li>
                                    <li>Review our guidelines and policies</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}