'use client';
import Image from "next/image";
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useContext } from "react";
import { SidebarContext } from "./sidebarcontext";
import { getAuth } from "firebase/auth";

export default function Sidebar({ children }: { children: React.ReactNode }) {
    const {expanded, setExpanded} = useContext(SidebarContext);

    const handleLogout = () => {
        const auth = getAuth();
        auth.signOut();
    };
    
    return (
        <aside className="h-screen max-w-fit fixed left-0 z-10">
            <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <Image src={'/assets/images/logo.png'} 
                        className={`overflow-hidden transition-all mx-auto`}
                        style={{ width: expanded ? '128px' : '0px', height: 'auto' }}  // Adjust width dynamically, height auto
                        height={expanded ? 128 : 0}
                        width={expanded ? 128 : 0}
                        alt="Logo"
                        priority
                    />
                    <button 
                        onClick={() => setExpanded(!expanded)} 
                        className="py-1.5 px-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        {expanded? <FirstPageRoundedIcon />: <LastPageRoundedIcon />}
                    </button>
                </div>
                
                <ul className={`flex-1 px3 overflow-y-auto overflow-x-hidden ${expanded ? "ml-[10.92px]" : "mx-auto"}`}>{children}</ul>

                <div className="border-t flex p-4">
                    <button className={`bg-gray-100 flex py-1.5 hover:bg-gray-200 overflow-hidden transition-all w-full ${expanded ? "justify-center" : "rounded-lg"}`} onClick={handleLogout}>
                        <LogoutRoundedIcon className={`text-2xl ${expanded ? "mr-2" : "mx-auto"}`} />
                        <p className={`font-semibold ${expanded ? "block" : "hidden"}`}>Log Out</p>
                    </button>
                </div>
            </nav>
        </aside>
    );
}

interface SidebarItemProps {
    icon: React.ReactNode;
    text: string;
    active?: boolean;
}

export function SidebarItem({icon, text, active}: SidebarItemProps) {
    const {expanded} = useContext(SidebarContext);

    return (
        <li className={`
            relative flex items-center py-2 px-3 my-1 
            font-medium rounded-md cursor-pointer
            transition-colors group
            ${
                active
                  ? "bg-orange-100"
                  : "hover:bg-orange-50 text-gray-600"
            }
        `}>
            {icon}
            <span className={`
                overflow-hidden transition-all 
                ${expanded ? "w-48 ml-3" : "w-0"}
                ${active ? "font-semibold" : ""}
            `}
            >
                {text}
            </span>
            {!expanded && (
                <div 
                    className={`
                        absolute left-full rounded-md px-2 py-1 ml-6
                        bg-orange-50 text-sm font-semibold
                        invisible opacity-20 -translate-x-3 transition-all
                        group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                    `}
                >
                    {text}
                </div>
            )}
        </li>
    )
}

export function MobileSidebarItem({icon, text, active}: SidebarItemProps) {

    return (
        <li className={`
            relative flex items-center py-2 px-3 my-1 
            font-medium rounded-md cursor-pointer
            transition-colors group
            ${
                active
                  ? "bg-orange-100"
                  : "hover:bg-orange-50 text-gray-600"
            }
        `}>
            {icon}
            <span className={`
                overflow-hidden transition-all w-48 ml-3
                ${
                    active
                      ? "font-semibold"
                      : ""
                }
            `}
            >
                {text}
            </span>
        </li>
    )
}