// MembershipsContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';
import AxiosInstance from '../utils/AxiosInstance';

const MembershipsContext = createContext();

export const MembershipsProvider = ({ children }) => {
    const [memberships, setMemberships] = useState([]);
    const { user } = useContext(AuthContext);
    let API_BASE_URI = import.meta.env.VITE_API_BASE_URI;

    const fetchMemberships = async () => {
        try {
            const studentNumber = user.student_number;
            const response = await AxiosInstance.get('/api/auth/memberships/', { withCredentials: true,
                params: {
                    student_number: studentNumber
                }
            },
                
            );
            setMemberships(response.data);
        } catch (error) {
            console.error('Error fetching memberships:', error);
        }
    };

    const addMembership = (newMembership) => {
        setMemberships((prevMemberships) => [...prevMemberships, newMembership]);
    };
    useEffect(() => {
        if (user) {
            fetchMemberships();
        }
    }, [user]);
    return (
        <MembershipsContext.Provider value={{ memberships, fetchMemberships, addMembership }}>
            {children}
        </MembershipsContext.Provider>
    );
};

export const useMemberships = () => {
    return React.useContext(MembershipsContext);
};
