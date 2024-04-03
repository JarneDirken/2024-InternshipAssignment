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

interface FiltersProps {
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
}

interface BorrowCardProps {
    active: boolean;
}

export default function Borrow() {
    const isAuthorized = useAuth(['Student']);
    const [active, setActive] = useState(true);

    if (!isAuthorized) { return; }

    return (
        <div>
            <div className="bg-white mb-4 rounded-xl">
                <Filters active={active} setActive={setActive} />
            </div>
            <div className="rounded-xl">
                <BorrowCard active={active} />
            </div>
        </div>
    );
}

function Filters({ active, setActive }: FiltersProps) {
    const [locations, setLocations] = useState<Location[]>([]);
    const prevWidthRef = useRef(window.innerWidth);
    const userChoiceRef = useRef(active);

    useEffect(() => {
        getLocations();
    }, [])

    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth;
            const prevWidth = prevWidthRef.current;

            // If we're crossing the 1024px threshold
            if ((prevWidth >= 1024 && width < 1024) || (prevWidth < 1024 && width >= 1024)) {
                // If screen size is increasing past 1024px and the user had previously chosen false
                // Restore the user's choice (which could be true or false)
                if (width >= 1024 && !userChoiceRef.current) {
                    setActive(userChoiceRef.current);
                } else {
                    // If screen size is decreasing below 1024px, force true and remember the user's choice
                    userChoiceRef.current = active; // Remember the current state before forcing true
                    setActive(false);
                }
            }
            
            prevWidthRef.current = width; // Update the current width for the next event
        }

        window.addEventListener('resize', handleResize);
        // Call the handler immediately to set the initial state correctly
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, [active, setActive]); // Depend on `active` to remember the last user's choice

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
                        <div className={`cursor-pointer rounded-full p-1 ${active ? 'bg-custom-primary text-white' : 'bg-transparent text-black'}`}
                            onClick={() => setActive(true)}>
                            <ReorderOutlinedIcon />
                        </div>
                        <div className={`cursor-pointer rounded-full p-1 ${!active ? 'bg-custom-primary text-white' : 'bg-transparent text-black'}`}
                            onClick={() => setActive(false)}>
                            <AppsOutlinedIcon />
                        </div>
                    </div>
                    <div className="relative">
                        <ShoppingCartOutlinedIcon fontSize="large" />
                        <div className="rounded-full bg-custom-primary w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                            0
                        </div>
                    </div>
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
                                options={locations.map(location => location.name)}
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
                <div className="bg-gray-100 rounded-lg p-2 flex items-center">
                    <span className="text-gray-500">Filters applied:&nbsp;</span>
                    <div className="bg-gray-300 px-2 rounded-md flex items-center">
                        <ClearIcon fontSize="small" />
                        <span className="text-sm text-gray-600">Name:&nbsp;</span>
                        <span className="text-sm">Building E12</span>
                    </div>
                </div>
            </div>
        </>
    );
}

function BorrowCard({ active }: BorrowCardProps) {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const gridViewClass = "grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4";
    const listViewClass = "flex flex-col bg-white rounded-xl overflow-hidden";


    async function getItems() {
        try {
            const response = await fetch('/api/items');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getItems();
    }, []);

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
            {items.map((item) => (
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
            ))}
        </div>
    );
}