'use client';
import { useEffect, useState } from "react";
import Filters from "@/components/general/Filter";
import { Location } from "@/models/Location";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { getAuth, getIdToken } from 'firebase/auth';
import {app} from "@/services/firebase-config";
import Button from "@/components/states/Button";
import Checkbox from '@mui/material/Checkbox';
import LocationCard from "@/components/(admin)/locations/LocationCard";
import Modal from "@/components/(admin)/locations/Modal";
import { SortOptions } from "@/models/SortOptions";
import { Filter } from "@/models/Filter";
import { useMemo } from 'react';

import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';


export default function Locations() {
    const theme = createTheme({
        components: {
            MuiCheckbox: {
                styleOverrides: {
                    root: {
                        '&.Mui-checked': {
                            color: '#FFA500', // Checkbox color when checked
                        },
                        '&.MuiCheckbox-indeterminate': {
                            color: '#FFA500', // Checkbox color in indeterminate state
                        },
                        '&:hover': {
                            backgroundColor: 'rgba(255, 165, 0, 0.04)', // Light orange background on hover
                        },
                    },
                },
            },
        },
    });

    const [active, setActive] = useState(true);
    const [locations, setLocations] = useState<Location[]>([]);

    const [itemLoading, setItemLoading] = useState(false);
    const [name, setName] = useState<string>('');
    const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);

    const filters: Filter[] = [
        { label: 'Name', state: [name, setName], inputType: 'text', optionsKey: 'name'},
    ];

    const [isModalOpen, setModalOpen] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const auth = getAuth(app);
    const [mode, setMode] = useState<'add' | 'edit' | 'delete'>('add');

    const sortOptions: SortOptions[] = [
        { label: 'Id', optionsKey: 'id'},
        { label: 'Name', optionsKey: 'name' },
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
            getAllLocations();
        }
    }, [userId, name]);

    const handleFilterChange = (filterType: string, value: string | string[]) => {
        switch (filterType) {
            case 'name':
                setName(value as string);
                break;
            default:
                break;
        }
    };

    const uniqueNames = useMemo(() => {
        const namesSet = new Set(locations.map(location => location.name));
        return Array.from(namesSet);
    }, [locations]);

    async function getAllLocations(sortBy = 'id', sortDirection = 'desc') {
        setItemLoading(true);
        const params: Record<string, string> = {
            name: name,
            sortBy: sortBy || 'id',
            sortDirection: sortDirection || 'desc',
        };
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        };
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/admin/locations?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            setLocations(data || []);

        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        // Implement sorting logic here
        getAllLocations(sortBy, sortDirection);
    };

    const toggleSelectAll = () => {
        if (selectedLocations.length === locations.length) {
            setSelectedLocations([]); // Deselect all if all are selected
        } else {
            const newSelectedItems = new Set(locations.map(location => location.id));
            setSelectedLocations([...locations]); // Select all
        }
    };

    const handleSelectLocation= (id: number) => {
        const selectedIndex = selectedLocations.findIndex(location => location.id === id);
        let newSelectedLocations = [...selectedLocations];
    
        if (selectedIndex === -1) {
            // Check if the item exists before adding it
            const locationToAdd = locations.find(location => location.id === id);
            if (locationToAdd) {
                newSelectedLocations.push(locationToAdd);
            } else {
                console.error('Item not found');
            }
        } else {
            newSelectedLocations.splice(selectedIndex, 1);
        }
    
        setSelectedLocations(newSelectedLocations);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const openModal = (mode: 'add' | 'edit' | 'delete', location?: Location) => {
        if (location) {
            setSelectedLocations([location]);
        }
        setMode(mode);
        setModalOpen(true);
    };

    return ( 
        <div>
            <ThemeProvider theme={theme}>
                <Modal 
                    open={isModalOpen}
                    onClose={closeModal}
                    onItemsUpdated={getAllLocations}
                    selectedItems={selectedLocations}
                    mode={mode}
                    userId={userId}
                    existingNames={uniqueNames}
                />
                <div className="bg-white mb-4 rounded-xl">
                    <Filters
                        active={active}
                        setActive={setActive}
                        title="Locations"
                        icon={<LocationOnOutlinedIcon fontSize="large" />}
                        onFilterChange={handleFilterChange}
                        onSortChange={handleSortChange}
                        filters={filters}
                        items={locations}
                        sortOptions={sortOptions}
                    />
                </div>
                <div className="rounded-xl">
                    <div className="flex flex-wrap justify-center md:justify-start bg-white gap-1 sm:gap-2 lg:gap-4 rounded-tl-xl rounded-tr-xl z-0 p-4">
                        <div onClick={() => {
                            openModal('add');
                            setSelectedLocations([]);
                        }}>
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
                                fillColor={selectedLocations.length === 0 ? "gray-200" : "red-100"}
                                paddingX="px-2.5"
                                paddingY="py-0.5"
                                textClassName="font-semibold" 
                                text="Delete" 
                                disabled={selectedLocations.length === 0}
                            />
                        </div>
                        <Button 
                            icon={<InsertDriveFileOutlinedIcon />} 
                            textColor="custom-dark-blue" 
                            borderColor="custom-dark-blue" 
                            fillColor="blue-100" 
                            paddingX="px-2.5"
                            paddingY="py-0.5"
                            textClassName="font-semibold" 
                            text="Export EXCEL" 
                            disabled={selectedLocations.length === 0}
                        />
                    </div>
                    <div className="w-full border-b border-b-gray-300 bg-white flex items-center relative md:hidden">
                        <Checkbox 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                            checked={selectedLocations.length === locations.length && locations.length > 0}
                            onChange={toggleSelectAll}
                        />
                        <p className="text-custom-primary font-semibold px-16 py-2 border-b-2 border-b-custom-primary w-fit">LOCATIONS</p>
                    </div>
                    <div className="bg-white w-full rounded-b-xl overflow-y-auto md:hidden" style={{ height: '50vh' }}>
                        <LocationCard items={locations} openModal={openModal} itemLoading={itemLoading} selectedItems={selectedLocations} onSelectItem={handleSelectLocation} />
                    </div>
                    <div className="hidden md:block">
                        <div className="w-full bg-gray-100 hidden md:grid grid-cols-12">
                            <div className="col-span-1 mx-auto">
                                <Checkbox 
                                    checked={selectedLocations.length === locations.length && locations.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </div>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-9 lg:col-span-10 py-2 pl-2 truncate">NAME</span>
                            <span className="text-gray-500 font-semibold col-span-2 lg:col-span-1 py-2 pl-2 truncate">ACTION</span>
                        </div>
                        <div className="bg-white w-full rounded-b-xl overflow-y-auto" style={{ height: '50vh' }}>
                            <LocationCard items={locations} openModal={openModal} itemLoading={itemLoading} selectedItems={selectedLocations} onSelectItem={handleSelectLocation} />
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </div>
    );
}