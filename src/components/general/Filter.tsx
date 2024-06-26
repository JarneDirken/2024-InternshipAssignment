'use client';
import { Dispatch, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Item } from "@/models/Item";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppsOutlinedIcon from '@mui/icons-material/AppsOutlined';
import ReorderOutlinedIcon from '@mui/icons-material/ReorderOutlined';
import Tooltip from "@mui/material/Tooltip";
import ClearIcon from '@mui/icons-material/Clear';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Menu from '@mui/material/Menu';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ListItemText from '@mui/material/ListItemText';
import React from "react";
import DateRangePicker from "@/components/states/DateRangePicker";
import FormControl from '@mui/material/FormControl';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { ItemRequest } from "@/models/ItemRequest";
import { Filter } from "@/models/Filter";
import { Repair } from "@/models/Repair";
import { User } from "@/models/User";
import { Location } from "@/models/Location";
import { SortOptions } from "@/models/SortOptions";

interface FiltersProps {
    title: string;
    icon: JSX.Element;
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
    onFilterChange: (filterType: string, filterValue: string) => void;
    onSortChange?: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
    filters: Filter[];
    items: Item[] | ItemRequest[] | Repair[] | User[] | Location[];
    sortOptions?: SortOptions[];
    isCardView?: boolean;
    isSort?: boolean;
}

export default function Filters({ title, icon, active, setActive, onFilterChange, onSortChange, filters, items, sortOptions, isCardView, isSort }: FiltersProps) {
    const prevWidthRef = useRef<number | null>(null);
    const lastActiveRef = useRef<boolean | null>(null);
    const [resetKeys, setResetKeys] = useState<Record<string, number>>({});
    const [sortBy, setSortBy] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [sortLabel, setSortLabel] = useState<string>('');

    const [borrowDate, setBorrowDate] = useState<Date | null>(null); // borrow date
    const [returnDate, setReturnDate] = useState<Date | null>(null); // return date
    const [errorMessage, setErrorMessage] = useState<String | null>(null); // error message with dates

    useLayoutEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const prevWidth = prevWidthRef.current;

            if (prevWidth && prevWidth >= 1280 && width < 1280) {
                lastActiveRef.current = active; // Store active only when crossing the boundary from large to small
                setActive(false);
            } else if (prevWidth && prevWidth < 1280 && width >= 1280) {
                // Only restore active when crossing the boundary from small to large
                if (lastActiveRef.current !== null) {
                    setActive(lastActiveRef.current);
                }
            }

            prevWidthRef.current = width;
        };

        handleResize(); // Initial call to set the previous width

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [active, setActive]);

    // Separate useEffect for initial load
    useEffect(() => {
        if (window.innerWidth < 1280) {
            setActive(false);
        }
    }, [setActive]);

    useEffect(() => {
        // Initialize reset keys for all filters
        const keys: Record<string, number> = {};
        filters.forEach(filter => {
            if (filter.inputType === 'multipleSelect') {
                keys[filter.label] = 0;  // Initialize reset key for each filter
            }
        });
        setResetKeys(keys);
    }, [filters]);

    const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setAnchorEl(null);
    };

    const handleSortOptionSelect = (option: SortOptions) => {
        const newSortBy = option.optionsKey;
        let newSortDirection = sortDirection;
    
        if (newSortBy === sortBy) {
            newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'; // Calculate the new direction first
        } else {
            newSortDirection = 'asc'; // Default to 'asc' when a new sort field is selected
        }
    
        setSortBy(newSortBy);
        setSortDirection(newSortDirection); // Update state with the new direction
        setSortLabel(option.label); // Update the sort label
        onSortChange!(newSortBy, newSortDirection); // Pass the new direction to the change handler
        setAnchorEl(null);
    };     

    const getSortLabelFromKey = (sortByKey: string) => {
        const option = sortOptions!.find(option => option.optionsKey === sortByKey);
        return option ? option.label : 'Select';
    };    

    const handleFilterChange = (label: string, value: string | null) => {
        onFilterChange(label, value || '');
        filters.find(filter => filter.label === label)?.state[1](value || '');
    };

    const handleMultiSelectFilterChange = (label: string, values: string[]) => {
        // Update the filter state specifically designed to handle string arrays
        const filter = filters.find(f => f.label === label);
        if (filter) {
            filter.state[1](values.join(', ')); // Directly use the array
        }
        onFilterChange(label, values.join(', ')); // Assuming your backend can handle comma-separated values
    };

    const [resetKey, setResetKey] = useState(0);

    const handleReset = (label: string) => {
        const filter = filters.find(filter => filter.label === label);
        if (filter) {
            if (filter.inputType === 'multipleSelect') {
                setResetKeys(prevKeys => ({
                    ...prevKeys,
                    [label]: prevKeys[label] + 1
                }));
                filter.state[1](null);  // Set the state to an empty array for multiple selects
            } else if (filter.inputType === 'dateRange') {
                // Special handling for date range resets
                setBorrowDate(null);
                setReturnDate(null);
                setResetKey(oldKey => oldKey + 1);
            } else {
                filter.state[1]('');
                onFilterChange(label, '');
            }
            // Reset the filter state
        }
    };

    const handleSortReset = () => {
        setSortBy('');
        setSortLabel('');
        setSortDirection('desc');  // Reset to default sort direction or choose a reasonable default
        onSortChange!('', 'desc');  // Notify the system that sorting has been reset
    };
    
    const getYearOrString = (value: string | null): string | null => {
        if (!value) return null;
        const date = new Date(value);
        // Check if the date conversion is valid by checking the time value for NaN
        const isValidDate = !isNaN(date.getTime()) && value.length >= 10 && value[4] === '-' && value[7] === '-';
        return isValidDate ? date.getUTCFullYear().toString() : value;
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
            MuiCheckbox: {
                styleOverrides: {
                    root: {
                        '&.Mui-checked': {
                            color: 'orange', // Set checkbox color to orange when checked
                        },
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: {
                        '&.Mui-selected': {
                            backgroundColor: '#FFF7E0', // Change background color to a slightly darker orange when selected
                        },
                        '&.Mui-selected:hover': {
                            backgroundColor: '#FFE4B5', // Change background color to a slightly darker orange when selected
                        },
                        '&.Mui-selected.Mui-focusVisible': {
                            backgroundColor: '#FFE4B5', // Change background color to a slightly darker orange when selected
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
                    {icon}
                    <h1 className="font-semibold text-2xl">{title}</h1>
                </div>
                {isCardView && (
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
                )}
            </div>
            <div className="p-4">
                <ThemeProvider theme={theme}>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {filters.map((filter, index) => (
                            <div key={index}>
                                {(filter.inputType === 'text' && filter.optionsKey) && (
                                    <Autocomplete
                                        disablePortal
                                        size="small"
                                        value={filter.state[0] || null}
                                        onChange={(event, value) => handleFilterChange(filter.label, value)}
                                        options={[
                                            ...new Set(items.map(item => {
                                                const keys = filter.optionsKey!.split('.');
                                                let result = item as any;
                                                for (const key of keys) {
                                                    result = result && result[key] ? result[key] : null;
                                                    if (result === null) break;
                                                }
                                                return result ? getYearOrString(result) : null;
                                            }).filter(option => option !== null && option !== undefined))
                                        ]}
                                        isOptionEqualToValue={(option, value) => option === value}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={filter.label}
                                                placeholder="Search"
                                                InputLabelProps={{ shrink: true }}
                                            />)
                                        }
                                    />
                                )}
                                {filter.inputType === 'dateRange' && (
                                    <DateRangePickerWrapper
                                        key={resetKey}
                                        borrowDate={borrowDate}
                                        returnDate={returnDate}
                                        setBorrowDate={setBorrowDate}
                                        setReturnDate={setReturnDate}
                                        setErrorMessage={setErrorMessage}
                                        label={filter.label}
                                        onChange={(formattedDateRange) => handleFilterChange(filter.label, formattedDateRange)}
                                    />
                                )}
                                {filter.inputType === 'multipleSelect' && (
                                    <>
                                        <Autocomplete
                                            key={resetKeys[filter.label]}
                                            size="small"
                                            multiple
                                            options={filter.options || []}
                                            onChange={(event, value) => handleMultiSelectFilterChange(filter.label, value)}
                                            disableCloseOnSelect
                                            getOptionLabel={(option) => option}
                                            renderOption={(props, option, { selected }) => (
                                                <li {...props} key={option}>
                                                    <Checkbox
                                                        icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                                                        checkedIcon={<CheckBoxIcon fontSize="small" />}
                                                        style={{ marginRight: 8 }}
                                                        checked={selected}
                                                    />
                                                    {option}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Availability" placeholder="Select" InputLabelProps={{ shrink: true }}  />
                                            )}
                                        />
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                    {isSort && (
                        <div>
                            <Button 
                                onClick={handleSortClick} 
                                startIcon={<SwapVertRoundedIcon />} 
                                endIcon={<KeyboardArrowRightRoundedIcon />} 
                                sx={{
                                    fontSize: { xs: '0.8rem', sm: '1rem' }, // Smaller font on extra-small screens
                                    '& .MuiButton-startIcon, & .MuiButton-endIcon': {
                                        fontSize: { xs: '15px', sm: '24px' } // Adjust icon sizes as well
                                    },
                                    whiteSpace: "nowrap", // Prevent text from wrapping
                                    minWidth: "170px", // Minimum width to avoid squeezing on small screens
                                    paddingTop: "6px" // Ensure padding is sufficient but not too large
                                }} 
                            >
                            Sort by {getSortLabelFromKey(sortBy)} {sortDirection === 'desc' ? <ArrowDownwardRoundedIcon fontSize="inherit" /> : <ArrowUpwardRoundedIcon fontSize="inherit" />}
                            </Button>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleSortClose}
                            >
                                {sortOptions?.map(option => (
                                    <MenuItem key={option.label} onClick={() => handleSortOptionSelect(option)}>{option.label}</MenuItem>
                                ))}
                            </Menu>
                        </div>
                    )}
                </ThemeProvider>
                <div className={`bg-gray-100 rounded-lg p-2 flex items-center gap-2 flex-wrap ${isSort ? '' : 'mt-4'}`}>
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
                    {sortBy && (
                        <div className="bg-gray-300 px-2 rounded-md flex items-center truncate">
                            <ClearIcon fontSize="small" className="cursor-pointer" onClick={handleSortReset} />
                            <span className="text-sm text-gray-600">Sort by:&nbsp;</span>
                            <span className="text-sm">{`${sortLabel} (${sortDirection.toUpperCase()})`}</span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

interface DateRangePickerWrapperProps {
    label: string;
    borrowDate: Date | null;
    returnDate: Date | null;
    setBorrowDate: (date: Date | null) => void;
    setReturnDate: (date: Date | null) => void;
    setErrorMessage: (message: string | null) => void;
    onChange: (value: string) => void;
}

function DateRangePickerWrapper({ label, borrowDate, returnDate, setBorrowDate, setReturnDate, setErrorMessage, onChange }: DateRangePickerWrapperProps) {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    useEffect(() => {
        // Update the input field whenever dates change
        const formattedDateRange = borrowDate && returnDate
            ? `${borrowDate.toLocaleDateString()} - ${returnDate.toLocaleDateString()}`
            : borrowDate
            ? `${borrowDate.toLocaleDateString()} - `
            : '';
        onChange(formattedDateRange);
    }, [borrowDate, returnDate, onChange]);

    const handleDayClick = () => {
        // Close the picker after selecting the end date
        setIsPickerOpen(false);
    };

    const handleClearDates = () => {
        setBorrowDate(null);
        setReturnDate(null);
        setErrorMessage(null);
        setResetKey(prev => prev + 1);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <TextField
                label={label}
                value={
                    borrowDate && returnDate
                    ? `${borrowDate.toLocaleDateString()} - ${returnDate.toLocaleDateString()}`
                    : borrowDate
                    ? `${borrowDate.toLocaleDateString()} - `
                    : ''
                }
                placeholder="Select Dates"
                size="small"
                sx={{ width: '100%' }}
                onClick={() => setIsPickerOpen(true)}
                onFocus={() => setIsPickerOpen(true)}
                InputLabelProps={{
                    shrink: true,  // Make label float at all times
                }}
                InputProps={{
                    readOnly: true,
                    endAdornment: (
                        (borrowDate || returnDate) && (
                            <IconButton
                                onClick={handleClearDates}
                                edge="end"
                            >
                                <CloseIcon />
                            </IconButton>
                        )
                    ),
                }}
            />
            <div style={{ position: 'absolute', zIndex: 1000, display: isPickerOpen ? 'block' : 'none' }}>
                <DateRangePicker
                    key={resetKey}
                    borrowDate={borrowDate}
                    returnDate={returnDate}
                    setBorrowDate={setBorrowDate}
                    setReturnDate={setReturnDate}
                    setErrorMessage={setErrorMessage}
                    handleDayClick={handleDayClick}
                />
            </div>
        </div>
    );
}