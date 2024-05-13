'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { getAuth } from 'firebase/auth';
import {app} from "@/services/firebase-config";
import { ItemRequest } from "@/models/ItemRequest";
import Filters from "@/components/general/Filter";
import ItemCard from "@/components/(supervisor)/lendings/ItemCard";
import Loading from "@/components/states/Loading";
import Modal from "@/components/(supervisor)/lendings/Modal";
import { useRecoilValue } from "recoil";
import { updateRequest } from "@/services/store";
import { Filter } from "@/models/Filter";
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import { SortOptions } from "@/models/SortOptions";
import { useInView } from "react-intersection-observer";

export default function Lending() {
    const { isAuthorized, loading } = useAuth(['Supervisor', 'Admin']);
    const [selectedTab, setSelectedTab] = useState('borrows'); // standard open tab
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [userId, setUserId] = useState<string | null>(null); // userID
    const auth = getAuth(app); // Get authentication
    // Items
    const [itemLoading, setItemLoading] = useState(true); // item loading
    const [item, setItem] = useState<ItemRequest>(); // to store one item
    const [borrows, setBorrows] = useState<ItemRequest[]>([]);
    const [returns, setReturns] = useState<ItemRequest[]>([]);
    const [checkItem, setCheckItem] = useState<ItemRequest[]>([]);
    const [allRequests, setAllRequests] = useState<ItemRequest[]>([]);
    const [totalBorrowsCount, setTotalBorrowsCount] = useState(0);
    const [totalReturnsCount, setTotalReturnCount] = useState(0);
    const [totalCheckItemCount, setTotalCheckItemCount] = useState(0);
    // filters
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // filter
    const [requestor, setRequestor] = useState('');  // filter
    const [location, setLocation] = useState('');  // filter
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const requests = useRecoilValue(updateRequest);
    const [handover, setHandover] = useState(false);
    const [receive, setReceive] = useState(false);
    const [checked, setChecked] = useState(false);
    const [currentItems, setCurrentItems] = useState(borrows);
    const filters: Filter[] = [
        { label: 'Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'item.name' },
        { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange'},
        { label: 'Requestor', state: [requestor, setRequestor], inputType: 'text', optionsKey: 'borrower.firstName' },
        { label: 'Location', state: [location, setLocation], inputType: 'text', optionsKey: 'item.location.name' },
    ];
    const [repairState, setRepairState] = useState(false);
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
            getBorrows(true);
            if(selectedTab === "returns"){
                getReturns(true);
            }
            if(selectedTab === "checkitem"){
                getCheckItem(true);
            }
        }
    }, [userId, requests, nameFilter, borrowDateFilter, requestor, location]);

    useEffect(() => {
        if(selectedTab === "returns"){
            getReturns(true);
        }
        if(selectedTab === "checkitem"){
            getCheckItem(true);
        }
        if(selectedTab === "history"){
            getAllRequests(true);
        }
    }, [selectedTab]);

    useEffect(() => {
        switch (selectedTab) {
            case "borrows":
                setCurrentItems(borrows);
                break;
            case "returns":
                setCurrentItems(returns);
                break;
            case "checkitem":
                setCheckItem(checkItem);
                break;
            case "history":
                setCurrentItems(allRequests);
                break;
            default:
                setCurrentItems([]);
        }
    }, [selectedTab, borrows, returns, checkItem, allRequests]);

    // infinate loading scroll
    useEffect(() => {
        if (inView && hasMore && !loading) {
            const currentScrollPosition = listRef.current ? listRef.current.scrollTop : 0;
            if(selectedTab === "borrows"){
                getBorrows().then(() => {
                    requestAnimationFrame(() => {
                        if (listRef.current) {
                            listRef.current.scrollTop = currentScrollPosition;
                        }
                    });
                });
            }
            if(selectedTab === "returns"){
                getReturns().then(() => {
                    requestAnimationFrame(() => {
                        if (listRef.current) {
                            listRef.current.scrollTop = currentScrollPosition;
                        }
                    });
                });
            }
            if(selectedTab === "checkitem"){
                getCheckItem().then(() => {
                    requestAnimationFrame(() => {
                        if (listRef.current) {
                            listRef.current.scrollTop = currentScrollPosition;
                        }
                    });
                });
            }
            if(selectedTab === "history"){
                getAllRequests().then(() => {
                    requestAnimationFrame(() => {
                        if (listRef.current) {
                            listRef.current.scrollTop = currentScrollPosition;
                        }
                    });
                });
            }
        }
    }, [inView, loading, hasMore]);

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'name':
                setNameFilter(value);
                break;
            case 'Borrow date':
                setBorrowDateFilter(value);
                break;
            case 'requestor':
                setRequestor(value);
                break;
            case 'location':
                setLocation(value);
                break;
            default:
                break;
        }
    };

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        if(selectedTab === "borrows") { getBorrows(true, sortBy, sortDirection); }
        if(selectedTab === "returns") { getReturns(true, sortBy, sortDirection); }
        if(selectedTab === "checkitem") { getCheckItem(true, sortBy, sortDirection); }
        if(selectedTab === "history") { getAllRequests(true, sortBy, sortDirection); }
    };

    const parseDateFilter = (dateFilter: string) => {
        const dates = dateFilter.split(" - ");
        const borrowDate = dates[0];
        const returnDate = dates.length > 1 ? dates[1] : new Date().toLocaleDateString('en-US');
    
        return { borrowDate, returnDate };
    };

    const openModal = (itemRequest: ItemRequest) => {
        setItem(itemRequest);
        setModalOpen(true);
    };

    async function getBorrows(initialLoad = false, sortBy = 'requestDate', sortDirection = 'desc') {
        if (!hasMore && !initialLoad) return; // infinate loading
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const currentOffset = initialLoad ? 0 : offset; // infinate loading
        const params: Record<string, string> = {
            name: nameFilter,
            location: location,
            requestor: requestor,
            sortBy: sortBy || 'requestDate',
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
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/supervisor/pendingborrows?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.itemRequests || [];
            const itemCount = data.totalCount || 0;
            const itemCountReturn = data.totalCountReturns || 0;
            const itemCountCheckItem = data.totalCountCheckItem || 0;

            setTotalBorrowsCount(itemCount);
            setTotalReturnCount(itemCountReturn);
            setTotalCheckItemCount(itemCountCheckItem);

            // infinate loading
            if (initialLoad) {
                setBorrows(fetchedItems);
            } else {
                setBorrows(prevItems => [...prevItems, ...fetchedItems]);
            }
            setOffset(currentOffset + fetchedItems.length);
            setHasMore(fetchedItems.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getReturns(initialLoad = false, sortBy = 'requestDate', sortDirection = 'desc') {
        if (!hasMore && !initialLoad) return; // infinate loading
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const currentOffset = initialLoad ? 0 : offset; // infinate loading
        const params: Record<string, string> = {
            name: nameFilter,
            location: location,
            requestor: requestor,
            sortBy: sortBy || 'requestDate',
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
        }
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/supervisor/pendingreturns?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();

            // infinate loading
            if (initialLoad) {
                setReturns(data);
            } else {
                setReturns(prevItems => [...prevItems, ...data]);
            }
            setOffset(currentOffset + data.length);
            setHasMore(data.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getCheckItem(initialLoad = false, sortBy = 'requestDate', sortDirection = 'desc'){
        if (!hasMore && !initialLoad) return; // infinate loading
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const currentOffset = initialLoad ? 0 : offset; // infinate loading
        const params: Record<string, string> = {
            name: nameFilter,
            location: location,
            requestor: requestor,
            sortBy: sortBy || 'requestDate',
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
        }
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/supervisor/checkitem?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // infinate loading
            if (initialLoad) {
                setCheckItem(data);
            } else {
                setCheckItem(prevItems => [...prevItems, ...data]);
            }
            setOffset(currentOffset + data.length);
            setHasMore(data.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getAllRequests(initialLoad = false, sortBy = 'decisionDate', sortDirection = 'desc') {
        if (!hasMore && !initialLoad) return; // infinate loading
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const currentOffset = initialLoad ? 0 : offset; // infinate loading
        const params: Record<string, string> = {
            name: nameFilter,
            location: location,
            requestor: requestor,
            sortBy: sortBy || 'decisionDate',
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
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/supervisor/history?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            
            // infinate loading
            if (initialLoad) {
                setAllRequests(data);
            } else {
                setAllRequests(prevItems => [...prevItems, ...data]);
            }
            setOffset(currentOffset + data.length);
            setHasMore(data.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setHandover(false);
        setReceive(false);
        setChecked(false);
        setRepairState(false);
    };

    const checkTab = () => {
        switch(selectedTab) {
            case "borrows":
                return (
                    <ItemCard
                        active={active}
                        openModal={openModal}
                        items={borrows}
                        itemLoading={itemLoading}
                        selectedTab={selectedTab}
                        setHandover={setHandover}
                        listRef={listRef}
                        hasMore={hasMore}
                        innerRef={ref}
                    />
                );
            case "returns":
                return (
                    <ItemCard
                        active={active}
                        openModal={openModal}
                        items={returns}
                        itemLoading={itemLoading}
                        selectedTab={selectedTab}
                        setReceive={setReceive}
                        listRef={listRef}
                        hasMore={hasMore}
                        innerRef={ref}
                    />
                );
            case "checkitem":
                return (
                    <ItemCard
                        active={active}
                        openModal={openModal}
                        items={checkItem}
                        itemLoading={itemLoading}
                        selectedTab={selectedTab}
                        setChecked={setChecked}
                        listRef={listRef}
                        hasMore={hasMore}
                        innerRef={ref}
                    />
                );
            case "history":
                return (
                    <ItemCard
                        active={active}
                        openModal={openModal}
                        items={allRequests}
                        itemLoading={itemLoading}
                        selectedTab={selectedTab}
                        listRef={listRef}
                        hasMore={hasMore}
                        innerRef={ref}
                    />
                );
        }
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <Modal 
                open={isModalOpen}
                onClose={closeModal}
                userId={userId}
                item={item}
                handover={handover}
                receive={receive}
                checked={checked}
                repairState={repairState}
                setRepairState={setRepairState}
            />
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    title="Lendings"
                    icon={<HandshakeOutlinedIcon fontSize="large" />}
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    items={currentItems}
                    filters={filters}
                    sortOptions={sortOptions}
                    isCardView={true}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer hover:text-custom-primary ${selectedTab === 'borrows' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('borrows')}
                        >
                            Pending borrows
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-3 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'borrows' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {totalBorrowsCount}
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer hover:text-custom-primary ${selectedTab === 'returns' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('returns')}
                        >
                            Pending returns
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-4 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'returns' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {totalReturnsCount}
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer hover:text-custom-primary ${selectedTab === 'checkitem' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('checkitem')}
                        >
                            check items
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-8 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'checkitem' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {totalCheckItemCount}
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer hover:text-custom-primary ${selectedTab === 'history' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('history')}
                        >
                            History
                        </div>
                    </div>
                </div>
                {checkTab()}
            </div>
        </div>
    );
}