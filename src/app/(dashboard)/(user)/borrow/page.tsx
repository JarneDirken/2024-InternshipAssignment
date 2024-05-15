'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { GroupedItem, Item } from "@/models/Item";
import {app} from "@/services/firebase-config";
import { useRecoilValue } from "recoil";
import { createRequest, requestsState } from "@/services/store";
import Filters from "@/components/(user)/borrow/Filter"
import BorrowCard from "@/components/(user)/borrow/BorrowCard";
import PendingBorrows from "@/components/(user)/borrow/PendingBorrows";
import Modal from "@/components/(user)/borrow/Modal";
import useCart from "@/hooks/useCart";
import { useSnackbar } from "notistack";
import Loading from "@/components/states/Loading";
import MessageModal from "@/components/(user)/borrow/MessageModal";
import useUser from "@/hooks/useUser";

export default function Borrow() {
    const { isAuthorized, loading } = useAuth(['Student', 'Teacher', 'Supervisor', 'Admin']);
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [items, setItems] = useState<Item[]>([]);
    const [item, setItem] = useState<Item>(); // to store one item
    const requests = useRecoilValue(requestsState);
    const [totalRequestCount, setTotalRequestCount] = useState(0);
    const [totalItemCount, setTotalItemCount] = useState(0);
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [modelFilter, setModelFilter] = useState(''); // model filter
    const [brandFilter, setBrandFilter] = useState(''); // brand filter
    const [locationFilter, setLocationFilter] = useState(''); // location filter
    const [selectedTab, setSelectedTab] = useState('products'); // standard open tab
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const [isMessageModalOpen, setMessageModalOpen] = useState(false); // Message modal
    const [message, setMessage] = useState("");
    const created = useRecoilValue(createRequest); // see if an item has been borrowed (for refresh)
    const { cart } = useCart(); // useCart hook
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const [canceled, setCanceled] = useState(false);

    const { userId, token } = useUser();

    async function getPendingBorrowCount() {
        try {
            if (!userId) { return; }
            const params: Record<string, string> = {};

            if (userId !== null) {
                params.userId = userId;
            };
    
            if (token !== null) {
                params.token = token;
            };

            const queryString = new URLSearchParams(params).toString();

            const response = await fetch(`/api/user/itemrequest?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setTotalRequestCount(data.totalCount);
        } catch (error) {
            console.error("Failed to fetch item requests:", error);
        } 
    };

    async function getAllItems(){
        try {
            if(userId){
                const params: Record<string, string> = {};
                if (userId !== null) {
                    params.userId = userId;
                };
        
                if (token !== null) {
                    params.token = token;
                };

                const queryString = new URLSearchParams(params).toString();
                const response = await fetch(`/api/user/allitems?${queryString}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setItems(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
            setItems([]); // Ensure items is always an array
        } 
    };

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'name':
                setNameFilter(value);
                break;
            case 'model':
                setModelFilter(value);
                break;
            case 'brand':
                setBrandFilter(value);
                break;
            case 'location':
                setLocationFilter(value);
                break;
            default:
                break;
        }
    };

    const openModal = (groupedItem: GroupedItem) => {
        // Find the first available item that is not in the cart
        const availableItem = groupedItem.items.find(item => !cart.some(cartItem => cartItem.item.id === item.id));
        
        if (availableItem) {
            // Set the item for the modal to open
            setItem(availableItem);
            setModalOpen(true);
        } else {
            enqueueSnackbar('All items of this type are currently in your cart.', { variant: 'error' });
        }
    };

    useEffect(() => {
        if (token) {
            getAllItems();
        }
    }, [userId, token]);

    useEffect(() => {
        setTotalItemCount(items.length);
    },[items]);

    useEffect(() => {
        if (userId && token) {
            getPendingBorrowCount();
        }
    }, [userId, created, canceled, token]);

    useEffect(() => {
        getPendingBorrowCount();
        setTotalRequestCount(requests.length);
    },[created]);

    if (loading || isAuthorized === null) { return <Loading/>; };

    if (!isAuthorized) { return <Unauthorized />; };

    return (
        <div>
            <MessageModal 
                open={isMessageModalOpen}
                onClose={() => setMessageModalOpen(false)}
                message={message}
            />
            <Modal
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                item={item}
                userId={userId}
                token={token}
            />
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    items={items}
                    userId={userId}
                    token={token}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer hover:text-custom-primary ${selectedTab === 'products' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('products')}
                        >
                            Products
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-11 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'products' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {totalItemCount}
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer hover:text-custom-primary ${selectedTab === 'pending' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('pending')}
                        >
                            Pending borrows
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-3 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'pending' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {totalRequestCount}
                        </div>
                    </div>
                </div>
                {selectedTab === "products" ? (
                    <BorrowCard
                        active={active}
                        openModal={openModal}
                        nameFilter={nameFilter}
                        modelFilter={modelFilter}
                        brandFilter={brandFilter}
                        locationFilter={locationFilter}
                        userId={userId || ''}
                        token={token}
                    />
                ) : (
                    <PendingBorrows 
                        active={active}
                        nameFilter={nameFilter}
                        modelFilter={modelFilter}
                        brandFilter={brandFilter}
                        locationFilter={locationFilter}
                        userId={userId || ''}
                        openMessageModal={setMessageModalOpen}
                        setMessage={setMessage}
                        setCanceled={setCanceled}
                        canceled={canceled}
                        token={token}
                    />
                )}
            </div>
        </div>
    );
}