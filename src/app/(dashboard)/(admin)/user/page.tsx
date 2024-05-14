'use client';
import { useEffect, useRef, useState } from "react";
import Filters from "@/components/general/Filter";
import { Role } from "@/models/Role";
import { User } from "@/models/User";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { getAuth } from 'firebase/auth';
import {app} from "@/services/firebase-config";
import Button from "@/components/states/Button";
import Checkbox from '@mui/material/Checkbox';
import UserCard from "@/components/(admin)/users/UserCard";
import Modal from "@/components/(admin)/users/Modal";
import { SortOptions } from "@/models/SortOptions";
import { Filter } from "@/models/Filter";
import { useMemo } from 'react';
import * as XLSX from 'xlsx';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useInView } from "react-intersection-observer";
import useAuth from "@/hooks/useAuth";
import Loading from "@/components/states/Loading";
import Unauthorized from "../../(error)/unauthorized/page";
import useUser from "@/hooks/useUser";

export default function Users() {
    const { isAuthorized, loading } = useAuth(['Admin']);
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
    const [users, setUsers] = useState<User[]>([]);
    const [usersAll, setUsersAll] = useState<User[]>([]);
    const [selectedItems, setSelectedItems] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [itemLoading, setItemLoading] = useState(false);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [role, setRole] = useState<string>('');

    const filters: Filter[] = [
        { label: 'First Name', state: [firstName, setFirstName], inputType: 'text', optionsKey: 'firstName'},
        { label: 'Last Name', state: [lastName, setLastName], inputType: 'text', optionsKey: 'lastName'},
        { label: 'E-mail', state: [email, setEmail], inputType: 'text', optionsKey: 'email'},
        { label: 'Level', state: [role, setRole], inputType: 'text', optionsKey: 'role.name'},
    ];

    const [isModalOpen, setModalOpen] = useState(false);
    const { userId, token } = useUser();
    const [mode, setMode] = useState<'add' | 'edit' | 'delete'>('add');

    const sortOptions: SortOptions[] = [
        { label: 'Id', optionsKey: 'id'},
        { label: 'First Name', optionsKey: 'firstName' },
        { label: 'Last Name', optionsKey: 'lastName' },
        { label: 'Student Code', optionsKey: 'studentCode' },
        { label: 'E-mail', optionsKey: 'email' },
        { label: 'Level', optionsKey: 'role' },
    ];

    // infinite scroll load
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);     
    const NUMBER_OF_ITEMS_TO_FETCH = 20;
    const listRef = useRef<HTMLDivElement>(null);
    const { ref, inView } = useInView();

    useEffect(() => {
        if(userId && token) {
            getAllUsers(true);
        }
    }, [userId, firstName, lastName, email, role, token]);

    // infinite loading scroll
    useEffect(() => {
        if (inView && hasMore && !loading) {
            const currentScrollPosition = listRef.current ? listRef.current.scrollTop : 0;
            getAllUsers().then(() => {
                requestAnimationFrame(() => {
                    if (listRef.current) {
                        listRef.current.scrollTop = currentScrollPosition;
                    }
                });
            });
        }
    }, [inView, loading, hasMore]);

    const handleFilterChange = (filterType: string, value: string | string[]) => {
        switch (filterType) {
            case 'firstname':
                setFirstName(value as string);
                break;
            case 'lastname':
                setLastName(value as string);
                break;
            case 'email':
                setEmail(value as string);
                break;
            case 'role':
                setRole(value as string);
                break;
            default:
                break;
        }
    };

    async function getAllUsers(initialLoad = false, sortBy = 'id', sortDirection = 'desc') {
        if (!hasMore && !initialLoad) return; // infinite loading
        const currentOffset = initialLoad ? 0 : offset; // infinite loading
        setItemLoading(true);
        const params: Record<string, string> = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            role: role,
            sortBy: sortBy || 'id',
            sortDirection: sortDirection || 'desc',
            offset: currentOffset.toString(), // infinite loading 
            limit: NUMBER_OF_ITEMS_TO_FETCH.toString() // infinite loading 
        };
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        };

        if (token !== null) {
            params.token = token;
        };
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/admin/users?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.users || [];
            const fetchedItemsAll = data.usersAll || [];
            setRoles(data.roles || []);
            setUsersAll(fetchedItemsAll);

            // infinite loading
            if (initialLoad) {
                setUsers(fetchedItems);
            } else {
                setUsers(prevItems => [...prevItems, ...fetchedItems]);
            }
            setOffset(currentOffset + fetchedItems.length);
            setHasMore(fetchedItems.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        // Implement sorting logic here
        getAllUsers(true, sortBy, sortDirection);
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === usersAll.length) {
            setSelectedItems([]); // Deselect all if all are selected
        } else {
            setSelectedItems([...usersAll]); // Select all
        }
    };

    const handleSelectItem = (id: number) => {
        const selectedIndex = selectedItems.findIndex(item => item.id === id);
        let newSelectedItems = [...selectedItems];
    
        if (selectedIndex === -1) {
            // Check if the item exists before adding it
            const itemToAdd = users.find(item => item.id === id);
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
        if (mode === 'delete' && selectedItems.length === 1 || mode === 'edit' && selectedItems.length === 1){
            setSelectedItems([]);
        }
        setModalOpen(false);
    };

    const openModal = (mode: 'add' | 'edit' | 'delete', item?: User) => {
        if (item) {
            setSelectedItems([item]);
        }
        setMode(mode);
        setModalOpen(true);
    };

    interface ExportDataItem {
        [key: string]: number | string | boolean | undefined;
        userId: number;
        FirstName: string;
        LastName: string;
        Email: string;
        Studentcode: string | undefined;
        Telephone: string;
        Active: boolean;
        Role: string;
    };

    const exportUsersToExcel = (filename: string, worksheetName: string) => {
        if (!selectedItems || !selectedItems.length) return;
    
        const dataToExport: ExportDataItem[] = selectedItems.map(item => ({
            userId: item.id,
            FirstName: item.firstName,
            LastName: item.lastName,
            Email: item.email,
            Studentcode: item.studentCode,
            Telephone: item.tel,
            Active: item.active,
            Role: item.role.name,
        }));
    
        // Create a worksheet from the data
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
    
        // Adjust column widths
        const colWidths = Object.keys(dataToExport[0]).map(key => ({
            wch: Math.max(
                ...dataToExport.map(item => item[key] ? item[key]!.toString().length : 0),
                key.length  // Include the length of the header in the calculation
            )
        }));
        worksheet['!cols'] = colWidths;
    
        // Write the workbook to a file
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return ( 
        <div>
            <ThemeProvider theme={theme}>
                <Modal 
                    open={isModalOpen}
                    onClose={closeModal}
                    onItemsUpdated={() => getAllUsers(true)}
                    selectedItems={selectedItems}
                    roles={roles}
                    mode={mode}
                    userId={userId}
                    token={token}
                />
                <div className="bg-white mb-4 rounded-xl">
                    <Filters
                        active={active}
                        setActive={setActive}
                        title="Users"
                        icon={<PeopleAltOutlinedIcon fontSize="large" />}
                        onFilterChange={handleFilterChange}
                        onSortChange={handleSortChange}
                        filters={filters}
                        items={users}
                        sortOptions={sortOptions}
                        isSort={true}
                    />
                </div>
                <div className="rounded-xl">
                    <div className="flex flex-wrap justify-center md:justify-start bg-white gap-1 sm:gap-2 lg:gap-4 rounded-tl-xl rounded-tr-xl z-0 p-4">
                        <div onClick={() => {
                            openModal('add');
                            setSelectedItems([]);
                        }}>
                            <Button 
                                icon={<AddIcon />} 
                                textColor="custom-primary" 
                                borderColor="custom-primary" 
                                buttonClassName="hover:bg-orange-200"
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
                                fillColor={selectedItems.length === 0 ? "gray-200" : "red-100"}
                                buttonClassName={selectedItems.length === 0 ? "" : "hover:bg-red-200"}
                                paddingX="px-2.5"
                                paddingY="py-0.5"
                                textClassName="font-semibold" 
                                text="Delete" 
                                disabled={selectedItems.length === 0}
                            />
                        </div>
                        <div onClick={() => exportUsersToExcel(`User-Data`, 'UserData')}>
                            <Button 
                                icon={<InsertDriveFileOutlinedIcon />} 
                                textColor="custom-dark-blue" 
                                borderColor="custom-dark-blue" 
                                fillColor="blue-100" 
                                buttonClassName={selectedItems.length === 0 ? "" : "hover:bg-blue-200"}
                                paddingX="px-2.5"
                                paddingY="py-0.5"
                                textClassName="font-semibold" 
                                text="Export EXCEL" 
                                disabled={selectedItems.length === 0}
                            />
                        </div>
                    </div>
                    <div className="w-full border-b border-b-gray-300 bg-white flex items-center relative lg:hidden">
                        <Checkbox 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                            checked={selectedItems.length === usersAll.length && usersAll.length > 0}
                            onChange={toggleSelectAll}
                        />
                        <p className="text-custom-primary font-semibold px-16 py-2 border-b-2 border-b-custom-primary w-fit">PRODUCTS</p>
                    </div>
                    <div ref={listRef} className="bg-white w-full rounded-b-xl overflow-y-auto lg:hidden" style={{ height: '50vh' }}>
                        <UserCard 
                            items={users} 
                            openModal={openModal} 
                            itemLoading={itemLoading} 
                            selectedItems={selectedItems} 
                            onSelectItem={handleSelectItem}
                            hasMore={hasMore}
                            innerRef={ref} 
                        />
                    </div>
                    <div className="hidden lg:block">
                        <div className="w-full bg-gray-200 hidden lg:grid grid-cols-12">
                            <div className="col-span-1 mx-auto">
                                <Checkbox 
                                    checked={selectedItems.length === usersAll.length && usersAll.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </div>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-2 py-2 truncate">FIRST NAME</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-2 py-2 pl-2 truncate">LAST NAME</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">STUDENT CODE</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">TELEPHONE</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-2 py-2 pl-2 truncate">EMAIL</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">ROLE</span>
                            <span className="text-gray-500 font-semibold col-span-2 py-2 pl-2 truncate">ACTION</span>
                        </div>
                        <div ref={listRef} className="bg-white w-full rounded-b-xl overflow-y-auto" style={{ height: '50vh' }}>
                            <UserCard 
                                items={users} 
                                openModal={openModal} 
                                itemLoading={itemLoading} 
                                selectedItems={selectedItems} 
                                onSelectItem={handleSelectItem} 
                                hasMore={hasMore}
                                innerRef={ref}
                            />
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        </div>
    );
}