'use client';
import Unauthorized from "@/app/(error)/unauthorized/page";
import useAuth from "@/hooks/useAuth";
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useState, Dispatch, SetStateAction, useRef } from "react";
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

interface FiltersProps { // typescript moment, everthing should have a type
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
    onFilterChange: (filterType: string, filterValue: string) => void;
}

interface BorrowCardProps { // typescript moment, everthing should have a type
    active: boolean;
    items: Item[];
    loading: boolean;
    totalItemCount: number;
    loadMoreItems: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function Borrow() {
    const isAuthorized = useAuth(['Student']); // you need at least role student to view this page
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const [items, setItems] = useState<Item[]>([]); // to store all items
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1); // pagination
    const [totalItemCount, setTotalItemCount] = useState(0); // pagination
    const itemsPerPage = 6; // pagination
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [modelFilter, setModelFilter] = useState(''); // model filter
    const [brandFilter, setBrandFilter] = useState(''); // brand filter
    const [locationFilter, setLocationFilter] = useState(''); // location filter
    const scrollPositionRef = useRef<number>(0);

    // get items with pagination and filter on SERVER SIDE
    async function getItems(page = 1, nameFilter = '', modelFilter = '', brandFilter = '', locationFilter = '') {
        setLoading(true);
        try {
            const queryString = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
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

            if (page === 1) {
                setItems(data.items);
            } else {
                setItems(prevItems => [...prevItems, ...data.items]);
            }
            setTotalItemCount(data.totalCount);
            setCurrentPage(page); // Update currentPage state here
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoading(false);
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
        setCurrentPage(1); // Reset to first page on filter change
    };

    const loadMoreItems = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    
        // Remember the current scroll position
        scrollPositionRef.current = window.scrollY;
    
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
    };
    
    // After the state is updated, restore the scroll position from the ref
    useEffect(() => {
        window.scrollTo(0, scrollPositionRef.current);
    }, [loadMoreItems]);
    
    useEffect(() => {
        getItems(currentPage, nameFilter, modelFilter, brandFilter, locationFilter);
    }, [currentPage, nameFilter, modelFilter, brandFilter, locationFilter]);

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <div className="bg-white mb-4 rounded-xl">
                <Filters 
                    active={active} 
                    setActive={setActive} 
                    onFilterChange={handleFilterChange} 
                />
            </div>
            <div className="rounded-xl">
                <BorrowCard
                    active={active}
                    items={items}
                    loading={loading}
                    loadMoreItems={loadMoreItems}
                    totalItemCount={totalItemCount}
                />            
            </div>
            {/* <div>
                <TestLocations />
            </div> */}
        </div>
    );
}

// function TestLocations() {
//     const fetchLocations = async () => {
//     const auth = getAuth(app);
//     const user = auth.currentUser;
    
//     if (user) {
//         const token = await getIdToken(user);
//         console.log(token);
//         const response = await fetch('/api/locations', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             }
//         });
//         if (response.ok) {
//             const locations = await response.json();
//             return locations;
//         }
//     }
//         throw new Error('User not authenticated');
//     };

//     useEffect(()=> {
//         fetchLocations();
//     }, [])

//     return (
//         <div>
//             locations:
//         </div>
//     );
// }

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
        try {
            const response = await fetch('/api/locations');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setLocations(data);
        } catch (error) {
            console.error("Failed to fetch locations:", error);
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
                    <Tooltip title="Shopping cart" arrow  placement="top">
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

function BorrowCard({ active, items, loading, totalItemCount, loadMoreItems }: BorrowCardProps) {
    const gridViewClass = "grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4";
    const listViewClass = "flex flex-col bg-white rounded-xl overflow-hidden";

    if (loading) { return (<Loading />); }

    return (
        <div className={active ? listViewClass : gridViewClass}>
            {active && (
                <div className="relative py-5 pt-8 px-12 font-semibold uppercase flex items-center border-b border-gray-300">
                    <div className="text-custom-primary border-custom-primary border-b-4 w-48 absolute left-0 px-12 py-2">
                        Products
                    </div>
                </div>

            )}
            {items.length > 0 ? (
                items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-4"}`}>
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
                                    <button className="px-4 border-custom-primary bg-custom-primary rounded-lg text-white font-semibold text-lg" style={{ paddingTop: 2, paddingBottom: 2 }}>Borrow</button>
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
                                    <button className="px-4 border-custom-primary bg-custom-primary rounded-lg text-white font-semibold text-lg" style={{ paddingTop: 2, paddingBottom: 2 }}>Borrow</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div className="text-center p-4">
                    No items found.
                </div>
            )}
            {items.length > 0 && items.length < totalItemCount && (
                <button onClick={loadMoreItems} className="items-center justify-center mx-auto my-4 px-6 py-2 border rounded-lg text-white bg-custom-primary font-semibold">
                    Load More
                </button>
            )}
        </div>
    );
}