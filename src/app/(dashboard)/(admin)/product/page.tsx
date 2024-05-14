'use client';
import { useEffect, useRef, useState } from "react";
import Filters from "@/components/general/Filter";
import { Item } from "@/models/Item";
import { ItemStatus } from "@/models/ItemStatus";
import { Role } from "@/models/Role";
import { Location } from "@/models/Location";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { getAuth } from 'firebase/auth';
import {app} from "@/services/firebase-config";
import Button from "@/components/states/Button";
import Checkbox from '@mui/material/Checkbox';
import ProductCard from "@/components/(admin)/products/ProductCard";
import Modal from "@/components/(admin)/products/Modal";
import { SortOptions } from "@/models/SortOptions";
import { Filter } from "@/models/Filter";
import { useMemo } from 'react';
import * as XLSX from 'xlsx';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { useInView } from "react-intersection-observer";
import useAuth from "@/hooks/useAuth";
import Loading from "@/components/states/Loading";
import Unauthorized from "../../(error)/unauthorized/page";
import QrCode from "qrcode";
import jsPDF from "jspdf";
import useUser from "@/hooks/useUser";

export default function Product() {
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
    const [items, setItems] = useState<Item[]>([]);
    const [itemsAll, setItemsAll] = useState<Item[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [itemStatuses, setItemStatuses] = useState<ItemStatus[]>([]);

    const [itemLoading, setItemLoading] = useState(false);
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
    const { userId, token } = useUser();
    const [mode, setMode] = useState<'add' | 'edit' | 'delete' | 'import'>('add');

    const sortOptions: SortOptions[] = [
        { label: 'Id', optionsKey: 'id'},
        { label: 'Name', optionsKey: 'name' },
        { label: 'Model', optionsKey: 'model' },
        { label: 'Brand', optionsKey: 'brand' },
        { label: 'Location', optionsKey: 'location.name' }
    ];

    // infinite scroll load
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);     
    const NUMBER_OF_ITEMS_TO_FETCH = 20;
    const listRef = useRef<HTMLDivElement>(null);
    const { ref, inView } = useInView();

    useEffect(() => {
        if(userId && token) {
            getAllItems(true);
        }
    }, [userId, name, model, brand, location, year, availability, token]);

    // infinite loading scroll
    useEffect(() => {
        if (inView && hasMore && !loading) {
            const currentScrollPosition = listRef.current ? listRef.current.scrollTop : 0;
            getAllItems().then(() => {
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
            case 'name':
                setName(value as string);
                break;
            case 'model':
                setModel(value as string);
                break;
            case 'brand':
                setBrand(value as string);
                break;
            case 'location':
                setLocation(value as string);
                break;
            case 'year':
                setYear(value as string);
                break;
            case 'availability':
                setAvailability(value as string);
                break;
            default:
                break;
        }
    };

    async function getAllItems(initialLoad = false, sortBy = 'id', sortDirection = 'desc') {
        if (!hasMore && !initialLoad) return; // infinate loading
        const currentOffset = initialLoad ? 0 : offset; // infinate loading
        setItemLoading(true);
        const params: Record<string, string> = {
            name: name,
            model: model,
            brand: brand,
            location: location,
            year: year,
            availability: availability,
            sortBy: sortBy || 'id',
            sortDirection: sortDirection || 'desc',
            offset: currentOffset.toString(), // infinate loading 
            limit: NUMBER_OF_ITEMS_TO_FETCH.toString() // infinate loading 
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
            const response = await fetch(`/api/admin/products?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.items || [];
            const fetchedItemsAll = data.itemsAll || [];
            setRoles(data.roles || []);
            setLocations(data.locations || []);
            setItemStatuses(data.itemStatuses || []);
            setItemsAll(fetchedItemsAll);

            // infinate loading
            if (initialLoad) {
                setItems(fetchedItems);
            } else {
                setItems(prevItems => [...prevItems, ...fetchedItems]);
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
        getAllItems(true, sortBy, sortDirection);
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === itemsAll.length) {
            setSelectedItems([]); // Deselect all if all are selected
        } else {
            setSelectedItems([...itemsAll]); // Select all
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
        if (mode === 'delete' || mode === 'edit' && selectedItems.length === 1){
            setSelectedItems([]);
        }
        setModalOpen(false);
    };

    const openModal = (mode: 'add' | 'edit' | 'delete' | 'import', item?: Item) => {
        if (item) {
            setSelectedItems([item]);
        }
        setMode(mode);
        setModalOpen(true);
    };

    const uniqueNames = useMemo(() => {
        const nameSet = new Set(items.map(item => item.name));
        return Array.from(nameSet);
    }, [items]);
    
    const uniqueModels = useMemo(() => {
        const modelSet = new Set(items.map(item => item.model));
        return Array.from(modelSet);
    }, [items]);
    
    const uniqueBrands = useMemo(() => {
        const brandSet = new Set(items.map(item => item.brand));
        return Array.from(brandSet);
    }, [items]);

    const uniqueNumbers = useMemo(() => {
        const numberSet = new Set(items.map(item => item.number));
        return Array.from(numberSet);
    }, [items]);

    const formatDate = (dateString: Date): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    };

    interface ExportDataItem {
        [key: string]: number | string | boolean | undefined;
        itemId: number;
        Number: string;
        Name: string;
        Model: string;
        Brand: string;
        Location: string;
        Year: string | undefined;
        Role: string | undefined;
        Status: string | undefined;
        Active: boolean;
        Note: string | undefined;
        Schoolnumber: string | undefined;
        Consumable: boolean;
        Amount: number | undefined;
    };

    const exportProductsToExcel = (filename: string, worksheetName: string) => {
        if (!selectedItems || !selectedItems.length) return;
    
        console.log(selectedItems);

        const dataToExport: ExportDataItem[] = selectedItems.map(item => ({
            itemId: item.id,
            Number: item.number,
            Name: item.name,
            Model: item.model,
            Brand: item.brand,
            Location: item.location.name,
            Year: formatDate(item.yearBought!),
            Role: roles.find(role => role.id === item.RoleItem?.[0].roleId)?.name,
            Status: item.itemStatus?.name,
            Active: item.active,
            Note: item.notes,
            Schoolnumber: item.schoolNumber,
            Consumable: item.consumable,
            Amount: item.amount
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

    const exportQRCodesToPDF = async (items: Item[]) => {
        const doc = new jsPDF();
        const qrSize = 40; // Size of QR code
        const textOffsetY = 45; // Vertical offset for item number below QR code
        const marginX = 10; // Horizontal margin between QR codes
        const marginY = 20; // Vertical margin between QR codes

        const columns = 3; // Number of QR codes per row
        const rows = 4; // Number of QR codes per column
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Calculate total grid dimensions
        const gridWidth = columns * (qrSize + marginX) - marginX;
        const gridHeight = rows * (qrSize + marginY) - marginY;

        // Calculate starting positions to center the grid
        const startX = (pageWidth - gridWidth) / 2;
        const startY = (pageHeight - gridHeight) / 2;

        doc.setFontSize(8); // Smaller font size

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const url = `https://2024-internship-assignment.vercel.app/item/${item.id}`;
    
            try {
                const src = await QrCode.toDataURL(url);
    
                // Calculate position for current QR code
                const col = i % columns;
                const row = Math.floor((i % (columns * rows)) / columns);
                const x = startX + col * (qrSize + marginX);
                const y = startY + row * (qrSize + marginY);
    
                // Add QR code and item number to PDF
                doc.addImage(src, 'JPEG', x, y, qrSize, qrSize);
                doc.text(`Item No: ${item.number}`, x, y + textOffsetY);
    
                // Add a new page if reached the last position of the grid
                if ((i + 1) % (columns * rows) === 0 && i < items.length - 1) {
                    doc.addPage();
                }
    
            } catch (error) {
                console.error('Error generating QR code:', error);
            }
        }
    
        // Save PDF
        doc.save('Items_QR_Codes.pdf');
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return ( 
        <div>
            <ThemeProvider theme={theme}>
                <Modal 
                    open={isModalOpen}
                    onClose={closeModal}
                    onItemsUpdated={() => getAllItems(true)}
                    selectedItems={selectedItems}
                    roles={roles}
                    locations={locations}
                    itemStatuses={itemStatuses}
                    mode={mode}
                    userId={userId}
                    token={token}
                    uniqueNames={uniqueNames}  
                    uniqueModels={uniqueModels}
                    uniqueBrands={uniqueBrands}
                    existingNumbers={uniqueNumbers}
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
                        <div onClick={() => exportQRCodesToPDF(selectedItems)}>
                            <Button 
                                icon={<QrCode2RoundedIcon />} 
                                textColor="custom-dark-blue" 
                                borderColor="custom-dark-blue" 
                                fillColor="blue-100" 
                                paddingX="px-2.5"
                                paddingY="py-0.5"
                                buttonClassName={`bg-blue-100 border-custom-dark-blue ${selectedItems.length === 0 ? "" : "hover:bg-blue-200"}`}
                                textClassName="font-semibold text-custom-dark-blue" 
                                text="Qr-Code" 
                                disabled={selectedItems.length === 0}
                            />
                        </div>
                        <div onClick={() => exportProductsToExcel(`Item-Data`, 'ItemData')}>
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
                        <div onClick={() => openModal('import')}>
                            <Button 
                                icon={<InsertDriveFileOutlinedIcon />} 
                                textColor="custom-dark-blue" 
                                borderColor="custom-dark-blue" 
                                fillColor="blue-100" 
                                buttonClassName="hover:bg-blue-200"
                                paddingX="px-2.5"
                                paddingY="py-0.5"
                                textClassName="font-semibold" 
                                text="Import EXCEL" 
                            />
                        </div>
                    </div>
                    <div className="w-full border-b border-b-gray-300 bg-white flex items-center relative lg:hidden">
                        <Checkbox 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                            checked={selectedItems.length === itemsAll.length && itemsAll.length > 0}
                            onChange={toggleSelectAll}
                        />
                        <p className="text-custom-primary font-semibold px-16 py-2 border-b-2 border-b-custom-primary w-fit">PRODUCTS</p>
                    </div>
                    <div ref={listRef} className="bg-white w-full rounded-b-xl overflow-y-auto lg:hidden" style={{ height: '50vh' }}>
                        <ProductCard 
                            items={items} 
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
                                    checked={selectedItems.length === itemsAll.length && itemsAll.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </div>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 truncate">IMAGE</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-2 py-2 pl-2 truncate">NO.</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-2 py-2 pl-2 truncate">NAME</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">MODEL</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">BRAND</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">LOCATION</span>
                            <span className="text-gray-500 border-r-4 border-white font-semibold col-span-1 py-2 pl-2 truncate">YEAR</span>
                            <span className="text-gray-500 font-semibold col-span-2 py-2 pl-2 truncate">ACTION</span>
                        </div>
                        <div ref={listRef} className="bg-white w-full rounded-b-xl overflow-y-auto" style={{ height: '50vh' }}>
                            <ProductCard 
                                items={items} 
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