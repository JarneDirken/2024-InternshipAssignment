'use client';
import { createContext, useState } from 'react';

export const SidebarContext = createContext({expanded: true, setExpanded: (expanded: boolean) => {}});

export default function DashboardContext({ children }: { children: React.ReactNode }) {
    const [expanded, setExpanded] = useState(true);
    return (
        <SidebarContext.Provider value={{ expanded, setExpanded }}>
            {children}
        </SidebarContext.Provider>
    );
}