'use client';
import { useSnackbar } from "notistack";
import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
//icons
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Item } from "@/models/Item";
import Button from "@/components/states/Button";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    selectedItems?: Item[];
    mode: 'add' | 'edit' | 'delete';
}

export default function Modal({ open, onClose, selectedItems, mode }: ModalCardProps) {
    const [message, setMessage] = useState<string | null>(null);  // State can be string or null
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup

    // async function handOverItem() {

    //     if (!item) { console.error("error"); return; }
    //     const data = {
    //         itemId: item.id,
    //     };

    //     const response = await fetch(`/api/supervisor/pendingborrows/`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ data: data }),
    //     });

    //     if (response.ok) {
    //         handleSuccess();
    //         enqueueSnackbar('Item succesfully handed over', { variant: 'success' })
    //     } else {
    //         console.error('Failed to update item request');
    //     }
    // };

    // async function receiveItem() {
    //     if (!item) { console.error("error"); return; }
    //     const data = {
    //         itemId: item.id,
    //     };

    //     const response = await fetch(`/api/supervisor/pendingreturns/`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ data: data }),
    //     });

    //     if (response.ok) {
    //         handleSuccess();
    //         enqueueSnackbar('Item succesfully received', { variant: 'success' })
    //     } else {
    //         console.error('Failed to update item request');
    //     }
    // };

    // async function checkItem() {
    //     if (!item) { console.error("error"); return; }
    //     const data = {
    //         itemId: item.id,
    //     };

    //     const response = await fetch(`/api/supervisor/itemrequest/`, {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ data: data }),
    //     });

    //     if (response.ok) {
    //         handleSuccess();
    //     } else {
    //         console.error('Failed to update item request');
    //     }
    // };

    const handleSuccess = () => {
        onClose();
        setMessage("");
    };

    const handleAdd = async () => {
        // Logic to handle add
    };

    const handleEdit = async () => {
        // Logic to handle edit
    };

    async function handleDelete() {
        // Example API endpoint for batch delete
        const idsToDelete = selectedItems?.map(item => item.id);
    
        const response = await fetch('/api/items/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: idsToDelete }),
        });
    
        if (response.ok) {
            enqueueSnackbar('Items successfully deleted', { variant: 'success' });
            onClose(); // Close modal after success
        } else {
            console.error('Failed to delete items');
            enqueueSnackbar('Failed to delete items', { variant: 'error' });
        }
    };

    const renderContent = () => {
        switch (mode) {
            case 'add':
                return (
                    <>
                        <div className="mx-auto w-4/5 bg-gray-100 border-2 border-gray-300 border-dotted p-3 flex flex-col justify-center items-center rounded">
                                <FileUploadOutlinedIcon className="text-gray-600 mb-1.5" />
                                <div className="text-sm">
                                    <span className="text-blue-500">Click to upload</span><span> or drag and drop</span>
                                </div>
                                <span className="text-xs text-gray-400">JPG,JPEG,PNG less then 5MB.</span>
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Name"
                                size="small"
                                className='w-4/5'
                                name='name'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Model"
                                size="small"
                                className='w-4/5'
                                name='model'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Brand"
                                size="small"
                                className='w-4/5'
                                name='brand'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-4/5" size="small">
                                <InputLabel required id="roles-label">Roles</InputLabel>
                                <Select
                                    labelId="roles-label"
                                    id="roles"
                                    label="Roles"
                                >
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-4/5" size="small">
                                <InputLabel required id="location-label">Location</InputLabel>
                                <Select
                                    labelId="location-label"
                                    id="location"
                                    label="Location"
                                >
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Year"
                                size="small"
                                className='w-4/5'
                                name='year'
                                type="number"
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-4/5" size="small">
                                <InputLabel required id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="status"
                                    label="Status"
                                >
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-4/5" size="small">
                                <InputLabel required id="availability-label">Availability</InputLabel>
                                <Select
                                    labelId="availability-label"
                                    id="availability"
                                    label="Availability"
                                >
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Notes"
                                size="small"
                                className='w-4/5'
                                name='notes'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="School number"
                                size="small"
                                className='w-4/5'
                                name='school number'
                                />
                        </div>
                    </>
                );
            case 'edit':
                return (
                    <>
                        <TextField
                            label="Item Name"
                            variant="outlined"
                            defaultValue="Test"
                            fullWidth
                        />
                    </>
                );
            case 'delete':
                if (!selectedItems) {
                    return <p>No items selected.</p>;
                } else {
                    return (
                        <p>Are you sure you want to delete {selectedItems.length > 1 ? 'these items' : 'this item'}?</p>
                    );
                }
        }
    };

    const handleAction = () => {
        switch (mode) {
            case 'add':
                handleAdd();
                break;
            case 'edit':
                handleEdit();
                break;
            case 'delete':
                handleDelete();
                break;
        }
    };

    return (
        <MaterialUIModal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[50%] rounded-lg shadow-lg h-[70%] flex flex-col">
                <div className="flex justify-between py-3 px-4 border-b-2 border-gray-200">
                    <div className="flex gap-2">
                        <span className="font-bold">{mode === 'add'? <Inventory2OutlinedIcon /> : mode === 'edit' ? <Inventory2OutlinedIcon /> : <WarningAmberRoundedIcon />}</span>
                        <span className="font-bold">{mode === 'add'? 'Add product' : mode === 'edit' ? 'Edit product' : 'Delete product'}</span>
                    </div>
                    <div onClick={onClose}>
                        <span><CloseOutlinedIcon /></span>
                    </div>
                </div>
                <div id="modal-description" className="modal-body h-full py-3 overflow-y-auto">
                    {renderContent()}
                </div>
                <div className="flex justify-around py-3 px-4 border-t-2 border-gray-200">
                    <div onClick={onClose}>
                        <Button 
                            paddingX="px-2"
                            textColor="gray-500" 
                            borderColor="gray-500"
                            textClassName={`font-semibold ${mode === 'delete' ? 'text-xs' : ''}`} 
                            text="Cancel"
                        />
                    </div>
                    {mode === 'add' && (    // Only show add button if mode is add  
                        <div>
                            <Button 
                                icon={<CheckCircleOutlineIcon className="text-xl" />}
                                textColor="custom-green" 
                                borderColor="custom-green"
                                textClassName="font-semibold" 
                                text="Add"
                            />
                        </div>
                    )}
                    {mode === 'edit' && (   
                        <div>
                            <Button 
                                icon={<CheckCircleOutlineIcon className="text-xl" />}
                                textColor="custom-green" 
                                borderColor="custom-green"
                                textClassName="font-semibold" 
                                text="Save"
                            />
                        </div>
                    )}
                    {mode === 'delete' && (     // Only show delete button if mode is delete
                        <>
                            <div>
                                <Button 
                                    paddingX="px-2"
                                    textColor="custom-dark-blue" 
                                    borderColor="custom-dark-blue"
                                    textClassName="font-semibold text-xs" 
                                    text="Soft Delete"
                                />
                            </div>
                            <div>
                                <Button 
                                    paddingX="px-2"
                                    textColor="custom-red" 
                                    borderColor="custom-red"
                                    textClassName="font-semibold text-xs" 
                                    text="Permanent Delete"
                                />
                            </div>
                        </>
                    )}
                </div>
            </Box>
        </MaterialUIModal>
    );
}