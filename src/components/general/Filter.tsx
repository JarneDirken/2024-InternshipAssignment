import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Item } from "@/models/Item";
import { Location } from "@/models/Location";
import { getAuth, getIdToken } from "firebase/auth";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import Tooltip from "@mui/material/Tooltip";
import ClearIcon from '@mui/icons-material/Clear';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

interface Filter {
    label: string;
    state: [string, Dispatch<SetStateAction<string>>];
}

interface FiltersProps {
    title: string;
    icon: JSX.Element;
    onFilterChange: (filterType: string, filterValue: string) => void;
    onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
    filters: Filter[];
    items: Item[];
    openModal: (id: number) => void;
    userId: string | null;
    sortOptions: string[];
}

export default function Filters({ title, icon, onFilterChange, onSortChange, filters, items, openModal, userId, sortOptions}: FiltersProps) {
    const [sortBy, setSortBy] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setAnchorEl(null);
    };

    const handleSortOptionSelect = (sortByOption: string) => {
        if (sortByOption === sortBy) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(sortByOption);
            setSortDirection('asc');
        }
        onSortChange(sortByOption, sortDirection);
        setAnchorEl(null);
    };

    const handleFilterChange = (label: string, value: string | null) => {
        onFilterChange(label, value || '');
        filters.find(filter => filter.label === label)?.state[1](value || '');
    };

    const handleReset = (label: string) => {
        const filter = filters.find(filter => filter.label === label);
        if (filter) {
            filter.state[1]('');
            onFilterChange(label, '');
        }
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
            MuiButton: {
                styleOverrides: {
                    root: {
                        color: 'inherit', // Use the default text color
                        backgroundColor: 'inherit', // Use the default background color
                        fontWeight: 'normal', // Set the font weight to normal
                        '&:hover': {
                            color: 'orange', // Change text color on hover to orange
                            backgroundColor: 'inherit',
                        },
                        textTransform: 'none',
                    },
                    startIcon: {
                        fontWeight: 'normal', // Set the font weight for start icon to normal
                    },
                    endIcon: {
                        fontWeight: 'normal', // Set the font weight for end icon to normal
                    },
                },
            },
        },
    });

    return (
        <>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    {icon}
                    <h1 className="font-semibold text-2xl">{title}</h1>
                </div>
            </div>
            <div className="p-4">
                <ThemeProvider theme={theme}>
                    <div className="grid grid-cols-2 gap-4 mb-4 lg:grid-cols-4">
                        {filters.map((filter, index) => (
                            <div key={index}>
                                <Autocomplete
                                    disablePortal
                                    size="small"
                                    value={filter.state[0] || null}
                                    onChange={(event, value) => handleFilterChange(filter.label, value)}
                                    options={[...new Set(items.map(item => item.name))]}
                                    isOptionEqualToValue={(option, value) => option === value}
                                    sx={{ width: '100%' }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={filter.label}
                                            placeholder="Search"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    )}
                                />
                            </div>
                        ))}
                        <div>
                        <Button onClick={handleSortClick} startIcon={<SwapVertRoundedIcon />} endIcon={<KeyboardArrowRightRoundedIcon />} >
                            Sort by {sortBy ? sortBy : 'Select'} {sortDirection === 'asc' ? <ArrowDownwardRoundedIcon fontSize="inherit" /> : <ArrowUpwardRoundedIcon fontSize="inherit" />}
                        </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleSortClose}
                            >
                                {sortOptions.map(option => (
                                    <MenuItem key={option} onClick={() => handleSortOptionSelect(option)}>{option}</MenuItem>
                                ))}
                            </Menu>
                        </div>
                    </div>
                </ThemeProvider>
                <div className="bg-gray-100 rounded-lg p-2 flex items-center gap-2 flex-wrap">
                    <span className="text-gray-500">Filters applied:&nbsp;</span>
                    {filters.map((filter, index) => (
                        filter.state[0] && (
                            <div key={index} className="bg-gray-300 px-2 rounded-md flex items-center truncate">
                                <ClearIcon fontSize="small" className="cursor-pointer" onClick={() => handleReset(filter.label)} />
                                <span className="text-sm text-gray-600">{filter.label}:&nbsp;</span>
                                <span className="text-sm">{filter.state[0]}</span>
                            </div>
                        )
                    ))}
                </div>
            </div>
        </>
    );
}