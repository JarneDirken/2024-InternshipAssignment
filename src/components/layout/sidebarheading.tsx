'use client';
import { useContext } from "react";
import { SidebarContext } from "./sidebarcontext";

export default function SidebarHeading({ children }: { children: React.ReactNode }) {
    const { expanded } = useContext(SidebarContext);
    return expanded ? <h2 className="text-gray-600 text-base font-extrabold px-2 mt-2">{children}</h2> : null;
}

export function MobileSidebarHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="text-gray-600 text-base font-extrabold px-2 mt-2">{children}</h2>;
}