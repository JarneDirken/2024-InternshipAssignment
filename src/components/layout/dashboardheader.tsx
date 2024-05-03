'use client';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Avatar from '@mui/material/Avatar';
import { useEffect, useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Image from "next/image";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "@/services/firebase-config";
import Link from 'next/link';
import Loading from '../states/Loading';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { usePathname } from 'next/navigation';
import { MobileSidebarItem } from './sidebar';
import MobileSidebarHeading from './sidebarheading';
import { useRecoilState } from 'recoil';
import { userProfileState } from '@/services/store';
import Tooltip from '@mui/material/Tooltip';
import useAuth from '@/hooks/useAuth';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { db } from '@/services/firebase-config';
import { collection, onSnapshot, query, where, doc, updateDoc } from "firebase/firestore"; 
import { Notification } from '@/models/Notification';
import { Menu } from '@mui/material';
import MenuItem from "@mui/material/MenuItem";
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from "@mui/material/IconButton";
import { useSnackbar } from 'notistack';
import Button from '../states/Button';

export default function DashboardHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useRecoilState(userProfileState);
    const pathname = usePathname();
    const auth = getAuth();
    const { userRole, loading } = useAuth(['Student', 'Teacher', 'Supervisor', 'Admin']);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { enqueueSnackbar } = useSnackbar();
    const [userId, setUserId] = useState<string | null>(null); // userID

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserProfile(user.uid);
            }
        });
    }, []);

    useEffect(() => {
        if (userRole) {
            if (profile && userRole.length > 0 && !loading) {
                const unsubscribe = listenForNotifications();
                return () => unsubscribe();
            }
        }
    }, [profile, userRole, loading]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });
        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        // Define the function that handles screen resizing
        const handleResize = () => {
            // For example, reset isOpen when the screen width is greater than 768px
            if (window.innerWidth > 768) {
                setIsOpen(false);
            }
        };

        // Add the event listener for resize
        window.addEventListener('resize', handleResize);

        // Clean up the event listener when the component unmounts
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Function to listen for real-time updates
    const listenForNotifications = () => {
        // Create a query against the collection.
        // This is an example where we listen for notifications meant for the current user.
        const rolesToQuery = Array.isArray(userRole) ? userRole : [userRole];
        const targetsToQuery = [userId, ...rolesToQuery];
        // Adjust the query based on how your notifications are structured.
        const notificationsQuery = query(
            collection(db, "notifications"),
            where("targets", "array-contains-any", targetsToQuery)
        );

       // Listen for query results in real time
        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if ((change.type === "added" || change.type === "modified") && change.doc.data().isRead === false) {
                    const data = change.doc.data();
                    const notification: Notification = {
                        id: change.doc.id,
                        message: data.message,
                        isRead: data.isRead,
                        fromRole: data.fromRole,
                        toRole: data.toRole,
                        timeStamp: new Date(data.timeStamp.seconds * 1000),
                        requestId: data.requestId,
                        targets: data.targets,
                    };
                    if (change.type === "added") {
                        setNotifications(prevNotifications => [...prevNotifications, notification].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i));
                    } else if (change.type === "modified") {
                        setNotifications(prevNotifications => prevNotifications.map(n => n.id === notification.id ? notification : n));
                    }
                } else if (change.type === "modified" && change.doc.data().isRead === true) {
                    // Remove the notification if it's marked as read
                    setNotifications(prevNotifications => prevNotifications.filter(n => n.id !== change.doc.id));
                }
            });
        });

        // Unsubscribe from the listener when the component unmounts or user logs out
        return () => unsubscribe();
    };

    const handleLogout = () => {
        const auth = getAuth();
        auth.signOut();
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const removeNotification = async (id: string) => {
        const notificationDocRef = doc(db, "notifications", id);
        try {
            await updateDoc(notificationDocRef, {
                isRead: true
            });
            enqueueSnackbar('Notification marked as read', { variant: 'success' });
    
            // Optionally, remove the notification from the state if you don't want it to show in the UI anymore
            setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== id));
        } catch (error) {
            console.error('Error updating notification:', error);
            enqueueSnackbar('Failed to mark notification as read', { variant: 'error' });
        }
    };

    async function fetchUserProfile(uid: string) {
        const endpoint = `/api/userprofile/${uid}`;
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const userData = await response.json();
            setProfile(userData);
        } catch (error) {
            console.error("Fetching user profile failed:", error);
        }
    };

    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    if (loading) return <Loading />;

    return(
        <nav className="bg-gray-50 z-10 shadow-sm w-full h-20 flex items-center sm:justify-end justify-between fixed top-0 left-0 right-0 z-1">
            <div className="hamburger sm:hidden z-20 cursor-pointer ml-8" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
            </div>
            <div className='flex items-center mr-10 sm:mr-16 w-full sm:w-1/5 justify-end'>
                <div className="relative">
                    <div onClick={handleMenuOpen}>
                        <NotificationsOutlinedIcon className="text-4xl cursor-pointer" />
                    </div>
                    <div className='rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-1 right-1 transform translate-x-1/2 -translate-y-1/2 text-xs bg-custom-primary'>
                        {notifications.length}
                    </div>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        className="cursor-pointer"
                    >
                        {notifications.length > 0 ? (
                            notifications.map((item) => (
                                <div>
                                <MenuItem key={item.id} onClick={handleMenuClose}>
                                    <div className="flex justify-between items-center w-full">
                                        <Link href={"/log"}>
                                            <span onClick={(e) => {
                                                e.stopPropagation();
                                            }}>
                                                {item.message} - {item.timeStamp.toLocaleDateString()}
                                            </span>
                                        </Link>
                                        <IconButton
                                            edge="end"
                                            aria-label="remove"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeNotification(item.id);
                                            }}
                                            size="small"
                                            className="justify-end" 
                                        >
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                </MenuItem>
                                </div>
                            ))
                        ) : (
                            <MenuItem onClick={handleMenuClose}>
                                No notifications
                            </MenuItem>
                        )}
                        <MenuItem className='flex justify-center items-center'>
                            <Link href="/log">
                                <Button 
                                    text="View all"
                                    fillColor="custom-primary"
                                    borderColor="custom-primary"
                                    textColor="white"
                                    paddingX='px-1'
                                    paddingY='py-0'
                                />
                            </Link>
                        </MenuItem>
                    </Menu>
                </div>
                {!profile ? (
                    <Loading />
                ) : (
                    <div className='flex items-center ml-6 justify-end truncate'>
                        <Tooltip title="Account info" arrow>
                            <Link href="/profile">
                                <Avatar sx={{ width: 40, height: 40 }}>
                                    {profile.profilePic ? (
                                        <img src={profile.profilePic} alt={`${profile.firstName} ${profile.lastName}`} />
                                    ) : (
                                        <span>
                                            {capitalizeFirstLetter(profile.firstName[0])}{capitalizeFirstLetter(profile.lastName[0])}
                                        </span>
                                    )}
                                </Avatar>
                            </Link>
                        </Tooltip>
                        <div className="hidden sm:block ml-2 truncate">
                            <p className="font-semibold">
                                {capitalizeFirstLetter(profile?.firstName)} {capitalizeFirstLetter(profile?.lastName)}
                            </p>
                            <p className="text-gray-500">{profile?.email}</p>
                        </div>
                    </div>
                )}
            </div>
            <div 
                id="menu-overlay"
                className={`fixed top-0 left-0 h-screen w-full md:w-auto bg-white z-10 transition-transform duration-500 ease-in-out 
                            flex flex-col justify-between overflow-y-scroll ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                
                <Image src={'/assets/images/logo.png'} 
                        className="overflow-hidden absolute transition-all right-9 top-6"
                        style={{ width: '90px', height: 'auto' }}
                        alt="Logo"
                        width={90}
                        height={90}
                        priority
                />
                <div className='flex flex-col w-11/12 mx-auto'>
                    <div className='px-4 mt-24'>
                        <ul className={`flex-1 px-3 mx-auto"}`}>
                        {['Student', 'Teacher', 'Supervisor', 'Admin'].includes(userRole || '') && (
                            <>
                                <MobileSidebarHeading>Links</MobileSidebarHeading>
                                <Link href="/borrow" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                        icon={<PersonAddAltOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Borrow" 
                                        active={pathname === "/borrow"}  />
                                </Link>
                                <Link href="/return" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                        icon={<KeyboardReturnOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Return" 
                                        active={pathname === "/return"}  />
                                </Link>
                                <Link href="/history" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                        icon={<HistoryOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="History"  
                                        active={pathname === "/history"}  />
                                </Link>
                            </> 
                        )}
                        {['Supervisor', 'Admin'].includes(userRole || '') && (
                            <>
                                <div className='border-b my-5'></div>

                                <MobileSidebarHeading>Supervisor</MobileSidebarHeading>
                                <Link href="/request" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                        icon={<ContentPasteOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Requests"  
                                        active={pathname === "/request"} />
                                </Link>
                                <Link href="/repair" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                        icon={<HandymanOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Repairs"  
                                        active={pathname === "/repair"} />
                                </Link>
                                <Link href="/lending" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                    icon={<HandshakeOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                    text="Lendings"  
                                    active={pathname === "/lending"} />
                                </Link>
                            </> 
                        )}
                        {userRole === 'Admin' && (
                            <>
                                <div className='border-b my-5'></div>

                                <MobileSidebarHeading>Admin</MobileSidebarHeading>
                                <Link href="/product" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                        icon={<Inventory2OutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Products"
                                        active={pathname === "/product"}  />
                                </Link>
                                <MobileSidebarItem icon={<LocationOnOutlinedIcon fontSize="inherit" className="text-2xl" />} text="Locations"  />
                                <MobileSidebarItem icon={<PeopleAltOutlinedIcon fontSize="inherit" className="text-2xl" />} text="Users"  />
                                <Link href="/parameter" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                    icon={<SettingsOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                    text="Parameters"  
                                    active={pathname === "/parameter"} />
                                </Link>
                                <Link href="/log" onClick={() => setIsOpen(false)}>
                                    <MobileSidebarItem 
                                    icon={<ArticleOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                    text="Logs"  
                                    active={pathname === "/log"} />
                                </Link>
                            </>
                        )}
                        </ul>
                    </div>
                </div>
                <div className='p-8 w-11/12 mx-auto'>
                    <div className='border-b my-6'></div>
                    <button className={`bg-gray-100 flex py-1.5 hover:bg-gray-200 overflow-hidden transition-all w-full justify-center`} onClick={handleLogout}>
                        <LogoutRoundedIcon className={`text-2xl mr-1.5`} />
                        <p className={`font-semibold ml-1.5`}>Log Out</p>
                    </button>
                </div>
            </div>
        </nav>
    );
}