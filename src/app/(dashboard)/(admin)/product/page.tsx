'use client';
import { useEffect, useState } from "react";
import Filters from "@/components/general/Filter";
import { Item } from "@/models/Item";
import { getAuth, getIdToken } from 'firebase/auth';
import {app} from "@/services/firebase-config";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Button from "@/components/states/Button";
import Checkbox from '@mui/material/Checkbox';
import ProductCard from "@/components/(admin)/products/ProductCard";
import Modal from "@/components/(admin)/products/Modal";
import { SortOptions } from "@/models/SortOptions";
import { Filter } from "@/models/Filter";

export default function Product() {
    const [active, setActive] = useState(true);
    const [items, setItems] = useState<Item[]>([]);
    const [itemLoading, setItemLoading] = useState(true);
    const [item, setItem] = useState<Item>();
    const [name, setName] = useState<string>('');
    const [model, setModel] = useState<string>('');
    const [brand, setBrand] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [year, setYear] = useState<string>('');
    const [availability, setAvailability] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<Item[]>([]);

    const filters: Filter[] = [
        { label: 'Name', state: [name, setName], inputType: 'text', optionsKey: 'name'},
        { label: 'Model', state: [model, setModel], inputType: 'text', optionsKey: 'model'},
        { label: 'Brand', state: [brand, setBrand], inputType: 'text', optionsKey: 'brand'},
        { label: 'Location', state: [location, setLocation], inputType: 'text', optionsKey: 'location.name'},
        { label: 'Year', state: [year, setYear], inputType: 'text', optionsKey: 'yearBought'},
        { label: 'Availability', state: [availability, setAvailability], inputType: 'multipleSelect', options: ['Active', 'Inactive']},
    ];

    const [isModalOpen, setModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const auth = getAuth(app);
    const [mode, setMode] = useState<'add' | 'edit' | 'delete'>('add');

    const sortOptions: SortOptions[] = [
        { label: 'Name', optionsKey: 'item.name' },
        { label: 'Model', optionsKey: 'item.model' },
        { label: 'Brand', optionsKey: 'item.brand' },
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
            getAllItems();
        }
    }, [userId]);

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
            case 'availability':
                setAvailability(value);
                break;
            default:
                break;
        }
    };

    async function getAllItems() {
        const params: Record<string, string> = {
            name: name,
        };
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        };
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/admin/products?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            setItems(Array.isArray(data) ? data : []);

        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        // Implement sorting logic here
        console.log(`Sorting by ${sortBy} in ${sortDirection} order`);
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === items.length) {
            setSelectedItems([]); // Deselect all if all are selected
        } else {
            const newSelectedItems = new Set(items.map(item => item.id));
            setSelectedItems([...items]); // Select all
        }
    };

    const handleSelectItem = (id: number) => {
        const selectedIndex = selectedItems.findIndex(item => item.id === id);
        let newSelectedItems = [...selectedItems];
    
        if (selectedIndex === -1) {
            // Check if the item exists before adding it
            const itemToAdd = items.find(item => item.id === id);
            if (itemToAdd) {
                newSelectedItems.push(itemToAdd);
            } else {
                console.error('Item not found');
            }
        } else {
            newSelectedItems.splice(selectedIndex, 1);
        }
    
        setSelectedItems(newSelectedItems);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const openModal = (mode: 'add' | 'edit' | 'delete', item?: Item) => {
        if (item) {
            setSelectedItems([item]);
        }
        setMode(mode);
        setModalOpen(true);
    };

    const openModalProduct = (item: Item) => {
        setItem(item);
        setModalOpen(true);
    };

    return ( 
        <div>
            <Modal 
                open={isModalOpen}
                onClose={closeModal}
                selectedItems={selectedItems}
                mode={mode}
            />
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
                    sortOptions={sortOptions}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex flex-wrap justify-center md:justify-start bg-white gap-1 sm:gap-2 lg:gap-4 rounded-tl-xl rounded-tr-xl z-0 p-4">
                    <div onClick={() => openModal('add')}>
                        <Button 
                            icon={<AddIcon />} 
                            textColor="custom-primary" 
                            borderColor="custom-primary" 
                            fillColor="orange-100" 
                            paddingX="px-2.5"
                            paddingY="py-0.5"
                            textClassName="font-semibold" 
                            text="Add"
                        />
                    </div>
                    <div onClick={() => openModal('delete')}>
                        <Button 
                            icon={<DeleteOutlinedIcon />} 
                            textColor="custom-red"
                            borderColor="custom-red" 
                            fillColor="red-100" 
                            paddingX="px-2.5"
                            paddingY="py-0.5"
                            buttonClassName="bg-red-100"
                            textClassName="font-semibold" 
                            text="Delete" 
                            disabled={selectedItems.length === 0}
                        />
                    </div>
                    <Button 
                        icon={<QrCode2RoundedIcon />} 
                        textColor="custom-dark-blue" 
                        borderColor="custom-dark-blue" 
                        fillColor="blue-100" 
                        paddingX="px-2.5"
                        paddingY="py-0.5"
                        buttonClassName="bg-blue-100 border-custom-dark-blue" 
                        textClassName="font-semibold text-custom-dark-blue" 
                        text="QR-Code" 
                        disabled={selectedItems.length === 0}
                    />
                    <Button 
                        icon={<InsertDriveFileOutlinedIcon />} 
                        textColor="custom-dark-blue" 
                        borderColor="custom-dark-blue" 
                        fillColor="blue-100" 
                        paddingX="px-2.5"
                        paddingY="py-0.5"
                        textClassName="font-semibold" 
                        text="Export EXCEL" 
                        disabled={selectedItems.length === 0}
                    />
                    <Button 
                        icon={<InsertDriveFileOutlinedIcon />} 
                        textColor="custom-dark-blue" 
                        borderColor="custom-dark-blue" 
                        fillColor="blue-100" 
                        paddingX="px-2.5"
                        paddingY="py-0.5"
                        textClassName="font-semibold" 
                        text="Import EXCEL" 
                        disabled={selectedItems.length === 0}
                    />
                </div>
                <div className="w-full border-b border-b-gray-300 bg-white flex items-center relative lg:hidden">
                    <Checkbox 
                        className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                        checked={selectedItems.length === items.length && items.length > 0}
                        onChange={toggleSelectAll}
                    />
                    <p className="text-custom-primary font-semibold px-16 py-2 border-b-2 border-b-custom-primary w-fit">PRODUCTS</p>
                </div>
                <div className="bg-white w-full rounded-b-xl overflow-y-auto lg:hidden" style={{ height: '50vh' }}>
                    <ProductCard items={items} openModal={openModalProduct} itemLoading={itemLoading} selectedItems={selectedItems} onSelectItem={handleSelectItem} />
                </div>
                <div className="hidden lg:block">
                    <div className="w-full bg-gray-100 hidden lg:grid grid-cols-12">
                        <div className="col-span-1 mx-auto">
                            <Checkbox 
                                checked={selectedItems.length === items.length && items.length > 0}
                                onChange={toggleSelectAll}
                            />
                        </div>
                        <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 truncate">IMAGE</span>
                        <span className="text-gray-500 border-r-4 border-white font-semibold col-span-2 py-2 pl-2 truncate">NO.</span>
                        <span className="text-gray-500 border-r-4 border-white font-semibold col-span-2 py-2 pl-2 truncate">NAME</span>
                        <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">MODEL</span>
                        <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">BRAND</span>
                        <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 xl:col-span-2 py-2 pl-2 truncate">LOCATION</span>
                        <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">YEAR</span>
                        <span className="text-gray-500 font-semibold col-span-2 xl:col-span-1 py-2 pl-2 truncate">ACTION</span>
                    </div>
                    <div className="bg-white w-full rounded-b-xl overflow-y-auto" style={{ height: '50vh' }}>
                        <ProductCard items={items} openModal={openModalProduct} itemLoading={itemLoading} selectedItems={selectedItems} onSelectItem={handleSelectItem} />
                    </div>
                </div>
            </div>
        </div>
    );
}