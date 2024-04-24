'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import Filters from "@/components/general/Filter";
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import { Filter } from "@/models/Filter";
import app from "@/services/firebase-config";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { Item } from "@/models/Item";
import { User } from "@/models/User";

export default function HistoryPage({ params } : {params: {type:string, id: string}}) {
    const type = params.type;
    const id = params.id;
    const { isAuthorized, loading } = useAuth(['Supervisor', 'Admin']);
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [userId, setUserId] = useState<string | null>(null); // userID
    const auth = getAuth(app); // Get authentication
    const [history, setHistory] = useState<User[] | Item[]>([]);
    const [title, setTitle] = useState(""); // Manage title as a state
    // filters
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // filter
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const filters: Filter[] = [
        { label: 'Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'name' },
        { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange'},
    ];
    const icon = type === 'user' ? <PeopleAltOutlinedIcon fontSize="large" /> : <ContentPasteOutlinedIcon fontSize="large" />;

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
        if ((type === "user" || type === "item") && userId){
            getHistory();
        }
    },[userId, type, id]);

    useEffect(() => {
        console.log(history);
    },[history])

    useEffect(() => {
        if (history.length > 0) {
            if (type === 'user') {
                const user = history[0] as User; // Cast the first element as User
                setTitle(`${user.firstName} ${user.lastName}`);
            } else if (type === 'item') {
                const item = history[0] as Item; // Cast the first element as Item
                setTitle(item.name);
            }
        }
    }, [history, type]);

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

    async function getHistory() {
        try {
            const response = await fetch(`/api/supervisor/historypage/${type}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            
            setHistory(Array.isArray(data) ? data : [data]);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    };
    
    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    if (type !== "user" && type !== "item") { return; }

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
                    items={history}
                    filters={filters}
                    sortOptions={['Name', 'Borrow date']}
                    isCardView={true}
                />
            </div>
            <h1>History for {type} id of {id}</h1>
        </div>
    );
}