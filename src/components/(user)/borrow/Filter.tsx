'use client';
import { Item } from "@/models/Item";
import { Location } from "@/models/Location";
import app from "@/services/firebase-config";
import Tooltip from "@mui/material/Tooltip";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { getAuth, getIdToken } from "firebase/auth";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
//icons
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ReorderOutlinedIcon from '@mui/icons-material/ReorderOutlined';
import ClearIcon from '@mui/icons-material/Clear';

interface FiltersProps { // typescript moment, everthing should have a type
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
    onFilterChange: (filterType: string, filterValue: string) => void;
    items: Item[];
}

export default function Filters({ active, setActive, onFilterChange, items }: FiltersProps) {
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