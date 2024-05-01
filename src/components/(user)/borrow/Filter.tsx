'use client';
import { Item } from "@/models/Item";
import Tooltip from "@mui/material/Tooltip";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import useCart from "@/hooks/useCart";
import Button from "@/components/states/Button";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { createRequest } from "@/services/store";
//icons
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ReorderOutlinedIcon from '@mui/icons-material/ReorderOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from "@mui/material/IconButton";

interface FiltersProps { // typescript moment, everthing should have a type
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
    onFilterChange: (filterType: string, filterValue: string) => void;
    items: Item[];
    userId: String | null;
}

export default function Filters({ active, setActive, onFilterChange, items, userId }: FiltersProps) {
    const prevWidthRef = useRef(window.innerWidth);
    const lastActiveRef = useRef<boolean | null>(null);
    const [name, setName] = useState('');
    const [model, setModel] = useState('');
    const [brand, setBrand] = useState('');
    const [location, setLocation] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { cart, addToCart, removeFromCart, clearCart } = useCart();
    const { enqueueSnackbar } = useSnackbar();
    const [request, setRequest] = useRecoilState(createRequest);

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
        const handleResize = () => {
            const width = window.innerWidth;
            const prevWidth = prevWidthRef.current;

            if (prevWidth >= 1280 && width < 1280) {
                lastActiveRef.current = active; // Store active only when crossing the boundary from large to small
                setActive(false);
            } else if (prevWidth < 1280 && width >= 1280) {
                // Only restore active when crossing the boundary from small to large
                if (lastActiveRef.current !== null) {
                    setActive(lastActiveRef.current);
                }
            }

            prevWidthRef.current = width;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [active, setActive]);

    // Separate useEffect for initial load
    useEffect(() => {
        if (window.innerWidth < 1280) {
            setActive(false);
        }
    }, [setActive]);

    async function borrowAllItems() {
        let allSuccessful = true;
        for (const cartItem of cart) {
            const data = {
                itemId: cartItem.item.id,
                requestStatusId: 1,
                borrowerId: userId,
                requestDate: new Date().toISOString(),
                startBorrowDate: cartItem.borrowDetails.startDateTime,
                endBorrowDate: cartItem.borrowDetails.endDateTime,
                file: cartItem.borrowDetails.file,
                isUrgent: cartItem.borrowDetails.isUrgent,
                amountRequest: cartItem.borrowDetails.amountRequest,
            };
    
            try {
                const response = await fetch(`/api/user/itemrequest/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ data: data }),
                });
    
                if (response.ok) {
                    // Handle individual success
                    enqueueSnackbar(`Item ${cartItem.item.name} succesfully borrowed!`, { variant: 'success' });
                    removeFromCart(cartItem.item.id);
                } else {
                    // Handle individual failure
                    console.error(`Failed to create item request for item ${cartItem.item.id}`);
                    enqueueSnackbar(`Failed to borrow ${cartItem.item.name}!`, { variant: 'error' });
                    allSuccessful = false;
                    setRequest(!request);
                }
            } catch (error) {
                // Handle fetch error
                console.error(`Fetch error for item ${cartItem.item.id}:`, error);
                allSuccessful = false;
                setRequest(!request);
            }
        }
        if (allSuccessful) {
            enqueueSnackbar('All items successfully borrowed!', { variant: 'success' });
            clearCart();
            setRequest(!request);
        }
    };

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
                    <div className="xl:flex items-center gap-1 hidden">
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
                        <div className="relative">
                            <div onClick={handleMenuOpen}>
                                <ShoppingCartOutlinedIcon fontSize="large" className="cursor-pointer" />
                            </div>
                            <div className="rounded-full bg-custom-primary w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                                {cart.length}
                            </div>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                className="cursor-pointer"
                            >
                                {cart.length > 0 ? (
                                    cart.map((item) => (
                                        <MenuItem key={item.item.id} onClick={handleMenuClose}>
                                            <div className="flex justify-between items-center w-full">
                                                <span onClick={(e) => {
                                                    e.stopPropagation();
                                                }}>
                                                    {item.item.name}
                                                </span>
                                                <IconButton
                                                    edge="end"
                                                    aria-label="remove"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFromCart(item.item.id);
                                                        enqueueSnackbar('Item successfully removed from cart', { variant: 'success' });
                                                    }}
                                                    size="small"
                                                    className="justify-end"
                                                >
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </div>
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem onClick={handleMenuClose}>No items</MenuItem>
                                )}

                                {cart.length > 0 && (
                                    <MenuItem className="justify-center">
                                        <Button 
                                            text="Borrow All"
                                            fillColor="custom-primary"
                                            borderColor="custom-primary"
                                            textColor="white" 
                                            onClick={() => {
                                                borrowAllItems();
                                                handleMenuClose();
                                            }}
                                         />
                                    </MenuItem>
                                )}
                            </Menu>
                        </div>
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
                                options={[...new Set(items.map(item => item.location.name))]} // Ensure unique locations
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