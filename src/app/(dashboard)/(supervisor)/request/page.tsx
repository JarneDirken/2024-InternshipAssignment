'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import app from "@/services/firebase-config";
import { ItemRequest } from "@/models/ItemRequest";
import Filters from "@/components/(user)/history/Filter";
import ItemCard from "@/components/(supervisor)/requests/ItemCard";
import Loading from "@/components/states/Loading";
import Modal from "@/components/(supervisor)/requests/Modal";
import { useRecoilValue } from "recoil";
import { updateRequest } from "@/services/store";
import MessageModal from "@/components/(user)/borrow/MessageModal";

export default function History() {
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
    const [allRequestsCount, setAllRequestsCount] = useState(0);
    // filters
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // model filter
    const [returnDateFilter, setReturnDateFilter] = useState(''); // brand filter
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const [rejected, setRejected] = useState(false);
    const [approved, setApproved] = useState(false);
    const [requestStatusId, setRequestStatusId] = useState<number | null>(null);
    const requests = useRecoilValue(updateRequest);
    const [isMessageModalOpen, setMessageModalOpen] = useState(false); // Message modal
    const [message, setMessage] = useState("");

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
        }
    }, [userId, requests]);

    useEffect(() => {
        if(selectedTab === "urgentBorrows"){
            getUrgentBorrows();
        }
        if(selectedTab === "requestedBorrows"){
            getAllRequests();
        }
    }, [selectedTab]);

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

    const openModal = (itemRequest: ItemRequest) => {
        setItem(itemRequest);
        setModalOpen(true);
    };

    async function getBorrows() {
        setItemLoading(true);
        const params: Record<string, string> = {
            name: nameFilter,
        };
    
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
            const itemCountAll = data.totalCountAll || 0;

            setNormalBorrows(fetchedItems);
            setTotalNormalBorrowsCount(itemCount);
            setUrgentBorrowsCount(itemCountUrgent);
            setAllRequestsCount(itemCountAll);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getUrgentBorrows() {
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

    async function getAllRequests() {
        setItemLoading(true);
        const params: Record<string, string> = {
            name: nameFilter,
        };
    
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
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    items={normalBorrows}
                    totalItemCount={totalNormalBorrowsCount}
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
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-0 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'requestedBorrows' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {allRequestsCount}
                        </div>
                    </div>
                </div>
                {checkTab()}
            </div>
        </div>
    );
}