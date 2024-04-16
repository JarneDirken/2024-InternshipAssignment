'use client';
import Unauthorized from "@/app/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import app from "@/services/firebase-config";
import { ItemRequest } from "@/models/ItemRequest";
import Filters from "@/components/(user)/history/Filter";
import HistoryCard from "@/components/(user)/history/HistoryCard";


export default function History() {
    const isAuthorized = useAuth(['Student', 'Teacher', 'Supervisor', 'Admin']); // All these roles can view this page
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [userId, setUserId] = useState<string | null>(null); // userID
    const auth = getAuth(app); // Get authentication
    const [items, setItems] = useState<ItemRequest[]>([]);
    const [totalItemCount, setTotalItemCount] = useState(0);
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // model filter
    const [returnDateFilter, setReturnDateFilter] = useState(''); // brand filter

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });
        return () => unsubscribe(); // Clean up the listener
    }, [userId]);

    useEffect(() => {
        if(userId) {
            getItems();
            console.log(items);
        }
    }, [userId]);

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'name':
                setNameFilter(value);
                break;
            case 'model':
                setBorrowDateFilter(value);
                break;
            case 'brand':
                setReturnDateFilter(value);
                break;
            default:
                break;
        }
    };

    const openModal = () => {

    }

    async function getItems() {
        const params: Record<string, string> = {
            name: nameFilter,
        };
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        }
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            console.log("going in for key");
            const response = await fetch(`/api/user/history?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.itemRequests || [];
            const itemCount = data.totalCount || 0;

            setTotalItemCount(itemCount);
            setItems(fetchedItems);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    };

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    items={items}
                    totalItemCount={totalItemCount}
                    userId={userId}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer border-b-4 border-b-custom-primary text-custom-primary font-semibold`}
                        >
                            All borrowed
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-7 transform translate-x-1/2 -translate-y-1/2 text-xs bg-custom-primary`}>
                            {totalItemCount}
                        </div>
                    </div>
                </div>
                <HistoryCard 
                    active={active}
                    openModal={openModal}
                    userId={userId || ''}
                    items={items}
                />
            </div>
        </div>
    );
}