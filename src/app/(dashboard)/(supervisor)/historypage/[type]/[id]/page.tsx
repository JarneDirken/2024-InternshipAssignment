'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import Filters from "@/components/general/Filter";
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import { Filter } from "@/models/Filter";
import {app} from "@/services/firebase-config";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { Item } from "@/models/Item";
import { User } from "@/models/User";
import ItemCard from "@/components/(supervisor)/historypage/ItemCard";
import { ItemRequest } from "@/models/ItemRequest";
import { SortOptions } from "@/models/SortOptions";
import Button from "@/components/states/Button";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

export default function HistoryPage({ params } : {params: {type:string, id: string}}) {
    const type = params.type;
    const id = params.id;
    const { isAuthorized, loading } = useAuth(['Supervisor', 'Admin']);
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [userId, setUserId] = useState<string | null>(null); // userID
    const auth = getAuth(app); // Get authentication
    const [history, setHistory] = useState<User[] | Item[]>([]);
    const [title, setTitle] = useState(""); // Manage title as a state
    const [dataFound, setDataFound] = useState(true); // Initially true, set to false if no data
    const [itemLoading, setItemLoading] = useState(true); // item loading
    // filters
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // filter
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const [filters, setFilters] = useState<Filter[]>([]);
    const [filteredItems, setFilteredItems] = useState<User[] | Item[] | ItemRequest[]>([]);  // Use a more specific type if possible
    const icon = type === 'user' ? <PeopleAltOutlinedIcon fontSize="large" /> : <ContentPasteOutlinedIcon fontSize="large" />;
    const sortOptions: SortOptions[] = [
        { label: 'Name', optionsKey: 'item.name' },
        { label: 'End Borrow Date', optionsKey: 'returnDate' },
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
        if (((type === "user" || type === "item") && userId)){
            getHistory();
        }
    },[userId, type, id, nameFilter]);

    useEffect(() => {
        if (type === "user" || type === "item") {
            if (history.length > 0) {
                if (type === 'user') {
                    const user = history[0] as User;
                    setTitle(toTitleCase(`${user.firstName} ${user.lastName}`));
                    const allUserRequests = history.flatMap((entity: User | Item) =>
                        'ItemRequestsBorrower' in entity ? entity.ItemRequestsBorrower || [] : []
                    );
                    setFilteredItems(allUserRequests);
                } else if (type === 'item') {
                    const item = history[0] as Item;
                    setTitle(toTitleCase(item.name));
                    const allItemRequests = history.flatMap((entity: User | Item) =>
                        'ItemRequests' in entity ? entity.ItemRequests || [] : []
                    );
                    setFilteredItems(allItemRequests);
                }
            }
        }
    }, [history, type]);

    useEffect(() => {
        if (type === 'user') {
            const userFilters: Filter[] = [
                { label: 'Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'item.name' },
                { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange' },
            ];
            setFilters(userFilters);
        } else if (type === 'item') {
            const itemFilters: Filter[] = [
                { label: 'Item Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'name' },
                { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange' },
            ];
            setFilters(itemFilters);
        }
    }, [type]);
    
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

    function toTitleCase(str: string) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    async function getHistory() {
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
            const response = await fetch(`/api/supervisor/historypage/${type}/${id}?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            
            if (Array.isArray(data) && data.length === 0 || !Array.isArray(data) && !Object.keys(data).length) {
                setDataFound(false);
            } else {
                setHistory(Array.isArray(data) ? data : [data]);
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
            setDataFound(false);
        } finally {
            setItemLoading(false);
        }
    };
    
    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    if (type !== "user" && type !== "item") { return; }

    if (!dataFound) {
        return <div className="bg-white p-4 rounded-xl shadow-md text-center text-lg">
            {`No ${type} found with ID ${id}`}
        </div>;
    }

    return (
        <div>
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    title={`History of ${title}`}
                    icon={icon}
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    items={filteredItems}
                    filters={filters}
                    sortOptions={sortOptions}
                    isCardView={true}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className='w-48 flex justify-center py-3 uppercase border-b-4 border-b-custom-primary text-custom-primary font-semibold'
                        >
                            {type==="user" ? (<span>Requested borrows</span>) : (<span>History</span>)}
                        </div>
                    </div>
                    <div className="flex items-center ml-2">
                        <Button 
                            icon={<InsertDriveFileOutlinedIcon />} 
                            textColor="custom-dark-blue" 
                            borderColor="custom-dark-blue" 
                            fillColor="blue-100" 
                            paddingX="px-2.5"
                            paddingY="py-0.5"
                            textClassName="font-semibold" 
                            text="Export EXCEL" 
                        />
                    </div>
                </div>
                <div>
                    <ItemCard
                        active={active}
                        items={history}
                        itemLoading={itemLoading}
                        type={type}
                    />
                </div>
            </div>
        </div>
    );
}