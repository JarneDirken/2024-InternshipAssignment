'use client';
import Sidebar from "@/components/layout/sidebar";
import { SidebarItem } from "@/components/layout/sidebar";
import SidebarHeading from "@/components/layout/sidebarheading";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DashboardHeader from "@/components/layout/dashboardheader";
import DashboardFrame from "@/components/layout/dashboardframe";
import DashboardContext from "@/components/layout/sidebarcontext";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();

  return (
    <DashboardContext>
      <div className="flex flex-col h-screen bg-gray-100">
        <DashboardHeader/>
        <div className="hidden sm:block">
          <Sidebar>
            <Link href="/borrow">
              <SidebarItem 
                icon={<PersonAddAltOutlinedIcon fontSize="inherit" className="text-3xl" />} 
                text="Borrow" 
                active={pathname === "/borrow"}  />
            </Link>
            <Link href="/return">
              <SidebarItem 
                icon={<KeyboardReturnOutlinedIcon fontSize="inherit" className="text-3xl" />} 
                text="Return" 
                active={pathname === "/return"}  />
            </Link>
            <Link href="/history">
              <SidebarItem 
              icon={<HistoryOutlinedIcon fontSize="inherit" className="text-3xl" />} 
              text="History"  
              active={pathname === "/history"}  />
            </Link>

            <SidebarHeading>Supervisor</SidebarHeading>
            <SidebarItem icon={<ContentPasteOutlinedIcon fontSize="inherit" className="text-3xl" />} text="Requests"  />
            <SidebarItem icon={<HandymanOutlinedIcon fontSize="inherit" className="text-3xl" />} text="Repairs"  />
            <SidebarItem icon={<HandshakeOutlinedIcon fontSize="inherit" className="text-3xl" />} text="Lendings"  />
          
            <SidebarHeading>Admin</SidebarHeading>

            <Link href="/product">
              <SidebarItem 
                icon={<Inventory2OutlinedIcon fontSize="inherit" className="text-3xl" />} 
                text="Products"
                active={pathname === "/product"}  />
            </Link>
            <SidebarItem icon={<LocationOnOutlinedIcon fontSize="inherit" className="text-3xl" />} text="Locations"  />
            <SidebarItem icon={<PeopleAltOutlinedIcon fontSize="inherit" className="text-3xl" />} text="Users"  />
          </Sidebar>
        </div>
        <DashboardFrame>
          {children}
        </DashboardFrame>
      </div>
    </DashboardContext>
  );
}