'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import app from "@/services/firebase-config";
import { ItemRequest } from "@/models/ItemRequest";
import Filters from "@/components/(user)/history/Filter";
import ItemCard from "@/components/(supervisor)/ItemCard";
import Loading from "@/components/states/Loading";
import DateRangePicker from "@/components/states/DateRangePicker";

export default function History() {
    const { isAuthorized, loading } = useAuth(['Supervisor', 'Admin']);
    const [selectedTab, setSelectedTab] = useState('normalBorrows'); // standard open tab
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [userId, setUserId] = useState<string | null>(null); // userID
    const auth = getAuth(app); // Get authentication
    const [itemLoading, setItemLoading] = useState(true);
    const [items, setItems] = useState<ItemRequest[]>([]);
    const [totalItemCount, setTotalItemCount] = useState(0);
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // model filter
    const [returnDateFilter, setReturnDateFilter] = useState(''); // brand filter

    const [borrowDate, setBorrowDate] = useState<Date | null>(null); // borrow date
    const [returnDate, setReturnDate] = useState<Date | null>(null); // return date
    const [errorMessage, setErrorMessage] = useState<String | null>(null); // error message with dates

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
        setItemLoading(true);
        const params: Record<string, string> = {
            name: nameFilter,
        };
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        }
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
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
        } finally {
            setItemLoading(false);
        }
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

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
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'normalBorrows' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('normalBorrows')}
                        >
                            Pending borrows
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-3 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'normalBorrows' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {totalItemCount}
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'urgentBorrows' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('urgentBorrows')}
                        >
                            Urgent borrows
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-4 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'urgentBorrows' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            0
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'requestedBorrows' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('requestedBorrows')}
                        >
                            Requested borrows
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-0 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'requestedBorrows' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            0
                        </div>
                    </div>
                </div>
                <ItemCard 
                    active={active}
                    openModal={openModal}
                    items={items}
                    itemLoading={itemLoading}
                />
                
                <DateRangePicker 
                    borrowDate={borrowDate}
                    returnDate={returnDate}
                    setBorrowDate={setBorrowDate}
                    setReturnDate={setReturnDate}
                    setErrorMessage={setErrorMessage}
                />
            </div>
        </div>
    );
}