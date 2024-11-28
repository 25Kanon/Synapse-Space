import React, { createContext, useState, useEffect, useContext } from "react";
import AxiosInstance from "../utils/AxiosInstance";
import { AuthContext } from "./AuthContext";
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated} = useContext(AuthContext);
    // Function to fetch notifications
    const fetchNotifications = async () => {
        if(!isAuthenticated) return;
        setLoading(true);
        try {
            const response = await AxiosInstance.get("api/notifications/", { withCredentials: true });
            setNotifications(response.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch notifications on mount and set up polling
    useEffect(() => {
        fetchNotifications(); // Initial fetch

        // Set up polling every minute
        const interval = setInterval(() => {
            fetchNotifications();
        }, 60000); // 60000ms = 1 minute

        // Clean up interval on unmount
        return () => clearInterval(interval);
    }, []);

    // Function to mark a notification as read
    const markAsRead = async (id) => {
        try {
            await AxiosInstance.post(`api/notifications/${id}/read/`, { withCredentials: true });
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif.id === id ? { ...notif, is_read: true } : notif
                )
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    return (
        <NotificationContext.Provider
            value={{ notifications, fetchNotifications, markAsRead, loading }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
