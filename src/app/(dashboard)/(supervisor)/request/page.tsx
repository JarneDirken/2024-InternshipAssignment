'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import {app} from "@/services/firebase-config";
import { ItemRequest } from "@/models/ItemRequest";
import Filters from "@/components/general/Filter";
import ItemCard from "@/components/(supervisor)/requests/ItemCard";
import Loading from "@/components/states/Loading";
import Modal from "@/components/(supervisor)/requests/Modal";
import { useRecoilValue } from "recoil";
import { updateRequest } from "@/services/store";
import MessageModal from "@/components/(user)/borrow/MessageModal";
import { Filter } from "@/models/Filter";
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import { SortOptions } from "@/models/SortOptions";

export default function Requests() {
    const { isAuthorized, loading } = useAuth(['Supervisor', 'Admin']);
    const [selectedTab, setSelectedTab] = useState('normalBorrows'); // standard open tab
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [userId, setUserId] = useState<string | null>(null); // userID
    const auth = getAuth(app); // Get authentication
    // Items
    const [itemLoading, setItemLoading] = useState(true); // item loading
    const [item, setItem] = useState<ItemRequest>(); // to store one item
    const [normalBorrows, setNormalBorrows] = useState<ItemRequest[]>([]);
    const [urgentBorrows, setUrgentBorrows] = useState<ItemRequest[]>([]);
    const [allRequests, setAllRequests] = useState<ItemRequest[]>([]);
    const [totalNormalBorrowsCount, setTotalNormalBorrowsCount] = useState(0);
    const [totalUrgentBorrowsCount, setUrgentBorrowsCount] = useState(0);
    // filters
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // filter
    const [requestor, setRequestor] = useState('');  // filter
    const [location, setLocation] = useState('');  // filter
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const [rejected, setRejected] = useState(false);
    const [approved, setApproved] = useState(false);
    const [requestStatusId, setRequestStatusId] = useState<number | null>(null);
    const requests = useRecoilValue(updateRequest);
    const [isMessageModalOpen, setMessageModalOpen] = useState(false); // Message modal
    const [message, setMessage] = useState("");
    const [currentItems, setCurrentItems] = useState(normalBorrows);
    const filters: Filter[] = [
        { label: 'Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'item.name' },
        { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange'},
        { label: 'Requestor', state: [requestor, setRequestor], inputType: 'text', optionsKey: 'borrower.firstName' },
        { label: 'Location', state: [location, setLocation], inputType: 'text', optionsKey: 'item.location.name' },
    ];
    const sortOptions: SortOptions[] = [
        { label: 'Name', optionsKey: 'item.name' },
        { label: 'Request Date', optionsKey: 'requestDate' },
        { label: 'Location', optionsKey: 'item.location.name' }
    ]; 

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
            getBorrows();
            if(selectedTab === "urgentBorrows"){
                getUrgentBorrows();
            }
            if(selectedTab === "requestedBorrows"){
                getAllRequests();
            }
        }
    }, [userId, requests, nameFilter, borrowDateFilter, requestor, location]);

    useEffect(() => {
        if(selectedTab === "urgentBorrows"){
            getUrgentBorrows();
        }
        if(selectedTab === "requestedBorrows"){
            getAllRequests();
        }
    }, [selectedTab]);

    useEffect(() => {
        switch (selectedTab) {
            case "normalBorrows":
                setCurrentItems(normalBorrows);
                break;
            case "urgentBorrows":
                setCurrentItems(urgentBorrows);
                break;
            case "requestedBorrows":
                setCurrentItems(allRequests);
                break;
            default:
                setCurrentItems([]);
        }
    }, [selectedTab, normalBorrows, urgentBorrows, allRequests]);

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
        if(selectedTab === "normalBorrows") { getBorrows(sortBy, sortDirection); }
        if(selectedTab === "urgentBorrows") { getUrgentBorrows(sortBy, sortDirection); }
        if(selectedTab === "requestedBorrows") { getAllRequests(sortBy, sortDirection); }
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

    async function getBorrows(sortBy = 'requestDate', sortDirection = 'desc') {
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const params: Record<string, string> = {
            name: nameFilter,
            location: location,
            requestor: requestor,
            sortBy: sortBy || 'requestDate',
            sortDirection: sortDirection || 'desc'
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
            const response = await fetch(`/api/supervisor/normalborrows?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.itemRequests || [];
            const itemCount = data.totalCount || 0;
            const itemCountUrgent = data.totalCountUrgent || 0;

            setNormalBorrows(fetchedItems);
            setTotalNormalBorrowsCount(itemCount);
            setUrgentBorrowsCount(itemCountUrgent);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getUrgentBorrows(sortBy = 'requestDate', sortDirection = 'desc') {
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const params: Record<string, string> = {
            name: nameFilter,
            location: location,
            requestor: requestor,
            sortBy: sortBy || 'requestDate',
            sortDirection: sortDirection || 'desc'
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
            const response = await fetch(`/api/supervisor/urgentborrows?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.itemRequests || [];

            setUrgentBorrows(fetchedItems);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getAllRequests(sortBy = 'decisionDate', sortDirection = 'desc') {
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const params: Record<string, string> = {
            name: nameFilter,
            location: location,
            requestor: requestor,
            sortBy: sortBy || 'decisionDate',
            sortDirection: sortDirection || 'desc'
            
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
            const response = await fetch(`/api/supervisor/itemrequest?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            setAllRequests(data);

        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setApproved(false);
        setRejected(false);
        setRequestStatusId(null);
        setMessage("");
    };

    const checkTab = () => {
        switch(selectedTab) {
            case "normalBorrows":
                return (
                    <ItemCard
                        active={active}
                        openModal={openModal}
                        items={normalBorrows}
                        itemLoading={itemLoading}
                        setRejected={setRejected}
                        setApproved={setApproved}
                        setRequestStatusId={setRequestStatusId}
                        selectedTab={selectedTab}
                    />
                );
            case "urgentBorrows":
                return (
                    <ItemCard
                        active={active}
                        openModal={openModal}
                        items={urgentBorrows}
                        itemLoading={itemLoading}
                        setRejected={setRejected}
                        setApproved={setApproved}
                        setRequestStatusId={setRequestStatusId}
                        selectedTab={selectedTab}
                    />
                );
            case "requestedBorrows":
                return (
                    <ItemCard
                        active={active}
                        openModal={openModal}
                        items={allRequests}
                        itemLoading={itemLoading}
                        setRejected={setRejected}
                        setApproved={setApproved}
                        setRequestStatusId={setRequestStatusId}
                        openMessageModal={setMessageModalOpen}
                        setMessage={setMessage}
                    />
                );
        }
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <MessageModal 
                open={isMessageModalOpen}
                onClose={() => setMessageModalOpen(false)}
                message={message}
            />
            <Modal 
                open={isModalOpen}
                onClose={closeModal}
                userId={userId}
                item={item}
                rejected={rejected}
                requestStatusId={requestStatusId}
                approved={approved}
                setApproved={setApproved}
                setRejected={setRejected}
                setRequestStatusId={setRequestStatusId}
            />
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    title="Requests"
                    icon={<ContentPasteOutlinedIcon fontSize="large" />}
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
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'normalBorrows' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('normalBorrows')}
                        >
                            Pending borrows
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-3 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'normalBorrows' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {totalNormalBorrowsCount}
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
                            {totalUrgentBorrowsCount}
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'requestedBorrows' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('requestedBorrows')}
                        >
                            Requested Borrows
                        </div>
                    </div>
                </div>
                {checkTab()}
            </div>
        </div>
    );
}