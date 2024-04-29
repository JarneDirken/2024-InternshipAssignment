'use client';
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import Unauthorized from "../../(error)/unauthorized/page";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from '@/services/firebase-config';
import { Notification } from "@/models/Notification";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Tooltip } from "@mui/material";

export default function Log() {
    const { userRole, loading, isAuthorized } = useAuth(['Admin']);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!loading && isAuthorized) {
            const unsubscribe = listenForNotifications();
            return () => unsubscribe();
        }
    }, [loading, isAuthorized]);

    const listenForNotifications = () => {
        // Create a query against the collection.
        const notificationsQuery = query(
            collection(db, "notifications"),
            orderBy("timeStamp", "desc")
        );
    
        // Listen for query results in real time
        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const newNotifications: Notification[] = snapshot.docChanges()
                .filter(change => change.type === "added")
                .map(change => {
                    // Convert Firestore data to the Notification interface
                    const data = change.doc.data();
                    const notification: Notification = {
                        id: change.doc.id,
                        message: data.message,
                        isRead: data.isRead,
                        fromRole: data.fromRole,
                        toRole: data.toRole,
                        timeStamp: new Date(data.timeStamp.seconds * 1000),
                    };
                    return notification;
                });
    
            if (newNotifications.length > 0) {
                setNotifications(prevNotifications => {
                    // Merge new and existing notifications, sort them by timeStamp descending
                    const updatedNotifications = [...prevNotifications, ...newNotifications]
                        .sort((a, b) => b.timeStamp.getTime() - a.timeStamp.getTime());  // Sorting to ensure newest first
                    return updatedNotifications;
                });
            }
        });
    
        return () => unsubscribe();
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div className="overflow-x-scroll rounded-xl bg-white w-full p-4">
            <div className='mb-4 flex items-center gap-3'>
                <ArticleOutlinedIcon fontSize="large" />
                <h1 className="font-semibold text-2xl">Logs</h1>
            </div>
            <div>
                {notifications.map((notification) => (
                    <div key={notification.id}>
                        <span>
                            {notification.message} -&gt; with role: {notification.fromRole} - {notification.timeStamp.toLocaleString()}&nbsp;|&nbsp;
                            {notification.isRead ? <Tooltip title="Has been read" arrow><VisibilityOutlinedIcon fontSize="small"/></Tooltip> 
                            : <Tooltip title="Has not been read" arrow><VisibilityOffOutlinedIcon fontSize="small"/></Tooltip>}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}