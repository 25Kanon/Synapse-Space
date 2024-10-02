// MembershipsContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './AuthContext';

const MembershipsContext = createContext();

export const MembershipsProvider = ({ children }) => {
    const [memberships, setMemberships] = useState([]);
    const { user } = useContext(AuthContext);
    const fetchMemberships = async (studentNumber, token) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URI}/api/auth/memberships/`, {
                params: {
                    student_number: studentNumber
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setMemberships(response.data);
        } catch (error) {
            console.error('Error fetching memberships:', error);
        }
    };

    const addMembership = (newMembership) => {
        setMemberships((prevMemberships) => [...prevMemberships, newMembership]);
    };
    const token = localStorage.getItem('access_token');
    useEffect(() => {
        if (user) {
            const studentNumber = user.student_number; // Assuming you store the student number in localStorage
            if (token && studentNumber) {
                fetchMemberships(studentNumber, token);
            }
        }
    }, [user, token]);
    return (
        <MembershipsContext.Provider value={{ memberships, fetchMemberships, addMembership }}>
            {children}
        </MembershipsContext.Provider>
    );
};

export const useMemberships = () => {
    return React.useContext(MembershipsContext);
};
