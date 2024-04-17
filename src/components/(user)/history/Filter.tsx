'use client';
import Tooltip from "@mui/material/Tooltip";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
//icons
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ReorderOutlinedIcon from '@mui/icons-material/ReorderOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import { ItemRequest } from "@/models/ItemRequest";

interface FiltersProps { // typescript moment, everthing should have a type
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
    onFilterChange: (filterType: string, filterValue: string) => void;
    items: ItemRequest[] | [];
    totalItemCount: number | 0;
    userId: string | null;
}

export default function Filters({ active, setActive, onFilterChange, items, userId }: FiltersProps) {
    const prevWidthRef = useRef(window.innerWidth);
    const lastActiveRef = useRef<boolean | null>(null);
    const [name, setName] = useState('');

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

    const handleNameChange = (value: string | null) => {
        onFilterChange('name', value || '');
        setName(value || '');
    };

    const resetName = () => {
        setName('');
        onFilterChange('name', '');
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
                    <h1 className="font-semibold text-2xl">History</h1>
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
                                options={[...new Set(items.map(item => item.item.name))]} // Ensure unique names
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
                </div>
            </div>
        </>
    );
}