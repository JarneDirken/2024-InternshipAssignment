'use client';
import { useState } from "react";
import Filters from "@/components/general/Filter";
import { Item } from "@/models/Item";
import { getAuth, getIdToken } from 'firebase/auth';
import app from "@/services/firebase-config";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

interface Filter {
    label: string;
    state: [string, React.Dispatch<React.SetStateAction<string>>];
    inputType: 'text' | 'dateRange' | 'multipleSelect';
    options?: string[];
}

export default function Product() {
    const [active, setActive] = useState(true);
    const [items, setItems] = useState<Item[]>([]);
    const [item, setItem] = useState<Item>(); // to store one item
    const [name, setName] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [brand, setBrand] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [availability, setAvailability] = useState<string>('');

    const filters: Filter[] = [
        { label: 'Name', state: [name, setName], inputType: 'text'},
        { label: 'Model', state: [model, setModel], inputType: 'text' },
        { label: 'Brand', state: [brand, setBrand], inputType: 'text' },
        { label: 'Location', state: [location, setLocation], inputType: 'text' },
        { label: 'Year', state: [year, setYear], inputType: 'text' },
        { label: 'Availability', state: [availability, setAvailability], inputType: 'multipleSelect', options: ['Active', 'Inactive']},
        { label: 'Borrow Date', state: [availability, setAvailability], inputType: 'dateRange'}
    ];

    const [isModalOpen, setModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

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

    const openModal = (id: number) => {
        getItemData(id);
        setModalOpen(true);
    }

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'name':
                setName(value);
                break;
            case 'model':
                setModel(value);
                break;
            case 'brand':
                setBrand(value);
                break;
            case 'location':
                setLocation(value);
                break;
            case 'year':
                setYear(value);
                break;
            case 'year':
                setYear(value);
                break;
            default:
                break;
        }
    };

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        // Implement sorting logic here
        console.log(`Sorting by ${sortBy} in ${sortDirection} order`);
    };

    return ( 
        <div>
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    active={active}
                    setActive={setActive}
                    title="Products"
                    icon={<Inventory2OutlinedIcon fontSize="large" />}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    filters={filters}
                    items={items}
                    openModal={openModal}
                    sortOptions={['Name', 'Model', 'Brand', 'Location']}
                />
            </div>
        </div>
    );
}