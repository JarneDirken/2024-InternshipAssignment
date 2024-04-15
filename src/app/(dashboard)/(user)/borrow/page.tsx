'use client';
import Unauthorized from "@/app/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Item } from "@/models/Item";
import { getAuth, getIdToken } from 'firebase/auth';
import app from "@/services/firebase-config";
import { useRecoilValue } from "recoil";
import { createRequest, requestsState } from "@/services/store";
import Filters from "@/components/(user)/borrow/Filter"
import BorrowCard from "@/components/(user)/borrow/BorrowCard";
import PendingBorrows from "@/components/(user)/borrow/PendingBorrows";
import Modal from "@/components/(user)/borrow/Modal";

export default function Borrow() {
    const isAuthorized = useAuth(['Student', 'Teacher', 'Supervisor', 'Admin']); // you need at least role student to view this page
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [items, setItems] = useState<Item[]>([]);
    const [item, setItem] = useState<Item>(); // to store one item
    const requests = useRecoilValue(requestsState);
    const [loading, setLoading] = useState(true);
    const [totalRequestCount, setTotalRequestCount] = useState(0);
    const [totalItemCount, setTotalItemCount] = useState(0);
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [modelFilter, setModelFilter] = useState(''); // model filter
    const [brandFilter, setBrandFilter] = useState(''); // brand filter
    const [locationFilter, setLocationFilter] = useState(''); // location filter
    const [selectedTab, setSelectedTab] = useState('products');
    const [isModalOpen, setModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const auth = getAuth(app);
    const created = useRecoilValue(createRequest);

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

    async function getPendingBorrowCount() {
        try {
            if (!userId) { return; }
            const queryString = new URLSearchParams({
                userId: userId
            }).toString();
            const response = await fetch(`/api/user/itemrequest?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setTotalRequestCount(data.totalCount);
        } catch (error) {
            console.error("Failed to fetch item requests:", error);
        }
    }

    async function getItemData(id: number) {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await getIdToken(user);
                const response = await fetch(`/api/user/items/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setItem(data);
            } catch (error) {
                console.error("Failed to fetch item:", error);
            }
        }
    }

    async function getAllItems(){
        setLoading(true);
        try {
            if(userId){
                const queryString = new URLSearchParams({
                    userId: userId,
                }).toString();
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
        } finally {
            setLoading(false);
        }
    }

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

    const openModal = (id: number) => {
        getItemData(id);
        setModalOpen(true);
    }

    useEffect(() => {
        getAllItems();
    }, [userId]);

    useEffect(() => {
        setTotalItemCount(items.length);
    },[items]);

    useEffect(()=> {
        setTotalRequestCount(requests.length);
    }, [requests]);

    useEffect(() => {
        if (userId) {
            getPendingBorrowCount();
        }
    }, [userId, created]);

    useEffect(() => {
        getPendingBorrowCount();
        setTotalRequestCount(requests.length);
    },[created])

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <Modal
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                item={item}
                userId={userId}
            />
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    items={items}
                    openModal={openModal}
                    userId={userId}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'products' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('products')}
                        >
                            Products
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-11 transform translate-x-1/2 -translate-y-1/2 text-sm ${selectedTab === 'products' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {totalItemCount}
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'pending' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('pending')}
                        >
                            Pending borrows
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-3 transform translate-x-1/2 -translate-y-1/2 text-sm ${selectedTab === 'pending' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
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
                    />
                ) : (
                    <PendingBorrows 
                        active={active}
                        nameFilter={nameFilter}
                        modelFilter={modelFilter}
                        brandFilter={brandFilter}
                        locationFilter={locationFilter}
                        userId={userId || ''}
                    />
                )}
            </div>
        </div>
    );
}