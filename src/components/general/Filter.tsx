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
import Menu from '@mui/material/Menu';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import OutlinedInput from '@mui/material/OutlinedInput';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import React from "react";
import { DateRangePicker } from "@nextui-org/react";
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

interface Filter {
    label: string;
    state: [string, Dispatch<SetStateAction<string>>];
    inputType: 'text' | 'dateRange' | 'multipleSelect';
}

interface FiltersProps {
    title: string;
    icon: JSX.Element;
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>;
    onFilterChange: (filterType: string, filterValue: string) => void;
    onSortChange: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
    filters: Filter[];
    items: Item[];
    openModal: (id: number) => void;
    userId: string | null;
    sortOptions: string[];
    isCardView: boolean;
}

export default function Filters({ title, icon, active, setActive, onFilterChange, onSortChange, filters, items, openModal, userId, sortOptions, isCardView }: FiltersProps) {
    const prevWidthRef = useRef<number | null>(null);
    const lastActiveRef = useRef<boolean | null>(null);
    const [sortBy, setSortBy] = useState('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
                    <div className="grid grid-cols-2 gap-4 mb-4 lg:grid-cols-4">
                        {filters.map((filter, index) => (
                            <div key={index}>
                                {filter.inputType === 'text' && (
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
                                )}
                                {filter.inputType === 'dateRange' && (
                                    <DateRangePicker
                                        label={filter.label}
                                        className="max-w-xs"
                                    />
                                )}
                                {filter.inputType === 'multipleSelect' && (
                                    <MultipleSelectCheckmarks
                                        label={filter.label}
                                        options={names}
                                        selected={filter.state[0]}
                                        onChange={(selected) => handleFilterChange(filter.label, selected.join(','))}
                                    />
                                )}
                            </div>
                        ))}
                        <div>
                        <Button onClick={handleSortClick} startIcon={<SwapVertRoundedIcon />} endIcon={<KeyboardArrowRightRoundedIcon />} className="" >
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

function MultipleSelectCheckmarks({ label, options, selected, onChange }: { label: string; options: string[]; selected: string; onChange: (selected: string[]) => void }) {
    const [personName, setPersonName] = useState<string[]>(selected.split(','));

    const handleChange = (event: SelectChangeEvent<typeof personName>) => {
        const {
            target: { value },
        } = event;
        setPersonName(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;

    const MenuProps = {
        PaperProps: {
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
          },
        },
      };

    useEffect(() => {
        onChange(personName);
    }, [personName, onChange]);

    return (
        <div>
                <InputLabel id={`multiple-select-label-${label}`}>{label}</InputLabel>
                <Select
                    labelId={`multiple-select-label-${label}`}
                    id={`multiple-select-${label}`}
                    multiple
                    value={personName}
                    onChange={handleChange}
                    input={<OutlinedInput label={label} />}
                    renderValue={(selected) => selected.join(', ')}
                    MenuProps={MenuProps}
                >
                    {options.map((name) => (
                        <MenuItem key={name} value={name}>
                            <Checkbox checked={personName.indexOf(name) > -1} />
                            <ListItemText primary={name} />
                        </MenuItem>
                    ))}
                </Select>
        </div>
    );
}