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
import { ClearIcon } from "@mui/x-date-pickers/icons";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Item } from "@/models/Item";
import Button from "@/components/states/Button";
import { Checkbox, FormControl, FormGroup, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip';

import { Role } from "@/models/Role";
import { Location } from "@/models/Location";
import { ItemStatus } from "@/models/ItemStatus";

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    selectedItems?: Item[];
    roles: Role[];
    locations: Location[];
    itemStatuses: ItemStatus[];
    mode: 'add' | 'edit' | 'delete';
    userId: String | null;
}

export default function Modal({ open, onClose, selectedItems, mode, userId, roles, locations, itemStatuses }: ModalCardProps) {
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

    const [message, setMessage] = useState<string | null>(null);  // State can be string or null
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup

    const items = selectedItems || [];

    // File upload states
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null); // file url from firebase
    const primitiveUserId = userId ? String(userId) : null; // uid from firebase

    // Item states
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [model, setModel] = useState('');
    const [brand, setBrand] = useState('');
    const [year, setYear] = useState<Dayjs | null>(dayjs());
    const [notes, setNotes] = useState('');
    const [schoolNumber, setSchoolNumber] = useState<string | null>(null);
    const [itemActive, setItemActive] = useState(true);
    const [consumable, setConsumable] = useState(false);
    const [amount, setAmount] = useState<string | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('');
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [selectedItemStatusId, setSelectedItemStatusId] = useState<number | ''>('');

    const resetFields = () => {
        setFileUrl(null);
        setFile(null);
        setName('');
        setNumber('');
        setModel('');
        setBrand('');
        setYear(dayjs());
        setNotes('');
        setSchoolNumber(null);
        setItemActive(true);
        setConsumable(false);
        setAmount(null);
        setSelectedRoleId('');
        setSelectedLocation(null);
        setSelectedItemStatusId('');
    };

    useEffect(() => {
        if (mode === 'edit' && items.length === 1) {
            const item = items[0];
            setFileUrl(item.image || null);
            setName(item.name || '');
            setNumber(item.number || '');
            setModel(item.model || '');
            setBrand(item.brand || '');
            setYear(item.yearBought ? dayjs(item.yearBought) : dayjs());
            setNotes(item.notes || '');
            setSchoolNumber(item.schoolNumber || null);
            setItemActive(item.active);
            setConsumable(item.consumable);
            setAmount(item.amount ? item.amount.toString() : null);
            setSelectedRoleId(item.RoleItem && item.RoleItem.length > 0 ? item.RoleItem[0].roleId : '');
            setSelectedItemStatusId(item.itemStatusId || '');
            setSelectedLocation(item.location || null);
        } else if (mode === 'add') {
            // Reset all states to default for adding new item
            resetFields();
        }
    }, [items, mode]);

    const handleSuccess = () => {
        onClose();
    };

    const handleAdd = async () => {
        // Logic to handle add
        const data = {
            locationId: selectedLocation?.id,
            itemStatusId: selectedItemStatusId,
            yearBought: year,
            active: itemActive,
            brand: brand,
            model: model,
            name: name,
            notes: notes,
            number: number,
            schoolNumber: schoolNumber,
            image: fileUrl,
            consumable: consumable,
            amount: amount,
            roleId: selectedRoleId,
            userId: primitiveUserId,
        };

        const response = await fetch(`/api/admin/products/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            setFile(null);
            setFileUrl('');
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            handleSuccess();
            enqueueSnackbar('Product successfully created', { variant: 'success' });
        } else {
            console.error('Failed to create product');
        }
    };

    const handleEdit = async () => {
        // Logic to handle edit
        const data = {
            id: items[0].id,
            locationId: selectedLocation?.id,
            itemStatusId: selectedItemStatusId,
            yearBought: year,
            active: itemActive,
            brand: brand,
            model: model,
            name: name,
            notes: notes,
            number: number,
            schoolNumber: schoolNumber,
            image: fileUrl,
            consumable: consumable,
            amount: amount,
            roleId: selectedRoleId,
            userId: primitiveUserId,
        };

        const response = await fetch(`/api/admin/products/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            setFile(null);
            setFileUrl('');
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            handleSuccess();
            enqueueSnackbar('Product successfully updated', { variant: 'success' });
        } else {
            console.error('Failed to update product');
        }
    };

    const handleSoftDelete = async () => {
        // Logic to handle edit
        const data = {
            userId: primitiveUserId,
            id: items[0].id,
        };

        const response = await fetch(`/api/admin/deleteproduct/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Product soft deleted', { variant: 'warning' });
        } else {
            console.error('Failed to soft delete product');
        }
    };

    const handlePermanentDelete = async () => {
        // Check if there is an image to delete
        if (items[0]?.image) {
            const storage = getStorage();
            const imageRef = ref(storage, items[0].image);
    
            try {
                await deleteObject(imageRef);
                console.log('Image successfully deleted from Firebase Storage');
                // Proceed with deleting the item after the image has been successfully deleted
                deleteItem();
            } catch (error) {
                console.error('Failed to delete image from Firebase:', error);
                enqueueSnackbar('Failed to delete image associated with the product', { variant: 'error' });
                // Optionally stop the deletion process if the image fails to delete
                return;
            }
        } else {
            // No image to delete, proceed with deleting the item
            deleteItem();
        }
    };

    const deleteItem = async () => {
        const data = {
            userId: primitiveUserId,
            id: items[0].id,
            roleId: items[0].RoleItem?.[0]?.roleId ?? '',
        };

        const response = await fetch(`/api/admin/deleteproduct/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Product permanently deleted', { variant: 'warning' });
        } else {
            console.error('Failed to permanently delete product');
        }
    };

    const handleMultiSoftDelete = async () => {
        if (!selectedItems || selectedItems.length === 0) {
            enqueueSnackbar('No products selected for soft deletion', { variant: 'info' });
            return;
        }

        const ids = selectedItems.map(item => item.id);
    
        const data = {
            userId: primitiveUserId,
            ids: ids,
        };
    
        const response = await fetch(`/api/admin/deleteproducts`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });
    
        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Products soft deleted', { variant: 'warning' });
            // Update the state or perform any cleanup
        } else {
            console.error('Failed to soft delete products');
            enqueueSnackbar('Failed to soft delete products', { variant: 'error' });
        }
    };

    const handleMultiPermanentDelete = async () => {
        if (!selectedItems || selectedItems.length === 0) {
            enqueueSnackbar('No products selected for permanent deletion', { variant: 'info' });
            return;
        }
    
        const ids = selectedItems.map(item => item.id);
        const itemsWithImages = selectedItems.filter(item => item.image);
    
        // Delete images first
        for (const item of itemsWithImages) {
            const storage = getStorage();
            const imageRef = ref(storage, item.image);
    
            try {
                await deleteObject(imageRef);
                console.log(`Image for item ${item.id} deleted successfully`);
            } catch (error) {
                console.error(`Failed to delete image for item ${item.id}:`, error);
                enqueueSnackbar(`Failed to delete image for item ${item.id}`, { variant: 'error' });
                return; // Stop further deletion if any image fails to delete
            }
        }
    
        // Proceed to delete items after images have been successfully deleted
        const data = {
            userId: primitiveUserId,
            ids: ids,
        };
    
        const response = await fetch(`/api/admin/deleteproducts`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });
    
        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Products permanently deleted', { variant: 'warning' });
            // Update the state or perform any cleanup
        } else {
            console.error('Failed to permanently delete products');
            enqueueSnackbar('Failed to permanently delete products', { variant: 'error' });
        }
    };

    const handleConsumableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConsumable(event.target.checked);
    };

    const handleItemActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItemActive(event.target.checked);
    }

    const handleRoleChange = (event: React.ChangeEvent<{}>, value: Role | null) => {
        setSelectedRoleId(value ? value.id : '');
    };

    const handleLocationChange = (event: React.ChangeEvent<{}>, value: Location | null) => {
        setSelectedLocation(value); // Set the selected location
    };

    const handleItemStatusChange = (event: React.ChangeEvent<{}>, value: ItemStatus | null) => {
        // Set the selected item status ID
        setSelectedItemStatusId(value ? value.id : '');
    };

    const handleUploadToFirebase = async (file: File) => {
        const storage = getStorage();
        const storageRef = ref(storage, `itemPictures/${file.name}`);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setFileUrl(downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
    };

    const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            setFile(files[0]);
            if (primitiveUserId) {
                await handleUploadToFirebase(files[0]);
            } else {
                console.error("User ID is null, cannot upload file.");
            }
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
            if (primitiveUserId) {
                await handleUploadToFirebase(event.target.files[0]);
            } else {
                console.error("User ID is null, cannot upload file.");
            }
        }
    };

    const handleClearFile = async () => {
        if (fileUrl) {
            const storage = getStorage();
            const fileRef = ref(storage, `${fileUrl}`);

            try {
                await deleteObject(fileRef);
                setFile(null);
                setFileUrl('');
                // Reset the file input value if necessary
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }
    };
    

    const renderContent = () => {
        switch (mode) {
            case 'add':
            case 'edit':
                return (
                    <div className="sm:grid sm:grid-cols-2">
                        {!fileUrl && (
                            <label
                                htmlFor="file-upload"
                                className="mx-auto w-11/12 bg-gray-100 border-2 border-gray-300 border-dotted p-3 flex flex-col justify-center items-center rounded sm:col-span-2"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <FileUploadOutlinedIcon className="text-gray-600 mb-1.5" />
                                <div className="text-sm">
                                    <span className="text-blue-500 select-none">Click to upload</span><span className="select-none"> or drag and drop</span>
                                </div>
                                <span className="text-xs text-gray-400 select-none">JPG,JPEG,PNG less then 5MB.</span>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="opacity-0 w-0 h-0"
                                    accept="image/jpeg,image/png,application/pdf"
                                />
                            </label>
                        )}
                        {fileUrl && (
                            <div className="flex flex-row justify-around items-center gap-2 sm:col-span-2">
                                <Image 
                                    src={fileUrl || "/assets/images/defaultImage.jpg"}
                                    alt={name || "Default Image"}
                                    style={{ height: '50px', objectFit: 'contain'}}
                                    width={60}
                                    height={60}
                                    loading="lazy"
                                />
                                <div className="cursor-pointer" onClick={handleClearFile}>
                                    <Button 
                                        icon={<ClearIcon className="text-xl" />}
                                        paddingX="px-2"
                                        textColor="custom-gray" 
                                        borderColor="custom-gray"
                                        textClassName="font-semibold" 
                                        text="Remove"
                                    />
                                </div>
                                
                            </div>
                        )}
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Name"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="No"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='number'
                                value={number}
                                onChange={(e) => setNumber(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Model"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='model'
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Brand"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='brand'
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <Autocomplete
                                size="small"
                                className="w-11/12 sm:w-10/12"
                                disablePortal
                                options={roles}
                                getOptionLabel={(role) => role.name}
                                value={roles.find(role => role.id === selectedRoleId) || null}
                                onChange={handleRoleChange}
                                renderInput={(params) => <TextField {...params} label="Role" required />}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <Autocomplete
                                size="small"
                                className="w-11/12 sm:w-10/12"
                                disablePortal
                                options={locations}
                                getOptionLabel={(location) => location.name}
                                value={selectedLocation}
                                onChange={handleLocationChange}
                                renderInput={(params) => <TextField {...params} label="Location" required />}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Year *"
                                    views={['year']}
                                    value={year}
                                    onChange={(newValue: Dayjs | null) => {
                                        if (newValue !== null) {
                                            setYear(newValue);
                                        }
                                    }}
                                    className="w-11/12 sm:w-10/12"
                                />
                            </LocalizationProvider>
                        </div>
                        <div className="flex justify-center mt-4">
                            <Autocomplete
                                size="small"
                                className="w-11/12 sm:w-10/12"
                                disablePortal
                                options={itemStatuses}
                                getOptionLabel={(itemStatus) => itemStatus.name}
                                value={itemStatuses.find(itemStatus => itemStatus.id === selectedItemStatusId) || null}
                                onChange={handleItemStatusChange}
                                renderInput={(params) => <TextField {...params} label="Status" required />}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                id="outlined-required"
                                label="Notes"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='notes'
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                id="outlined-required"
                                label="School number"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='school number'
                                value={schoolNumber}
                                onChange={(e) => setSchoolNumber(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormGroup className="w-11/12 sm:w-10/12">
                                <div className="flex items-center">
                                    <Checkbox 
                                        checked={itemActive}
                                        size="small" 
                                        onChange={handleItemActiveChange} 
                                    />
                                    <span className="select-none">Active?</span>
                                </div>
                            </FormGroup>
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormGroup className="w-11/12 sm:w-10/12">
                                <div className="flex items-center">
                                    <Checkbox 
                                        checked={consumable}
                                        size="small" 
                                        onChange={handleConsumableChange} 
                                    />
                                    <span className="select-none">Consumable?</span>
                                </div>
                            </FormGroup>
                        </div>
                        {consumable && (
                            <div className="flex justify-center mt-4">
                                <TextField
                                    required
                                    id="outlined-required"
                                    label="Amount"
                                    size="small"
                                    className='w-11/12 sm:w-10/12'
                                    name='amount'
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    />
                            </div>
                        )}
                    </div>
                );
            case 'delete':
                if (!selectedItems) {
                    return <p>No items selected.</p>;
                } else {
                    return (
                        <>
                            {selectedItems.length === 1 && (
                                <div className="flex justify-center">
                                    <div className="px-4 grid grid-cols-4 sm:flex sm:justify-around sm:w-full">
                                        <div className="col-span-1 grid grid-rows-4">
                                            <div className="row-span-3 flex">
                                                <Image 
                                                    src={selectedItems[0].image || "/assets/images/defaultImage.jpg"}
                                                    alt={selectedItems[0].name || "Default Image"}
                                                    className="w-14 h-14 object-cover sm:w-24 sm:h-24"
                                                    width={60}
                                                    height={60}
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">Year&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].yearBought ? new Date(selectedItems[0].yearBought).getFullYear() : 'N/A'} placement="top-start">
                                                    <span>{selectedItems[0].yearBought ? new Date(selectedItems[0].yearBought).getFullYear() : 'N/A'}</span>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">Name&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].name} placement="top-start">
                                                    <span>{selectedItems[0].name}</span>
                                                </Tooltip>
                                            </div>
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">Brand&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].brand} placement="top-start">
                                                    <span>{selectedItems[0].brand}</span>
                                                </Tooltip>
                                            </div>
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">Model&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].model} placement="top-start">
                                                    <span>{selectedItems[0].model}</span>
                                                </Tooltip>
                                            </div>
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">Location&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].location.name} placement="top-start">
                                                    <span>{selectedItems[0].location.name}</span>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedItems.length > 1 && (
                                <div className="flex justify-center">
                                    <div>
                                        <p className="mb-3 sm:text-xl font-semibold">Are you sure you want to delete {selectedItems.length} items?</p>
                                        <div>
                                            {selectedItems.map((selectedItem) => (
                                                <div key={selectedItem.id} className="flex items-center gap-3 mt-1">
                                                    <div>
                                                        <Image 
                                                            src={selectedItem.image || "/assets/images/defaultImage.jpg"}
                                                            alt={selectedItem.name || "Default Image"}
                                                            className="w-8 h-8 object-cover sm:w-11 sm:h-11"
                                                            width={20}
                                                            height={20}
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="truncate">
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
            <ThemeProvider theme={theme}>
                <Box className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[60%] lg:w-[50%] rounded-lg shadow-lg max-h-[70%] flex flex-col">
                    <div className="flex justify-between items-center py-3 px-4 border-b-2 border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="font-bold my-auto">{mode === 'add'? <Inventory2OutlinedIcon /> : mode === 'edit' ? <Inventory2OutlinedIcon /> : <WarningAmberRoundedIcon className="text-custom-red text-3xl" />}</span>
                            <span className={`font-bold ${mode === 'delete' ? 'text-custom-red' : ''}`}>
                                {mode === 'add' ? 'Add product' : mode === 'edit' ? 'Edit product' :
                                selectedItems?.length === 1 ? "You're about to delete this item. Are you sure?" :
                                "Delete products"}
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
                                textClassName={`font-semibold select-none ${mode === 'delete' ? 'text-xs' : ''}`} 
                                text="Cancel"
                            />
                        </div>
                        {mode === 'add' && (    // Only show add button if mode is add  
                            <div onClick={handleAdd}>
                                <Button 
                                    icon={<CheckCircleOutlineIcon className="text-xl" />}
                                    textColor="custom-green" 
                                    borderColor="custom-green"
                                    textClassName="font-semibold select-none" 
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
                                    textClassName="font-semibold select-none" 
                                    text="Save"
                                />
                            </div>
                        )}
                        {mode === 'delete' && (     // Only show delete button if mode is delete
                            <>
                                <div onClick={() =>{
                                    if (selectedItems?.length === 1) {
                                        handleSoftDelete();
                                    } else {
                                        handleMultiSoftDelete();
                                    }
                                }}>
                                    <Button 
                                        paddingX="px-2"
                                        textColor="custom-dark-blue" 
                                        borderColor="custom-dark-blue"
                                        textClassName="font-semibold text-xs select-none" 
                                        text="Soft Delete"
                                    />
                                </div>
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
                                        textClassName="font-semibold text-xs select-none" 
                                        text="Permanent Delete"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </Box>
            </ThemeProvider>
        </MaterialUIModal>
    );
}