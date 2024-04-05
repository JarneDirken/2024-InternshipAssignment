'use client';
import Unauthorized from "@/app/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import SearchIcon from '@mui/icons-material/Search';
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
import { ItemRequest } from "@/models/ItemRequest";
import MaterialUIModal  from '@mui/material/Modal';
import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';

interface FiltersProps { // typescript moment, everthing should have a type
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
    onFilterChange: (filterType: string, filterValue: string) => void;
}

interface BorrowCardProps {
    active: boolean;
    items: Item[];
    loading: boolean;
    openModal: (id: number) => void;
}

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    item?: Item;
}

export default function Borrow() {
    const isAuthorized = useAuth(['Student']); // you need at least role student to view this page
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [items, setItems] = useState<Item[]>([]); // to store all items
    const [item, setItem] = useState<Item>(); // to store one item
    const [requests, setRequests] = useState<ItemRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalrequestCount, setTotalRequestCount] = useState([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalItemCount, setTotalItemCount] = useState(0); // pagination
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [modelFilter, setModelFilter] = useState(''); // model filter
    const [brandFilter, setBrandFilter] = useState(''); // brand filter
    const [locationFilter, setLocationFilter] = useState(''); // location filter
    const [selectedTab, setSelectedTab] = useState('products');
    const [isModalOpen, setModalOpen] = useState(false);

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
            const response = await fetch(`/api/items?${queryString}`);

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

    // get item requests with pagination and filter on SERVER SIDE
    async function getPendingBorrows(nameFilter = '', modelFilter = '', brandFilter = '', locationFilter = '') {
        setLoading(true);
        try {
            const queryString = new URLSearchParams({
                name: nameFilter,
                model: modelFilter,
                brand: brandFilter,
                location: locationFilter
            }).toString();
            const response = await fetch(`/api/itemrequests?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setRequests(data.items);
            setTotalRequestCount(data.totalCount);
        } catch (error) {
            console.error("Failed to fetch item requests:", error);
        } finally {
            setLoading(false);
        }
    }

    async function getItemData(id: number) {
        const auth = getAuth(app);
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await getIdToken(user);
                const response = await fetch(`/api/items/${id}`, {
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
        getItems(nameFilter, modelFilter, brandFilter, locationFilter);
    }, [nameFilter, modelFilter, brandFilter, locationFilter]);

    useEffect(() => {
        setTotalItemCount(items.length);
    },[items])

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <Modal
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                item={item}
            />
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
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
                        <div className="rounded-full bg-custom-primary w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-11 transform translate-x-1/2 -translate-y-1/2">
                            {totalItemCount}
                        </div>
                    </div>
                    <div
                        className={`w-48 flex justify-center py-3 uppercase cursor-pointer ${selectedTab === 'pending' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                        onClick={() => setSelectedTab('pending')}
                    >
                        Pending borrows
                    </div>
                </div>
                {selectedTab === "products" ? (
                    <BorrowCard
                        active={active}
                        items={items}
                        loading={loading}
                        openModal={openModal}
                    />
                ) : (
                    <PendingBorrows />
                )}
            </div>
        </div>
    );
}

function Filters({ active, setActive, onFilterChange }: FiltersProps) {
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

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange('name', event.target.value);
        setName(event.target.value);
    };

    const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange('model', event.target.value);
        setModel(event.target.value);
    };

    const handleBrandChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange('brand', event.target.value);
        setBrand(event.target.value);
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
                            <TextField
                                id="outlined"
                                label="Name"
                                size="small"
                                className="bg-white w-full"
                                name="name"
                                value={name}
                                onChange={handleNameChange}
                                placeholder="Search"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <div>
                            <TextField
                                id="outlined"
                                label="Model"
                                size="small"
                                className="bg-white w-full"
                                name="model"
                                value={model}
                                onChange={handleModelChange}
                                placeholder="Search"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </div>
                        <div>
                            <TextField
                                id="outlined"
                                label="Brand"
                                size="small"
                                className="bg-white w-full"
                                name="brand"
                                value={brand}
                                onChange={handleBrandChange}
                                placeholder="Search"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
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

function BorrowCard({ active, items, loading, openModal }: BorrowCardProps) {
    const cardContainerHeight = "calc(100vh - 25.6rem)";

    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";

    if (loading) { return (<Loading />); }

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
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
                                        <div>
                                            <span className="font-semibold">Name:&nbsp;</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Model:&nbsp;</span>
                                            <span>{item.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div>
                                            <span className="font-semibold">Brand:&nbsp;</span>
                                            <span>{item.brand}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <button 
                                        className="px-4 border-custom-primary bg-custom-primary rounded-lg text-white font-semibold text-lg" 
                                        style={{ paddingTop: 2, paddingBottom: 2 }}
                                        onClick={() => openModal(item.id)}>
                                            Borrow
                                        </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="truncate p-2">
                                    <span className="text-lg font-semibold">{item.name}</span>
                                </div>
                                <hr />
                                <div className="flex items-center p-4">
                                    <div className="w-1/3 flex justify-center">
                                        <img src={item.image} height={140} width={140} alt={item.name} />
                                    </div>
                                    <div className="flex flex-col items-start w-2/3">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-start">
                                                <span className="text-gray-400">Model</span>
                                                <span>{item.model}</span>
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-gray-400">Brand</span>
                                                <span>{item.brand}</span>
                                            </div>
                                        </div>
                                        <div className="truncate flex flex-col items-start w-full">
                                            <span className="text-gray-400">Location</span>
                                            <span>{item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-center items-center p-2">
                                    <button 
                                        className="px-4 border-custom-primary bg-custom-primary rounded-lg text-white font-semibold text-lg" 
                                        style={{ paddingTop: 2, paddingBottom: 2 }}
                                        onClick={() => openModal(item.id)}>
                                            Borrow
                                        </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
        </div>
        </>
    );
}

function PendingBorrows() {
    return (
        <div>
            Pending borrows
        </div>
    );
}

function Modal({ open, onClose, item }: ModalCardProps) {
    const [value, setValue] = useState(dayjs());
    const [amount, setAmount] = useState('');
    const [isOnTime, setIsOnTime] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(event.target.value);
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
                <div id="borrow-modal-description" className="px-4 py-2 overflow-y-auto h-[87%]">
                    <div className=" flex flex-col xl:flex-row xl:gap-8 px-8">
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
                                {!item.consumable && (
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
                    {!isOnTime && (
                        <div className="flex flex-col px-4">
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
                    <div className="flex flex-row justify-between py-2 px-2 md:px-16 mt-2">
                        <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={onClose}>
                            <button className="text-custom-gray">Cancel</button>
                        </div>
                        <div className={`border py-1 px-3 rounded-lg ${isOnTime || file ? 'border-custom-green text-custom-green cursor-pointer' : 'border-gray-300 text-gray-300 cursor-not-allowed'}`} 
                            onClick={!isOnTime && !file ? undefined : onClose}>
                            <CheckCircleOutlineOutlinedIcon fontSize="small" className={`${isOnTime || file ? 'text-custom-green':'text-custom-gray cursor-not-allowed'}`}/>
                            <button className={`${isOnTime || file ? 'text-custom-green':'text-custom-gray cursor-not-allowed disabled'}`}>Borrow</button>
                        </div>
                        <div className={`border py-1 px-3 rounded-lg ${isOnTime || file ? 'border-custom-primary text-custom-primary cursor-pointer' : 'border-gray-300 text-gray-300 cursor-not-allowed'}`} 
                            onClick={!isOnTime && !file ? undefined : onClose}>
                            <ShoppingCartOutlinedIcon fontSize="small" className={`${isOnTime || file ? 'text-custom-primary':'text-custom-gray cursor-not-allowed'}`} />
                            <button className={`${isOnTime || file ? 'text-custom-primary':'text-custom-gray cursor-not-allowed disabled'}`}>Add cart</button>
                        </div>
                    </div>
                </div>
            </Box>
        </MaterialUIModal>
    );
}