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

export default function DashboardHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useRecoilState(userProfileState);
    const pathname = usePathname();
    const auth = getAuth();
    const { userRole, loading } = useAuth(['Student', 'Teacher', 'Supervisor', 'Admin']);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserProfile(user.uid);
            }
        });
    }, []);

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

    const handleLogout = () => {
        const auth = getAuth();
        auth.signOut();
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
            <div className='flex items-center mr-10 sm:mr-16'>
                <Tooltip title="Notifciations" arrow>
                    <NotificationsOutlinedIcon className="text-4xl cursor-pointer" />
                </Tooltip>
                {!profile ? (
                    <Loading />
                ) : (
                    <div className='flex items-center ml-6'>
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
                        <div className="hidden sm:block ml-2">
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
                            flex flex-col justify-between overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                
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
                                <Link href="/borrow">
                                    <MobileSidebarItem 
                                        icon={<PersonAddAltOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Borrow" 
                                        active={pathname === "/borrow"}  />
                                </Link>
                                <Link href="/return">
                                    <MobileSidebarItem 
                                        icon={<KeyboardReturnOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Return" 
                                        active={pathname === "/return"}  />
                                </Link>
                                <Link href="/history">
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
                                <Link href="/request">
                                    <MobileSidebarItem 
                                        icon={<ContentPasteOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Requests"  
                                        active={pathname === "/request"} />
                                </Link>
                                <Link href="/repair">
                                    <MobileSidebarItem 
                                        icon={<HandymanOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Repairs"  
                                        active={pathname === "/repair"} />
                                </Link>
                                <Link href="/lending">
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
                                <Link href="/product">
                                    <MobileSidebarItem 
                                        icon={<Inventory2OutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                        text="Products"
                                        active={pathname === "/product"}  />
                                </Link>
                                <MobileSidebarItem icon={<LocationOnOutlinedIcon fontSize="inherit" className="text-2xl" />} text="Locations"  />
                                <MobileSidebarItem icon={<PeopleAltOutlinedIcon fontSize="inherit" className="text-2xl" />} text="Users"  />
                                <Link href="/parameter">
                                    <MobileSidebarItem 
                                    icon={<SettingsOutlinedIcon fontSize="inherit" className="text-2xl" />} 
                                    text="Parameters"  
                                    active={pathname === "/parameter"} />
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