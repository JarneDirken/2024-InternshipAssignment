'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import Filters from "@/components/general/Filter";
import { ItemRequest } from "@/models/ItemRequest";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ItemCard from "@/components/(user)/ItemCard";
import Loading from "@/components/states/Loading";
import { useRecoilState } from "recoil";
import { updateRequest } from "@/services/store";
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';
import { Filter } from "@/models/Filter";
import { SortOptions } from "@/models/SortOptions";
import { useInView } from "react-intersection-observer";
import useUser from "@/hooks/useUser";

export default function Return() {
    const { isAuthorized, loading } = useAuth(['Student', 'Teacher', 'Supervisor', 'Admin']);
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const { userId, token } = useUser();
    const [itemLoading, setItemLoading] = useState(true);
    const [items, setItems] = useState<ItemRequest[]>([]);
    const [totalItemCount, setTotalItemCount] = useState(0);
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // model filter
    const [requests, setRequest] = useRecoilState(updateRequest);
    const filters: Filter[] = [
        { label: 'Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'item.name'},
        { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange'}
    ];
    const sortOptions: SortOptions[] = [
        { label: 'Name', optionsKey: 'item.name' },
        { label: 'End Borrow Date', optionsKey: 'returnDate' },
        { label: 'Location', optionsKey: 'item.location.name' }
    ];  
    // infinate scroll load
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);     
    const NUMBER_OF_ITEMS_TO_FETCH = 10;
    const listRef = useRef<HTMLDivElement>(null);
    const { ref, inView } = useInView();

    useEffect(() => {
        if(userId) {
            getItems(true);
        }
    }, [userId, requests, nameFilter, borrowDateFilter]); 

    // infinate loading scroll
    useEffect(() => {
        if (inView && hasMore && !loading) {
            const currentScrollPosition = listRef.current ? listRef.current.scrollTop : 0;
            getItems().then(() => {
                requestAnimationFrame(() => {
                    if (listRef.current) {
                        listRef.current.scrollTop = currentScrollPosition;
                    }
                });
            });
        }
    }, [inView, loading, hasMore]);

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'Name':
                setNameFilter(value);
                break;
            case 'Borrow date':
                setBorrowDateFilter(value);
                break;
            default:
                break;
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

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        getItems(true, sortBy, sortDirection);
    };

    const parseDateFilter = (dateFilter: string) => {
        const dates = dateFilter.split(" - ");
        const borrowDate = dates[0];
        const returnDate = dates.length > 1 ? dates[1] : new Date().toLocaleDateString('en-US');
    
        return { borrowDate, returnDate };
    };

    async function getItems(initialLoad = false, sortBy = 'returnDate', sortDirection = 'desc') {
        if (!hasMore && !initialLoad) return; // infinate loading
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const currentOffset = initialLoad ? 0 : offset; // infinate loading
        const params: Record<string, string> = {
            name: nameFilter,
            sortBy: sortBy || 'returnDate',
            sortDirection: sortDirection || 'desc',
            offset: currentOffset.toString(), // infinate loading 
            limit: NUMBER_OF_ITEMS_TO_FETCH.toString() // infinate loading 
        };

        // Include dates in the query only if they are defined
        if (borrowDate) {
            params.borrowDate = borrowDate;
            params.returnDate = returnDate;
        }
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        };

        if (token !== null) {
            params.token = token;
        };
    
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
            
            // infinate loading
            if (initialLoad) {
                setItems(fetchedItems);
            } else {
                setItems(prevItems => [...prevItems, ...fetchedItems]);
            }
            setOffset(currentOffset + fetchedItems.length);
            setHasMore(fetchedItems.length === NUMBER_OF_ITEMS_TO_FETCH);
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
                    title="Returns"
                    icon={<KeyboardReturnOutlinedIcon fontSize="large" />}
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    items={items}
                    filters={filters}
                    sortOptions={sortOptions}
                    isCardView={true}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase border-b-4 border-b-custom-primary text-custom-primary font-semibold`}
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
                    items={items}
                    calculateReturnDate={calculateDaysRemaining}
                    itemLoading={itemLoading}
                    userId={userId}
                    listRef={listRef}
                    hasMore={hasMore}
                    innerRef={ref}
                />
            </div>
        </div>
    );
}