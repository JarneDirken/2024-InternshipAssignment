'use client';
import useAuth from "@/hooks/useAuth";
import { Filter } from "@/models/Filter";
import app from "@/services/firebase-config";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import Unauthorized from "../../(error)/unauthorized/page";
import Loading from "@/components/states/Loading";
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import Filters from "@/components/general/Filter";
import { Repair } from "@/models/Repair";
import ItemCard from "@/components/(supervisor)/repair/ItemCard";

export default function Reparation() {
    const { isAuthorized, loading } = useAuth(['Supervisor', 'Admin']);
    const [selectedTab, setSelectedTab] = useState('repair'); // standard open tab
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [userId, setUserId] = useState<string | null>(null); // userID
    const auth = getAuth(app); // Get authentication
    // Items
    const [itemLoading, setItemLoading] = useState(true); // item loading
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [history, setHistory] = useState<Repair[]>([]);
    const [repairCount, setRepairCount] = useState(0);
    const [currentItems, setCurrentItems] = useState(repairs);
    // filters
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // filter
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const filters: Filter[] = [
        { label: 'Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'item.name' },
        { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange'},
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
            getRepairs();
            if(selectedTab === "history"){
                getHistory();
            }
        }
    }, [userId, nameFilter, borrowDateFilter]);

    useEffect(() => {
        if(selectedTab === "history"){
            getHistory();
        }
    }, [selectedTab]);

    useEffect(() => {
        switch (selectedTab) {
            case "repair":
                setCurrentItems(repairs);
                break;
            case "history":
                setCurrentItems(history);
                break;
            default:
                setCurrentItems([]);
        }
    }, [selectedTab, repairs, history]);

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'name':
                setNameFilter(value);
                break;
            case 'Borrow date':
                setBorrowDateFilter(value);
                break;
            default:
                break;
        }
    };

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        // Implement sorting logic here
        console.log(`Sorting by ${sortBy} in ${sortDirection} order`);
    };

    const parseDateFilter = (dateFilter: string) => {
        const dates = dateFilter.split(" - ");
        const borrowDate = dates[0];
        const returnDate = dates.length > 1 ? dates[1] : new Date().toLocaleDateString('en-US');
    
        return { borrowDate, returnDate };
    };

    const openModal = (item: Repair) => {
        // setRepair(item);
        setModalOpen(true);
    };

    async function getRepairs() {
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const params: Record<string, string> = {
            name: nameFilter,
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
            const response = await fetch(`/api/supervisor/repairs?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.repairs || [];
            const itemCount = data.totalCount || 0;

            setRepairs(fetchedItems);
            setRepairCount(itemCount);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getHistory() {

    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    title="Repairs"
                    icon={<HandymanOutlinedIcon fontSize="large" />}
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    items={currentItems}
                    filters={filters}
                    sortOptions={['Name', 'Borrow date']}
                    isCardView={true}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'repair' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('repair')}
                        >
                            In repair
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-3 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'repair' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {repairCount}
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
                {selectedTab === "repair" && (
                    <ItemCard 
                        active={active}
                        openModal={openModal}
                        items={repairs}
                        itemLoading={itemLoading}
                        selectedTab={selectedTab}
                    />
                )}
                {selectedTab === "history" && (
                    <div>History</div>
                )}
            </div>
        </div>
    );
}