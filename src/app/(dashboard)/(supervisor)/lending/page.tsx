'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getAuth } from 'firebase/auth';
import app from "@/services/firebase-config";
import { ItemRequest } from "@/models/ItemRequest";
import Filters from "@/components/(user)/history/Filter";
import ItemCard from "@/components/(supervisor)/lendings/ItemCard";
import Loading from "@/components/states/Loading";
import Modal from "@/components/(supervisor)/lendings/Modal";
import { useRecoilValue } from "recoil";
import { updateRequest } from "@/services/store";

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
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // model filter
    const [returnDateFilter, setReturnDateFilter] = useState(''); // brand filter
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const requests = useRecoilValue(updateRequest);
    const [handover, setHandover] = useState(false);
    const [receive, setReceive] = useState(false);

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
            if(selectedTab === "returns"){
                getReturns();
            }
            if(selectedTab === "checkitem"){
                getCheckItem();
            }
        }
    }, [userId, requests]);

    useEffect(() => {
        if(selectedTab === "returns"){
            getReturns();
        }
        if(selectedTab === "checkitem"){
            getCheckItem();
        }
        if(selectedTab === "history"){
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
            const response = await fetch(`/api/supervisor/pendingborrows?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.itemRequests || [];
            const itemCount = data.totalCount || 0;
            const itemCountReturn = data.totalCountReturns || 0;
            const itemCountCheckItem = data.totalCountCheckItem || 0;

            setBorrows(fetchedItems);
            setTotalBorrowsCount(itemCount);
            setTotalReturnCount(itemCountReturn);
            setTotalCheckItemCount(itemCountCheckItem);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getReturns() {
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
            const response = await fetch(`/api/supervisor/pendingreturns?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            setReturns(data);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getCheckItem(){
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
            const response = await fetch(`/api/supervisor/checkitem?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            setCheckItem(data);
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
        setHandover(false);
        setReceive(false);
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
            />
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    items={borrows}
                    totalItemCount={totalBorrowsCount}
                    userId={userId}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'borrows' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
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
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'returns' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
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
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'checkitem' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
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
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'history' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
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