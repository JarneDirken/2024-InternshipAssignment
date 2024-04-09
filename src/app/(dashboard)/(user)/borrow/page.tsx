'use client';
import Unauthorized from "@/app/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useState, Dispatch, SetStateAction, useRef, useCallback } from "react";
import { Location } from "@/models/Location";
import { Item } from "@/models/Item";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import Loading from "@/components/states/Loading";
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ReorderOutlinedIcon from '@mui/icons-material/ReorderOutlined';
import Tooltip from "@mui/material/Tooltip";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { getAuth, getIdToken } from 'firebase/auth';
import app from "@/services/firebase-config";
import MaterialUIModal  from '@mui/material/Modal';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import Button from "@/components/states/Button";
import { useRecoilState, useRecoilValue } from "recoil";
import { itemsState, requestsState } from "@/services/store";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface FiltersProps { // typescript moment, everthing should have a type
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
    onFilterChange: (filterType: string, filterValue: string) => void;
    items: Item[];
}

interface BorrowCardProps {
    active: boolean;
    openModal: (id: number) => void;
    nameFilter: string;
    modelFilter: string;
    brandFilter: string;
    locationFilter: string;
}

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    item?: Item;
    userId: String | null;
}

interface PendingBorrowProps {
    active: boolean;
    nameFilter: string;
    modelFilter: string;
    brandFilter: string;
    locationFilter: string;
    userId: string;
}

export default function Borrow() {
    const isAuthorized = useAuth(['Student']); // you need at least role student to view this page
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const items = useRecoilValue(itemsState); // to store all items
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
        setTotalItemCount(items.length);
    },[items]);

    useEffect(()=> {
        setTotalRequestCount(requests.length);
    }, [requests]);

    useEffect(() => {
        if (userId) {
            getPendingBorrowCount();
        }
    }, [userId]);

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
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0">
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

function Filters({ active, setActive, onFilterChange, items }: FiltersProps) {
    const [locations, setLocations] = useState<Location[]>([]);
    const prevWidthRef = useRef(window.innerWidth);
    const [name, setName] = useState('');
    const [model, setModel] = useState('');
    const [brand, setBrand] = useState('');
    const [location, setLocation] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const resetName = () => {
        setName('');
        onFilterChange('name', '');
    };

    const resetBrand = () => {
        setBrand('');
        onFilterChange('brand', '');
    };

    const resetModel = () => {
        setModel('');
        onFilterChange('model', '');
    };

    const resetLocation = () => {
        setLocation('');
        onFilterChange('location', '');
    };

    useEffect(() => {
        getLocations();
    }, [])

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setActive(false);
        }
    }, [setActive]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const prevWidth = prevWidthRef.current;

            if (prevWidth >= 1024 && width < 1024) {
                setActive(false);
            }

            prevWidthRef.current = width;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [setActive]);

    async function getLocations() {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await getIdToken(user);
                const response = await fetch('/api/locations', {
                    method: 'GET',
                    headers: {
                        'Authorization': `${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setLocations(data);
            } catch (error) {
                console.error("Failed to fetch locations:", error);
            }
        }
    }

    const handleNameChange = (value: string | null) => {
        onFilterChange('name', value || '');
        setName(value || '');
    };

    const handleModelChange = (value: string | null) => {
        onFilterChange('model', value || '');
        setModel(value || '');
    };

    const handleBrandChange = (value: string | null) => {
        onFilterChange('brand', value || '');
        setBrand(value || '');
    };

    const handleLocationChange = (value: string | null) => {
        onFilterChange('location', value || '');
        setLocation(value || '');
    };

    const theme = createTheme({
        components: {
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'orange',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'orange',
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        '&.Mui-focused': {
                            color: 'orange',
                        },
                    },
                },
            },
        },
    });

    return (
        <>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <PersonAddAltOutlinedIcon fontSize="large" />
                    <h1 className="font-semibold text-2xl">Borrow</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="lg:flex items-center gap-1 hidden">
                        <Tooltip title="List view" arrow>
                            <div className={`cursor-pointer rounded-full p-1 ${active ? 'bg-custom-primary text-white' : 'bg-transparent text-black'}`}
                                onClick={() => setActive(true)}>
                                <ReorderOutlinedIcon />
                            </div>
                        </Tooltip>
                        <Tooltip title="Card view" arrow>
                            <div className={`cursor-pointer rounded-full p-1 ${!active ? 'bg-custom-primary text-white' : 'bg-transparent text-black'}`}
                                onClick={() => setActive(false)}>
                                <AppsOutlinedIcon />
                            </div>
                        </Tooltip>
                    </div>
                    <Tooltip title="Shopping cart" arrow placement="top">
                        <div className="relative">
                            <div onClick={handleMenuOpen}>
                                <ShoppingCartOutlinedIcon fontSize="large" className="cursor-pointer" />
                            </div>
                            <div className="rounded-full bg-custom-primary w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                                0
                            </div>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                className="cursor-pointer"
                            >
                                <MenuItem onClick={handleMenuClose}>Menu Item 1 fddf dsfds fsdf sd</MenuItem>
                                <MenuItem onClick={handleMenuClose}>Menu Item 2</MenuItem>
                                <MenuItem onClick={handleMenuClose}>Menu Item 3</MenuItem>
                            </Menu>
                        </div>
                    </Tooltip>
                </div>
            </div>
            <hr className="hidden md:block" />
            <div className="p-4">
                <ThemeProvider theme={theme}>
                    <div className="grid grid-cols-2 gap-4 mb-4 lg:grid-cols-4">
                        <div>
                            <Autocomplete
                                disablePortal
                                size="small"
                                id="combo-box-demo"
                                value={name || null}
                                onChange={(event, value) => handleNameChange(value)}
                                options={[...new Set(items.map(item => item.name))]} // Ensure unique names
                                isOptionEqualToValue={(option, value) => option === value}
                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Name"
                                        placeholder="Search"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                        <Autocomplete
                                disablePortal
                                size="small"
                                id="combo-box-demo"
                                value={model || null}
                                onChange={(event, value) => handleModelChange(value)}
                                options={[...new Set(items.map(item => item.model))]} // Ensure unique models
                                isOptionEqualToValue={(option, value) => option === value}
                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Model"
                                        placeholder="Search"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                        <Autocomplete
                                disablePortal
                                size="small"
                                id="combo-box-demo"
                                value={brand || null}
                                onChange={(event, value) => handleBrandChange(value)}
                                options={[...new Set(items.map(item => item.brand))]} // Ensure unique brands
                                isOptionEqualToValue={(option, value) => option === value}
                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Brand"
                                        placeholder="Search"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <Autocomplete
                                disablePortal
                                size="small"
                                id="combo-box-demo"
                                value={location || null}
                                onChange={(event, value) => handleLocationChange(value)}
                                options={locations.map(location => location.name)}
                                isOptionEqualToValue={(option, value) => option === value}
                                sx={{ width: '100%' }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Location"
                                        placeholder="Select"
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </ThemeProvider>
                <div className="bg-gray-100 rounded-lg p-2 flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500">Filters applied:&nbsp;</span>
                    {name && (
                        <div className="bg-gray-300 px-2 rounded-md flex items-center truncate">
                            <ClearIcon fontSize="small" className="cursor-pointer" onClick={resetName} />
                            <span className="text-sm text-gray-600">Name:&nbsp;</span>
                            <span className="text-sm">{name}</span>
                        </div>
                    )}
                    {model && (
                        <div className="bg-gray-300 px-2 rounded-md flex items-center truncate">
                            <ClearIcon fontSize="small" className="cursor-pointer" onClick={resetModel} />
                            <span className="text-sm text-gray-600">Model:&nbsp;</span>
                            <span className="text-sm">{model}</span>
                        </div>
                    )}
                    {brand && (
                        <div className="bg-gray-300 px-2 rounded-md flex items-center truncate">
                            <ClearIcon fontSize="small" className="cursor-pointer" onClick={resetBrand} />
                            <span className="text-sm text-gray-600">Brand:&nbsp;</span>
                            <span className="text-sm">{brand}</span>
                        </div>
                    )}
                    {location && (
                        <div className="bg-gray-300 px-2 rounded-md flex items-center truncate">
                            <ClearIcon fontSize="small" className="cursor-pointer" onClick={resetLocation} />
                            <span className="text-sm text-gray-600">Location:&nbsp;</span>
                            <span className="text-sm">{location}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function BorrowCard({ active, openModal, nameFilter, modelFilter, brandFilter, locationFilter }: BorrowCardProps) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useRecoilState(itemsState);

    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";

    // get items with pagination and filter on SERVER SIDE
    async function getItems(nameFilter = '', modelFilter = '', brandFilter = '', locationFilter = '') {
        setLoading(true);
        try {
            const queryString = new URLSearchParams({
                name: nameFilter,
                model: modelFilter,
                brand: brandFilter,
                location: locationFilter
            }).toString();
            const response = await fetch(`/api/user/items?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setItems(data.items);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getItems(nameFilter, modelFilter, brandFilter, locationFilter);
    }, [nameFilter, modelFilter, brandFilter, locationFilter]);

    if (loading) { return (<Loading />); }

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
    }

    function renderItemStatus(item: Item) {
        switch (item.itemStatusId) {
            case 1:
                return (
                    <Button 
                        text="Borrow" 
                        textColor="white" 
                        borderColor="custom-primary" 
                        fillColor="custom-primary"
                        paddingY="py-0"
                        font="semibold"
                        onClick={() => openModal(item.id)}
                    />
                );
            case 2:
                return <span>Pending borrow</span>;
            case 3:
                return <span>Being Borrowed</span>;
            case 4:
                return <span>Pending return</span>;
            case 5:
                return <span>Reparation</span>;
            case 6:
                return <span>Broken</span>;
            default:
                return null;
        }
    }

    return (
        <>
            <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between">
                                <div className="flex flex-row gap-10 items-center">
                                    <div>
                                        <img src={item.image} height={100} width={100} alt={item.name} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="truncate">
                                            <span className="font-semibold">Name:&nbsp;</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Model:&nbsp;</span>
                                            <span>{item.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="truncate">
                                            <span className="font-semibold">Brand:&nbsp;</span>
                                            <span>{item.brand}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {renderItemStatus(item)}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="p-2">
                                    <span className="text-lg font-semibold truncate">{item.name}</span>
                                </div>
                                <hr />
                                <div className="flex items-center p-4 max-w-xs">
                                    <div className="w-1/3 flex justify-center mr-2">
                                        <img src={item.image} height={140} width={140} alt={item.name} />
                                    </div>
                                    <div className="flex flex-col items-start w-2/3">
                                        <div className="flex items-center gap-6 max-w-full">
                                            <div className="flex flex-col items-start max-w-2/3">
                                                <span className="text-gray-400">Model</span>
                                                <span className="truncate">{item.model}</span>
                                            </div>
                                            <div className="flex flex-col items-start max-w-1/3">
                                                <span className="text-gray-400">Brand</span>
                                                <span className="truncate">{item.brand}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start w-full">
                                            <span className="text-gray-400">Location</span>
                                            <span className="truncate">{item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-center items-center p-2">
                                    {renderItemStatus(item)}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
        </div>
        </>
    );
}

function PendingBorrows({ active, nameFilter, modelFilter, brandFilter, locationFilter, userId }: PendingBorrowProps) {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useRecoilState(requestsState);
    
    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";
    
    // get item requests with pagination and filter on SERVER SIDE
    async function getPendingBorrows(nameFilter = '', modelFilter = '', brandFilter = '', locationFilter = '') {
        setLoading(true);
        try {
            if (!userId) { return; }
            const queryString = new URLSearchParams({
                userId: userId,
                name: nameFilter,
                model: modelFilter,
                brand: brandFilter,
                location: locationFilter
            }).toString();
            const response = await fetch(`/api/user/itemrequest?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setRequests(data.itemRequests);
        } catch (error) {
            console.error("Failed to fetch item requests:", error);
        } finally {
            setLoading(false);
        }
    }

    async function cancelPendingBorrow(requestId: number, itemId: number){
        try {
            const queryString = new URLSearchParams({
                itemId: itemId.toString()
            }).toString();
            const response = await fetch(`/api/user/itemrequest/${requestId}?${queryString}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Failed to cancel pending borrow request: ", error)
        }
    }

    useEffect(() => {
        getPendingBorrows(nameFilter, modelFilter, brandFilter, locationFilter);
    }, [nameFilter, modelFilter, brandFilter, locationFilter]);

    function formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        return date.toLocaleDateString('en-US', options);
    }
      

    if (loading) { return (<Loading />); }

    if (requests.length === 0) {
        return <div>No borrow requests found</div>;
    }

    return (
        <>
        <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {requests.map((request) => (
                    <div key={request.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between">
                                <div className="flex flex-row gap-10 items-center">
                                    <div>
                                        <img src={request.item.image} height={100} width={100} alt={request.item.name} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="truncate">
                                            <span className="font-semibold">Name:&nbsp;</span>
                                            <span>{request.item.name}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Model:&nbsp;</span>
                                            <span>{request.item.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="truncate">
                                            <span className="font-semibold">Brand:&nbsp;</span>
                                            <span>{request.item.brand}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{request.item.location.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex truncate items-center text-custom-primary gap-1">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>Pending</span>
                                        </div>
                                        <div className="flex truncate items-center text-gray-400 gap-1 text-sm">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>{formatDate(new Date(request.startBorrowDate))} - {formatDate(new Date(request.endBorrowDate))}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <Button 
                                        text="Cancel"
                                        textColor="custom-red"
                                        borderColor="custom-red" 
                                        paddingY="py-0"
                                        onClick={() => cancelPendingBorrow(request.id, request.itemId)}
                                    />
                                    <Button 
                                        text="View" 
                                        textColor="white" 
                                        borderColor="custom-primary" 
                                        fillColor="custom-primary"
                                        paddingY="py-0"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="p-2 flex items-center">
                                    <div className="flex w-1/2 flex-wrap">
                                        <span className="text-lg font-semibold flex-wrap">{request.item.name}</span>
                                    </div>
                                    <div className="w-1/2 flex flex-col items-end">
                                        <div className="flex items-center text-custom-primary gap-1">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span className="truncate">Pending</span>
                                        </div>
                                        <div className="flex truncate items-center text-gray-400 gap-1 text-sm">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>{formatDate(new Date(request.startBorrowDate))} - {formatDate(new Date(request.endBorrowDate))}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex items-center p-4">
                                    <div className="w-1/3 flex justify-center mr-2">
                                        <img src={request.item.image} height={140} width={140} alt={request.item.name} />
                                    </div>
                                    <div className="flex flex-col items-start w-2/3">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-start truncate">
                                                <span className="text-gray-400">Model</span>
                                                <span>{request.item.model}</span>
                                            </div>
                                            <div className="flex flex-col items-start truncate">
                                                <span className="text-gray-400">Brand</span>
                                                <span>{request.item.brand}</span>
                                            </div>
                                        </div>
                                        <div className="truncate flex flex-col items-start w-full">
                                            <span className="text-gray-400">Location</span>
                                            <span>{request.item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-center items-center p-2">
                                    <Button 
                                        text="Cancel"
                                        textColor="custom-red"
                                        borderColor="custom-red" 
                                        paddingY="py-0"
                                        onClick={() => cancelPendingBorrow(request.id, request.itemId)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
        </div>
        </>
    );
}

function Modal({ open, onClose, item, userId }: ModalCardProps) {
    const [value, setValue] = useState(dayjs()); // date picker
    const [amount, setAmount] = useState<string | null>(null);
    const [isUrgent, setIsUrgent] = useState(false); // change this to view / not view the urgent borrow request
    const [file, setFile] = useState<File | null>(null); // file uploader
    const [startDateTime, setStartDateTime] = useState(new Date('2024-04-08T08:20').toISOString());
    const [endDateTime, setEndDateTime] = useState(new Date('2024-04-12T08:15').toISOString());

    function checkDateTime(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        // Function to check if date is a weekday
        const isWeekday = (date: Date) => {
            const day = date.getDay();
            return day >= 1 && day <= 5; // 1 is Monday, 5 is Friday
        };
    
        // Function to check if time is between 8-9 AM or 5-6 PM
        const isValidTime = (date: Date) => {
            const hours = date.getHours();
            return (hours >= 8 && hours < 9) || (hours >= 17 && hours < 18);
        };
    
        // Check if both dates are on weekdays
        if (!isWeekday(start) || !isWeekday(end)) {
            setIsUrgent(false);
            return;
        }
    
        // Check if times are valid
        if (!isValidTime(start) || !isValidTime(end)) {
            setIsUrgent(false);
            return;
        }
    
        // If both dates are the same, ensure start is AM and end is PM
        if (start.toDateString() === end.toDateString() && (start.getHours() >= 9 || end.getHours() < 17)) {
            setIsUrgent(false);
            return;
        }
    
        // If all checks passed, set isUrgent to true
        setIsUrgent(true);
    }

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setAmount(inputValue !== '' ? inputValue : null);
    };
    

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
    };
    
    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            setFile(files[0]);
        }
    };
    
      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
          setFile(event.target.files[0]);
        }
      };

      const handleClearFile = () => {
        setFile(null);
        // Reset the file input value
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    async function borrowItem() {
        if (!item) {console.log("error"); return;}
        const data = {
            itemId: item.id,
            requestStatusId: 1,
            borrowerId: userId,
            requestDate: new Date().toISOString(),
            startBorrowDate: startDateTime,
            endBorrowDate: endDateTime,
            file,
            isUrgent: isUrgent,
            amountRequest: amount,
        };
        
        const response = await fetch(`/api/user/itemrequest/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            
        } else {
            console.error('Failed to create item request');
        }
    }
    

    const theme = createTheme({
        palette: {
          primary: {
            main: '#ff9800', // your primary color
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              textPrimary: {
                color: '#ff9800',
              },
            },
          },
        },
      });

    if(!item) { return;}

    return (
        <MaterialUIModal
            open={open}
            onClose={onClose}
            aria-labelledby="borrow-modal-title"
            aria-describedby="borrow-modal-description"
        >
            <Box 
                className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[50%] rounded-lg shadow-lg h-[70%]"
            >
                <div className="flex px-4 py-4 justify-between items-center border-b border-b-gray-300">
                    <div className="flex items-center gap-2">
                        <PersonAddAltOutlinedIcon />
                        <h1 id="borrow-modal-title" className="text-xl">Borrow details</h1>
                    </div>
                    <ClearIcon className="cursor-pointer" onClick={onClose} />
                </div>
                <div id="borrow-modal-description" className="overflow-y-auto h-[87%]">
                    <div className=" flex flex-col xl:flex-row xl:gap-8 px-8 py-2">
                        <div className="flex flex-col xl:w-1/2 xl:px-12">
                            <div className="flex justify-center mb-2 xl:justify-start">
                                <img src={item.image} height={200} width={200} alt={item.name} />
                            </div>
                            <div className="flex flex-col gap-3 lg:mt-4">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Name</span>
                                    <span>{item.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-400">Model</span>
                                        <span>{item.model}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-400">Brand</span>
                                        <span>{item.brand}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Location</span>
                                    <span>{item.location.name}</span>
                                </div>
                                {item.consumable && (
                                    <div className="mt-2">
                                        <ThemeProvider theme={theme}>
                                            <TextField
                                                id="outlined"
                                                label="Amount"
                                                size="small"
                                                className="bg-white w-full"
                                                name="amount"
                                                value={amount}
                                                onChange={handleAmountChange}
                                                placeholder="Search"
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </ThemeProvider>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="xl:w-1/2 xl:block xl:items-end xl:justify-end flex justify-center shadow-lg scale-90 transform hide-picker-actions z-0 mr-8">
                            <ThemeProvider theme={theme}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div> 
                                    <StaticDateTimePicker
                                    displayStaticWrapperAs="mobile"
                                    openTo="day"
                                    value={value}
                                    onChange={(newValue) => {
                                        if (newValue !== null) {
                                        setValue(newValue);
                                        }
                                    }}
                                    />
                                </div>
                                </LocalizationProvider>
                            </ThemeProvider>
                        </div>
                    </div>
                    {isUrgent && (
                        <div className="flex flex-col px-12">
                            <div className="flex flex-row justify-between items-center px-8">
                                <span className="">Download the file and re-upload it with a signature of your teacher.</span>
                                <span className="text-custom-blue underline cursor-pointer">Download</span>
                            </div>
                            <div className="flex flex-col justify-center items-center mt-2 px-8">
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer border-dashed border border-gray-400 bg-gray-100 w-full rounded py-8 px-8 text-center"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <CloudUploadOutlinedIcon fontSize="large" className="text-custom-gray" />
                                <div className="flex flex-col">
                                    <span className="font-semibold"><span className="text-custom-blue">Click to upload</span> or drag and drop</span>
                                    <span className="text-custom-gray">JPG, JPEG, PNG, PDF less than 5MB.</span>
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="opacity-0 w-0 h-0"
                                    accept="image/jpeg,image/png,application/pdf"
                                />
                            </label>
                                {file && (
                                <div className="flex flex-row gap-2">
                                    <span>File selected: {file.name}</span>
                                    <ClearIcon className="cursor-pointer" onClick={handleClearFile} />
                                </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-center items-center">
                                <span className="capitalize font-bold">You are making an <span className="text-custom-red">urgent borrow request!</span> are you sure you want to continue?</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-row justify-between items-center py-2 px-2 md:px-16 border-t border-t-gray-200 mt-4">
                        <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={onClose}>
                            <button className="text-custom-gray">Cancel</button>
                        </div>
                        <div className={`border py-1 px-3 rounded-lg flex items-center gap-1 ${!isUrgent || file ? 'border-custom-green text-custom-green cursor-pointer' : 'border-gray-300 text-gray-300 cursor-not-allowed'}`} 
                            onClick={isUrgent && !file ? undefined : borrowItem}>
                            <CheckCircleOutlineOutlinedIcon fontSize="small" className={`${!isUrgent || file ? 'text-custom-green':'text-custom-gray cursor-not-allowed'}`}/>
                            <button className={`${!isUrgent || file ? 'text-custom-green':'text-custom-gray cursor-not-allowed disabled'}`}>Borrow</button>
                        </div>
                        <div className={`border py-1 px-3 rounded-lg flex items-center gap-1 ${!isUrgent || file ? 'border-custom-primary text-custom-primary cursor-pointer' : 'border-gray-300 text-gray-300 cursor-not-allowed'}`} 
                            onClick={isUrgent && !file ? undefined : onClose}>
                            <ShoppingCartOutlinedIcon fontSize="small" className={`${!isUrgent || file ? 'text-custom-primary':'text-custom-gray cursor-not-allowed'}`} />
                            <button className={`${!isUrgent || file ? 'text-custom-primary':'text-custom-gray cursor-not-allowed disabled'}`}>Add cart</button>
                        </div>
                    </div>
                </div>
            </Box>
        </MaterialUIModal>
    );
}