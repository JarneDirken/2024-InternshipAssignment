'use client';
import { useContext } from "react";
import { SidebarContext } from "./sidebarcontext";

export default function DashboardFrame({ children }: { children: React.ReactNode }) {
    const { expanded } = useContext(SidebarContext);
    return (
        <div className={`flex-grow pt-20 transition-all overflow-hidden bg-gray-100 ${expanded ? "pl-0 sm:pl-[270px]" : "pl-0 sm:pl-[73.056px]"}`}>
            <div className="overflow-y-auto h-full p-6">
                {children}
            </div>
        </div>
    );
}