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
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DashboardHeader from "@/components/layout/dashboardheader";
import DashboardFrame from "@/components/layout/dashboardframe";
import DashboardContext from "@/components/layout/sidebarcontext";
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { SnackbarProvider } from 'notistack';
import useAuth from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userRole } = useAuth(['Student', 'Teacher', 'Supervisor', 'Admin']);
  const pathname = usePathname();

  return (
    <SnackbarProvider maxSnack={3}>
    <DashboardContext>
      <div className="flex flex-col h-screen bg-gray-100">
        <DashboardHeader/>
        <div className="hidden sm:block">
          <Sidebar>
            {['Student', 'Teacher', 'Supervisor', 'Admin'].includes(userRole || '') && (
              <>
                <Link href="/borrow">
                  <SidebarItem icon={<PersonAddAltOutlinedIcon fontSize="medium" />} text="Borrow" active={pathname === "/borrow"} />
                </Link>
                <Link href="/return">
                  <SidebarItem icon={<KeyboardReturnOutlinedIcon fontSize="medium" />} text="Return" active={pathname === "/return"} />
                </Link>
                <Link href="/history">
                  <SidebarItem icon={<HistoryOutlinedIcon fontSize="medium" />} text="History" active={pathname === "/history"} />
                </Link>
              </>
            )}

            {['Supervisor', 'Admin'].includes(userRole || '') && (
              <>
                <SidebarHeading>Supervisor</SidebarHeading>
                <Link href="/request">
                  <SidebarItem icon={<ContentPasteOutlinedIcon fontSize="medium" />} text="Requests" active={pathname === "/request"} />
                </Link>
                <Link href="/lending">
                  <SidebarItem icon={<HandshakeOutlinedIcon fontSize="medium" />} text="Lendings" active={pathname === "/lending"} />
                </Link>
                <Link href="/repair">
                  <SidebarItem icon={<HandymanOutlinedIcon fontSize="medium" />} text="Repairs" active={pathname === "/repair"} />
                </Link>
              </>
            )}

            {userRole === 'Admin' && (
              <>
                <SidebarHeading>Admin</SidebarHeading>
                <Link href="/product">
                  <SidebarItem icon={<Inventory2OutlinedIcon fontSize="medium" />} text="Products" active={pathname === "/product"} />
                </Link>
                <Link href="/location">
                  <SidebarItem icon={<LocationOnOutlinedIcon fontSize="medium" />} text="Locations" active={pathname === "/location"} />
                </Link>
                <SidebarItem icon={<PeopleAltOutlinedIcon fontSize="medium" />} text="Users" />
                <Link href="/parameter">
                  <SidebarItem icon={<SettingsOutlinedIcon fontSize="medium" />} text="Parameters" active={pathname === "/parameter"} />
                </Link>
                <Link href="/log">
                  <SidebarItem icon={<ArticleOutlinedIcon fontSize="medium" />} text="Logs" active={pathname === "/log"} />
                </Link>
              </>
            )}
          </Sidebar>
        </div>
        <DashboardFrame>
          {children}
        </DashboardFrame>
      </div>
    </DashboardContext>
    </SnackbarProvider>
  );
}