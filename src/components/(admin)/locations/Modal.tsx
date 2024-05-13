'use client';
import { useSnackbar } from "notistack";
import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { TextField } from '@mui/material';
//icons
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useEffect, useState } from "react";
import Button from "@/components/states/Button";
import Tooltip from '@mui/material/Tooltip';

import { Location } from "@/models/Location";

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    onItemsUpdated: () => void;
    selectedItems?: Location[];
    mode: 'add' | 'edit' | 'delete';
    userId: String | null;
    existingNames: string[];
}

export default function Modal({ open, onClose, onItemsUpdated, selectedItems, mode, userId, existingNames }: ModalCardProps) {
    const theme = createTheme({
        palette: {
            primary: {
                main: '#FFA500', // A hex code for a shade of orange
            },
        },
        components: {
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFA500',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFA500',
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        '&.Mui-focused': {
                            color: '#FFA500',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        color: 'inherit', // Uses default text color
                        backgroundColor: 'inherit', // Uses default background color
                        '&:hover': {
                            color: '#FFA500', // Orange text on hover
                            backgroundColor: 'inherit',
                        },
                        textTransform: 'none', // Avoids capitalizing text
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    select: {
                        '&:focus': {
                            backgroundColor: 'inherit', // Avoids changing background on focus
                        },
                    },
                    icon: {
                        color: '#FFA500', // Sets the dropdown icon color
                    },
                },
            },
            MuiAutocomplete: {
                styleOverrides: {
                    root: {
                        '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFA500', // Outlined input border color on focus
                        },
                    },
                    popper: {
                        '& .MuiAutocomplete-paper': {
                            borderColor: '#FFA500', // Border color for the options list
                        },
                    },
                },
            },
        },
    });

    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const items = selectedItems || [];
    const primitiveUserId = userId ? String(userId) : null; // uid from firebase

    // Item error states
    const [nameError, setNameError] = useState('');

    // Item states
    const [name, setName] = useState<string | null>(null);

    const resetErrors = () => {
        setNameError('');
    }

    const resetFields = () => {
        setName(null);
        resetErrors();
    };

    useEffect(() => {
        if (mode === 'edit' && items.length === 1) {
            const item = items[0];
            setName(item.name || null);
        } else if (mode === 'add') {
            // Reset all states to default for adding new item
            resetFields();
        }
    }, [items, mode]);

    const handleSuccess = () => {
        onItemsUpdated();
        onClose();
    };

    const validateFields = () => {
        let isValid = true;
        resetErrors();

        if (!name) {
            setNameError('Name is required.');
            isValid = false;
        } else if (existingNames.includes(name)) {
            setNameError('Name must be unique.');
            isValid = false;
        }

        return isValid;
    };

    const handleAdd = async () => {
        if (!validateFields()) {
            enqueueSnackbar('Please correct the errors before submitting.', { variant: 'error' });
            return;
        }
        // Logic to handle add
        const data = {
            userId: primitiveUserId,
            name: name,
        };

        const response = await fetch(`/api/admin/locations/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Location successfully created', { variant: 'success' });
        } else {
            console.error('Failed to create location');
        }
    };

    const handleEdit = async () => {
        if (!validateFields()) {
            enqueueSnackbar('Please correct the errors before submitting.', { variant: 'error' });
            return;
        }
        // Logic to handle edit
        const data = {
            userId: primitiveUserId,
            id: items[0].id,
            name: name,
        };

        const response = await fetch(`/api/admin/locations/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Location successfully updated', { variant: 'success' });
        } else {
            console.error('Failed to update location');
        }
    };

    const handlePermanentDelete = async () => {
        const data = {
            userId: primitiveUserId,
            id: items[0].id,
        };

        const response = await fetch(`/api/admin/deletelocation/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Location permanently deleted', { variant: 'warning' });
        } else {
            console.error('Failed to permanently delete location');
        }
    };

    const handleMultiPermanentDelete = async () => {
        if (!selectedItems || selectedItems.length === 0) {
            enqueueSnackbar('No locations selected for permanent deletion', { variant: 'info' });
            return;
        }
    
        const ids = selectedItems.map(item => item.id);
    
        // Proceed to delete items after images have been successfully deleted
        const data = {
            userId: primitiveUserId,
            ids: ids,
        };
    
        const response = await fetch(`/api/admin/deletelocations`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });
    
        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Locations permanently deleted', { variant: 'warning' });
            // Update the state or perform any cleanup
        } else {
            console.error('Failed to permanently delete locations');
            enqueueSnackbar('Failed to permanently delete locations', { variant: 'error' });
        }
    };
    
    const renderContent = () => {
        switch (mode) {
            case 'add':
            case 'edit':
                return (
                    <div className="">
                        <div className="flex justify-center">
                            <TextField
                                required
                                label="Name"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='name'
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setNameError('');
                                }}
                                error={!!nameError}
                                helperText={nameError}
                            />
                        </div>
                    </div>
                );
            case 'delete':
                if (!selectedItems) {
                    return <p>No items selected.</p>;
                } else {
                    return (
                        <>
                            {selectedItems.length === 1 && (
                                <div className="flex">
                                    <div className="px-4 grid grid-cols-4 sm:flex sm:w-full">
                                        <div className="col-span-3">
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">Name&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].name} placement="top-start">
                                                    <span>{selectedItems[0].name}</span>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedItems.length > 1 && (
                                <div className="flex justify-center">
                                    <div>
                                        <p className="mb-3 sm:text-xl font-semibold">Are you sure you want to delete {selectedItems.length} locations?</p>
                                        <div>
                                            {selectedItems.map((selectedItem) => (
                                                <div key={selectedItem.id} className="flex items-center gap-3 mt-1">
                                                    <div className="truncate">
                                                        <span className="sm:font-medium sm:text-lg text-gray-400">Location&nbsp;</span><br/>
                                                        <Tooltip title={selectedItem.name} placement="top-start" arrow>
                                                            <span className="sm:text-lg sm:font-medium">{selectedItem.name}</span>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    );
                }
        }
    };

    return (
        <MaterialUIModal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:max-w-[55%] lg:max-w-[50%] rounded-lg shadow-lg max-h-[70%] flex flex-col">
                <ThemeProvider theme={theme}>
                    <div className="flex justify-between items-center py-3 px-4 border-b-2 border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="font-bold my-auto">{mode === 'add'? <LocationOnOutlinedIcon /> : mode === 'edit' ? <LocationOnOutlinedIcon /> : <WarningAmberRoundedIcon className="text-custom-red text-3xl" />}</span>
                            <span className={`font-bold ${mode === 'delete' ? 'text-custom-red' : ''}`}>
                                {mode === 'add' ? 'Add location' : mode === 'edit' ? 'Edit location' :
                                selectedItems?.length === 1 ? "You're about to delete this location. Are you sure?" :
                                "Delete locations"}
                            </span>
                        </div>
                        <div onClick={onClose}>
                            <span><CloseOutlinedIcon /></span>
                        </div>
                    </div>
                    <div id="modal-description" className="modal-body h-full p-3 overflow-y-auto">
                        {renderContent()}
                    </div>
                    <div className="flex justify-around py-3 px-4 border-t-2 border-gray-200">
                        <div onClick={onClose}>
                            <Button 
                                paddingX="px-2"
                                textColor="gray-500" 
                                borderColor="gray-500"
                                textClassName={`font-semibold select-none`} 
                                text="Cancel"
                            />
                        </div>
                        {mode === 'add' && (    // Only show add button if mode is add  
                            <div onClick={handleAdd}>
                                <Button 
                                    icon={<CheckCircleOutlineIcon className="text-xl" />}
                                    textColor="custom-green" 
                                    borderColor="custom-green"
                                    buttonClassName="hover:border-custom-green-hover"
                                    textClassName="font-semibold select-none group-hover:text-custom-green-hover" 
                                    text="Add"
                                />
                            </div>
                        )}
                        {mode === 'edit' && (   
                            <div onClick={handleEdit}>
                                <Button 
                                    icon={<CheckCircleOutlineIcon className="text-xl" />}
                                    textColor="custom-green" 
                                    borderColor="custom-green"
                                    buttonClassName="hover:border-custom-green-hover"
                                    textClassName="font-semibold select-none group-hover:text-custom-green-hover" 
                                    text="Save"
                                />
                            </div>
                        )}
                        {mode === 'delete' && (     // Only show delete button if mode is delete
                            <>
                                <div onClick={() => {
                                    if (selectedItems?.length === 1) {
                                        handlePermanentDelete();
                                    } else {
                                        handleMultiPermanentDelete();
                                    }
                                }}>
                                    <Button 
                                        paddingX="px-2"
                                        textColor="custom-red" 
                                        borderColor="custom-red"
                                        buttonClassName="hover:bg-red-200 transition-colors"
                                        textClassName="font-semibold select-none" 
                                        text="Permanent Delete"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </ThemeProvider>
            </Box>
        </MaterialUIModal>
    );
}