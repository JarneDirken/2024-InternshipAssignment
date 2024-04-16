'use client';
import Unauthorized from "@/app/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import app from "@/services/firebase-config";
import Filters from "@/components/(user)/return/Filter";
import { ItemRequest } from "@/models/ItemRequest";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ItemCard from "@/components/(user)/ItemCard";

export default function Return() {
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
            const response = await fetch(`/api/user/returns?${queryString}`);
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

    const calculateDaysRemaining = (returnDate?: Date | string) => {
        if (!returnDate) {
            return <span>Return date not set</span>;
        }
    
        // Convert returnDate to a Date object if it's not one.
        const validReturnDate = returnDate instanceof Date ? returnDate : new Date(returnDate);
    
        const currentDate = new Date();
        const returnDateOnly = new Date(validReturnDate.getFullYear(), validReturnDate.getMonth(), validReturnDate.getDate());
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
        // Use getTime() to get timestamps and calculate the difference in milliseconds
        const msPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds per day
        const daysDiff = Math.round((returnDateOnly.getTime() - currentDateOnly.getTime()) / msPerDay);
    
        let urgent = daysDiff < 2;
        let tooLate = daysDiff < 0;

        const dayLabel = Math.abs(daysDiff) === 1 ? "day" : "days";
    
        return (
            <div className={`flex items-center gap-1 ${urgent ? 'text-custom-red' : 'text-custom-primary'}`}>
                <AccessTimeIcon fontSize="small" />
                {tooLate ? (
                    <span>{Math.abs(daysDiff)} {dayLabel} late</span>
                ) : (
                    <span>{daysDiff} {dayLabel} remaining</span>
                )}
            </div>
        );
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
                            Current borrows
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-3 transform translate-x-1/2 -translate-y-1/2 text-xs bg-custom-primary`}>
                            {totalItemCount}
                        </div>
                    </div>
                </div>
                <ItemCard 
                    active={active}
                    openModal={openModal}
                    items={items}
                    calculateReturnDate={calculateDaysRemaining}
                />
            </div>
        </div>
    );
}