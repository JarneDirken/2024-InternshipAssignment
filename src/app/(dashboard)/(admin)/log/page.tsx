'use client';
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import Unauthorized from "../../(error)/unauthorized/page";
import { DocumentSnapshot, collection, limit, onSnapshot, orderBy, query, startAfter, where, getDocs, addDoc, getFirestore, writeBatch } from "firebase/firestore";
import { db } from '@/services/firebase-config';
import { Notification } from "@/models/Notification";
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Tooltip, Pagination } from "@mui/material";
import Button from "@/components/states/Button";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import * as XLSX from 'xlsx';
import useUser from "@/hooks/useUser";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

const PAGE_SIZE = 50;

export default function Log() {
    const { userRole, loading, isAuthorized } = useAuth(['Student','Teacher','Supervisor','Admin']);
    const [notificationsAdmin, setNotificationsAdmin] = useState<Notification[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationsAll, setNotificationsAll] = useState<Notification[]>([]);
    const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const { userId, token } = useUser();

    useEffect(() => {
        if (!loading && isAuthorized && userId && userRole && token) {
            const checkArray = [userRole, userId];
            if (userRole === "Admin") {
                fetchTotalCount(null);
                listenForNotificationsAdmin();
            } else {
                fetchTotalCount(checkArray);
                listenForNotifications(checkArray);
            }
        }
    }, [loading, isAuthorized, userId, userRole, token, page]);

    const listenForNotificationsAll = () => {
        const notificationsQuery = query(
            collection(db, "notifications"),
            orderBy("timeStamp", "desc"),
        );

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
                setNotificationsAll(newNotifications);
            }
        });

        return unsubscribe;
    };

    const fetchTotalCount = async (checkArray: string[] | null) => {
        const notificationsQuery = checkArray
            ? query(collection(db, "notifications"), where("targets", "array-contains-any", checkArray))
            : query(collection(db, "notifications"));

        const snapshot = await getDocs(notificationsQuery);
        const totalCount = snapshot.size;
        setTotalPages(Math.ceil(totalCount / PAGE_SIZE));
    };

    const listenForNotificationsAdmin = () => {
        const notificationsQuery = query(
            collection(db, "notifications"),
            orderBy("timeStamp", "desc"),
            limit(PAGE_SIZE),
            ...(lastVisible ? [startAfter(lastVisible)] : [])
        );

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
                setNotificationsAdmin(newNotifications);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            }
        });

        return unsubscribe;
    };

    const listenForNotifications = (checkArray: string[]) => {
        const notificationsQuery = query(
            collection(db, "notifications"),
            orderBy("timeStamp", "desc"),
            where("targets", "array-contains-any", checkArray),
            limit(PAGE_SIZE),
            ...(lastVisible ? [startAfter(lastVisible)] : [])
        );

        const unsubscribe = onSnapshot(notificationsQuery, snapshot => {
            const newNotifications = snapshot.docChanges()
                .filter(change => change.type === "added")
                .map(change => {
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
                setNotifications(newNotifications);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            }
        });

        return unsubscribe;
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
        setLastVisible(null);
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
        if (!notificationsAll || !notificationsAll.length) return;

        const dataToExport: ExportDataLogs[] = notificationsAll.map(item => ({
            id: item.id,
            message: item.message,
            targets: item.targets && item.targets.length > 0 ? item.targets.join(", ") : "No targets",
            isRead: item.isRead,
            fromRole: item.fromRole,
            toRole: item.toRole,
            timeStamp: item.timeStamp,
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

        const colWidths = Object.keys(dataToExport[0]).map(key => ({
            wch: Math.max(
                ...dataToExport.map(item => item[key] ? item[key]!.toString().length : 0),
                key.length
            )
        }));
        worksheet['!cols'] = colWidths;

        XLSX.writeFile(workbook, `${filename}.xlsx`);
        
        return workbook; // Return the workbook object
    };

    const uploadExcelToFirebase = async (workbook: XLSX.WorkBook, filename: string) => {
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const storage = getStorage();
        const storageRef = ref(storage, `excelLists/${filename}.xlsx`);
        const uploadTask = uploadBytesResumable(storageRef, blob);
    
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
                (snapshot) => {
                    // Progress monitoring can be added here
                }, 
                (error) => {
                    console.error("Error uploading file:", error);
                    reject(error);
                }, 
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => {
                        console.log('File available at', downloadURL);
                        resolve(downloadURL);
                    });
                }
            );
        });
    };    

    const exportAndClearList = async () => {
        // Step 1: Export the current list to Excel and get the workbook object
        const workbook = exportLogsHistoryToExcel("Logs-History", "LogsData");
    
        if (workbook) {
            // Step 2: Upload the Excel file to Firebase Storage
            await uploadExcelToFirebase(workbook, "Logs-History");
    
            // Step 3: Clear the whole collection of notifications
            const notificationsRef = collection(db, "notifications");
            const notificationsSnapshot = await getDocs(notificationsRef);
            const batch = writeBatch(db);
    
            notificationsSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
    
            await batch.commit();
    
            // Step 4: Add a new notification stating "Notifications cleared"
            await addDoc(notificationsRef, {
                message: "Notifications cleared",
                isRead: false,
                fromRole: "Admin",
                toRole: ["Admin"],
                targets: ["Admin"],
                timeStamp: new Date(),
            });
    
            // Clear the local state
            setNotificationsAdmin([]);
            setNotifications([]);
            setLastVisible(null);
        }
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div className="overflow-x-scroll rounded-xl bg-white w-full p-4" style={{ maxHeight: "90vh" }}>
            <div className='mb-4 flex items-center gap-3'>
                <ArticleOutlinedIcon fontSize="large" />
                <h1 className="font-semibold text-2xl">Logs</h1>
                {userRole === "Admin" && (
                    <div className="flex gap-4">
                        <Button
                            icon={<InsertDriveFileOutlinedIcon />}
                            textColor="custom-dark-blue"
                            borderColor="custom-dark-blue"
                            buttonClassName="hover:bg-blue-200"
                            fillColor="blue-100"
                            paddingX="px-2.5"
                            paddingY="py-0.5"
                            textClassName="font-semibold"
                            text="Export EXCEL"
                            onClick={() => exportLogsHistoryToExcel("Logs-History", "LogsData")}
                        />
                        <Button 
                            text="Clear"
                            buttonClassName="hover:bg-gray-100"
                            onClick={exportAndClearList}
                        />
                    </div>
                )}
            </div>
            {userRole === "Admin" ? (
                <div>
                    <div>
                        <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                    </div>
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
                    <div>
                        <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                    </div>
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