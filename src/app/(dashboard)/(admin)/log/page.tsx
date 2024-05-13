'use client';
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from "react";
import Unauthorized from "../../(error)/unauthorized/page";
import { DocumentData, DocumentSnapshot, collection, limit, onSnapshot, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from '@/services/firebase-config';
import { Notification } from "@/models/Notification";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Tooltip } from "@mui/material";
import Button from "@/components/states/Button";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import * as XLSX from 'xlsx';
import useUser from "@/hooks/useUser";

export default function Log() {
    const { userRole, loading, isAuthorized } = useAuth(['Student','Teacher','Supervisor','Admin']);
    const [notificationsAdmin, setNotificationsAdmin] = useState<Notification[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const { userId, token } = useUser();

    useEffect(() => {
        if (!loading && isAuthorized && userId && userRole) {
            const checkArray = [userRole, userId];
            const unsubscribe = userRole === "Admin" ? listenForNotificationsAdmin() : listenForNotifications(checkArray);
            if (unsubscribe) return () => unsubscribe();
        }
    }, [loading, isAuthorized, userId, userRole]);

    const listenForNotificationsAdmin = () => {
        
        const notificationsQuery =query(
            collection(db, "notifications"),
            orderBy("timeStamp", "desc"),
        )
    
        const unsubscribe = onSnapshot(notificationsQuery, snapshot => {
            const newNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                message: doc.data().message,
                isRead: doc.data().isRead,
                fromRole: doc.data().fromRole,
                toRole: doc.data().toRole,
                targets: doc.data().targets,
                timeStamp: new Date(doc.data().timeStamp.seconds * 1000),
            }));
                        
            if (newNotifications.length > 0) {
                setNotificationsAdmin(prev => [...prev, ...newNotifications]);
            } 
        });
    
        return unsubscribe;
    };

    const listenForNotifications = (checkArray: string[]) => {
        // Create a query against the collection.
        const notificationsQuery = query(
            collection(db, "notifications"),
            orderBy("timeStamp", "desc"),
            where("targets", "array-contains-any", checkArray)
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

    interface ExportDataLogs {
        [key: string]: number | string | Date | boolean | string[] | undefined;
        id: string;
        isRead: boolean;
        message: string;
        fromRole: string;
        targets: string; 
        timeStamp: Date;
        toRole: string[];
        userId?: string | number; 
    };

    const exportLogsHistoryToExcel = (filename: string, worksheetName: string) => {
        if (!notificationsAdmin || !notificationsAdmin.length) return;
    
        const dataToExport: ExportDataLogs[] = notificationsAdmin.map(item => ({
            id: item.id,
            message: item.message,
            targets: item.targets && item.targets.length > 0 ? item.targets.join(", ") : "No targets",
            isRead: item.isRead,
            fromRole: item.fromRole,
            toRole: item.toRole,
            timeStamp: item.timeStamp,
        }));
    
        // Create a worksheet from the data
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
    
        // Adjust column widths
        const colWidths = Object.keys(dataToExport[0]).map(key => ({
            wch: Math.max(
                ...dataToExport.map(item => item[key] ? item[key]!.toString().length : 0),
                key.length  // Include the length of the header in the calculation
            )
        }));
        worksheet['!cols'] = colWidths;
    
        // Write the workbook to a file
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div className="overflow-x-scroll rounded-xl bg-white w-full p-4" style={{maxHeight: "90vh"}}>
            <div className='mb-4 flex items-center gap-3'>
                <ArticleOutlinedIcon fontSize="large" />
                <h1 className="font-semibold text-2xl">Logs</h1>
                {userRole === "Admin" && (
                    <Button 
                        icon={<InsertDriveFileOutlinedIcon />} 
                        textColor="custom-dark-blue"
                        borderColor="custom-dark-blue"
                        fillColor="blue-100"
                        paddingX="px-2.5"
                        paddingY="py-0.5"
                        textClassName="font-semibold"
                        text="Export EXCEL"
                        onClick={() => exportLogsHistoryToExcel("Logs-History", "LogsData")}
                    />
                )}
            </div>
            {userRole === "Admin" ? (
                <div>
                    {notificationsAdmin.map((notification) => (
                        <div key={notification.id}>
                            <span>
                                {notification.message} -&gt; with role: {notification.fromRole} - {notification.timeStamp.toLocaleString()}&nbsp;|&nbsp;
                                {notification.isRead ? <Tooltip title="Has been read" arrow><VisibilityOutlinedIcon fontSize="small"/></Tooltip> 
                                : <Tooltip title="Has not been read" arrow><VisibilityOffOutlinedIcon fontSize="small"/></Tooltip>}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                   {notifications.map((notification) => (
                        <div key={notification.id}>
                            <span>
                                {notification.message} -&gt; - {notification.timeStamp.toLocaleString()}&nbsp;|&nbsp;
                                {notification.isRead ? <Tooltip title="Has been read" arrow><VisibilityOutlinedIcon fontSize="small"/></Tooltip> 
                                : <Tooltip title="Has not been read" arrow><VisibilityOffOutlinedIcon fontSize="small"/></Tooltip>}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}