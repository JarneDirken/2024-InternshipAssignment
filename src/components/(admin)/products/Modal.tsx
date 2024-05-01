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
import OutlinedInput from '@mui/material/OutlinedInput';
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { Item } from "@/models/Item";
import Button from "@/components/states/Button";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { Checkbox, FormControl, FormGroup, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip';
import { ClearIcon } from "@mui/x-date-pickers/icons";
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
    const [message, setMessage] = useState<string | null>(null);  // State can be string or null
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup

    const items = selectedItems || [];
    console.log(selectedItems);

    // File upload states
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null); // file url from firebase
    const primitiveUserId = userId ? String(userId) : null; // uid from firebase

    // Item states
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [model, setModel] = useState('');
    const [brand, setBrand] = useState('');
    const [year, setYear] = useState('');
    const [notes, setNotes] = useState('');
    const [schoolNumber, setSchoolNumber] = useState('');
    const [itemActive, setItemActive] = useState(true);
    const [consumable, setConsumable] = useState(false);
    const [amount, setAmount] = useState('');
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');
    const [selectedItemStatusId, setSelectedItemStatusId] = useState<number | ''>('');

    useEffect(() => {
        if (mode === 'edit' && items.length === 1) {
            const item = items[0];
            setFileUrl(item.image || null);
            setName(item.name || '');
            setNumber(item.number || '');
            setModel(item.model || '');
            setBrand(item.brand || '');
            setYear(item.yearBought ? new Date(item.yearBought).getFullYear().toString() : '');
            setNotes(item.notes || '');
            setSchoolNumber(item.schoolNumber || '');
            setItemActive(item.active);
            setConsumable(item.consumable || false);
            setAmount(item.amount ? item.amount.toString() : '');
            setSelectedRoleIds(item.RoleItem?.map(roleItem => roleItem.roleId) || []);
            setSelectedItemStatusId(item.itemStatusId || '');
            setSelectedLocationId(item.locationId || '');
        } else if (mode === 'add') {
            // Reset all states to default for adding new item
            setName('');
            setNumber('');
            setModel('');
            setBrand('');
            setYear('');
            setNotes('');
            setSchoolNumber('');
            setItemActive(true);
            setConsumable(false);
            setAmount('');
            setSelectedRoleIds([]);
            setSelectedLocationId('');
            setSelectedItemStatusId('');
        }
    }, [items, mode]);

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

    const handleConsumableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConsumable(event.target.checked);
    };

    const handleItemActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItemActive(event.target.checked);
    }

    const handleRoleChange = (event: SelectChangeEvent<number[]>): void => {
        const value = event.target.value;
        // Setting the type of the value to string[] | number[], which will be converted to number[]
        setSelectedRoleIds(typeof value === 'string' ? value.split(',').map(str => parseInt(str, 10)) : value);
    };

    const handleLocationChange = (event: SelectChangeEvent<number>) => {
        setSelectedLocationId(Number(event.target.value)); // Ensure the value is a number
    };

    const handleItemStatusChange = (event: SelectChangeEvent<number>) => {
        setSelectedItemStatusId(Number(event.target.value)); // Ensure the value is a number
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

    const handleUploadToFirebase = async (file: File, userId: string) => {
        const storage = getStorage();
        console.log(userId);
        // Ensure you include the authenticated user's UID in the path
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
                await handleUploadToFirebase(files[0], primitiveUserId);
            } else {
                console.error("User ID is null, cannot upload file.");
            }
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
            if (primitiveUserId) {
                await handleUploadToFirebase(event.target.files[0], primitiveUserId);
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
                return (
                    <>
                        {/* <div className="mx-auto w-11/12 bg-gray-100 border-2 border-gray-300 border-dotted p-3 flex flex-col justify-center items-center rounded">
                            <FileUploadOutlinedIcon className="text-gray-600 mb-1.5" />
                            <div className="text-sm">
                                <span className="text-blue-500">Click to upload</span><span> or drag and drop</span>
                            </div>
                            <span className="text-xs text-gray-400">JPG,JPEG,PNG less then 5MB.</span>
                        </div> */}
                        {!file && (
                            <label
                                htmlFor="file-upload"
                                className="mx-auto w-11/12 bg-gray-100 border-2 border-gray-300 border-dotted p-3 flex flex-col justify-center items-center rounded"
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
                        {file && (
                            <div className="flex flex-row justify-around items-center gap-2">
                                <Image 
                                    src={fileUrl || "/assets/images/defaultImage.jpg"}
                                    alt={name || "Default Image"}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover'}}
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
                                className='w-11/12'
                                name='name'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Model"
                                size="small"
                                className='w-11/12'
                                name='model'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Brand"
                                size="small"
                                className='w-11/12'
                                name='brand'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-11/12" size="small">
                                <InputLabel id="roles-label" required>Roles</InputLabel>
                                <Select
                                    labelId="roles-label"
                                    id="roles"
                                    multiple
                                    value={selectedRoleIds}
                                    input={<OutlinedInput label="Roles.." />}
                                    onChange={handleRoleChange}
                                    renderValue={(selected) => selected.map(id => roles.find(role => role.id === id)?.name).join(', ')}
                                >
                                {roles.map((role) => (
                                    <MenuItem key={role.id} value={role.id}>
                                        <Checkbox checked={selectedRoleIds.includes(role.id)} />
                                        <ListItemText primary={role.name} />
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                        </div>
                        {/* <div className="flex justify-center mt-4">
                            <FormControl className="w-11/12" size="small">
                                <InputLabel required id="roles-label">Roles</InputLabel>
                                <Select
                                    labelId="roles-label"
                                    id="roles"
                                    label="Roles"
                                    value={selectedRoleIds}
                                    onChange={handleRoleChange}
                                >
                                    {roles.map((role) => (
                                        <MenuItem key={role.id} value={role.id}>
                                            {role.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div> */}
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-11/12" size="small">
                                <InputLabel required id="location-label">Location</InputLabel>
                                <Select
                                    labelId="location-label"
                                    id="location"
                                    label="Location"
                                    value={selectedLocationId}
                                    onChange={handleLocationChange}
                                >
                                    {locations.map((location) => (
                                        <MenuItem key={location.id} value={location.id}>
                                            {location.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Year"
                                size="small"
                                className='w-11/12'
                                name='year'
                                type="number"
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-11/12" size="small">
                                <InputLabel required id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="status"
                                    label="Status"
                                    value={selectedItemStatusId}
                                    onChange={handleItemStatusChange}
                                >
                                    {itemStatuses.map((itemStatus) => (
                                        <MenuItem key={itemStatus.id} value={itemStatus.id}>
                                            {itemStatus.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormGroup className="w-11/12">
                                <div className="flex items-center">
                                    <Checkbox 
                                        size="small" 
                                        onChange={handleItemActiveChange} 
                                    />
                                    <span className="select-none">Active?</span>
                                </div>
                            </FormGroup>
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                id="outlined-required"
                                label="Notes"
                                size="small"
                                className='w-11/12'
                                name='notes'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                id="outlined-required"
                                label="School number"
                                size="small"
                                className='w-11/12'
                                name='school number'
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormGroup className="w-11/12">
                                <div className="flex items-center">
                                    <Checkbox 
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
                                    className='w-11/12'
                                    name='amount'
                                    type="number"
                                    />
                            </div>
                        )}
                    </>
                );
            case 'edit':
                return (
                    <>
                        {!fileUrl  && (
                            <label
                                htmlFor="file-upload"
                                className="mx-auto w-11/12 bg-gray-100 border-2 border-gray-300 border-dotted p-3 flex flex-col justify-center items-center rounded"
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
                        {fileUrl  && (
                            <div className="flex flex-row justify-around items-center gap-2">
                                <Image 
                                    src={fileUrl || "/assets/images/defaultImage.jpg"}
                                    alt={name || "Default Image"}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover'}}
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
                                className='w-11/12'
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
                                className='w-11/12'
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
                                className='w-11/12'
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
                                className='w-11/12'
                                name='brand'
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-11/12" size="small">
                                <InputLabel id="roles-label">Roles</InputLabel>
                                <Select
                                    labelId="roles-label"
                                    id="roles"
                                    multiple
                                    value={selectedRoleIds}
                                    onChange={handleRoleChange}
                                    renderValue={(selected) => selected.map(id => roles.find(role => role.id === id)?.name).join(', ')}
                                    >
                                    {roles.map((role) => (
                                        <MenuItem key={role.id} value={role.id}>
                                            <Checkbox checked={selectedRoleIds.includes(role.id)} />
                                            <ListItemText primary={role.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-11/12" size="small">
                                <InputLabel required id="location-label">Location</InputLabel>
                                <Select
                                    labelId="location-label"
                                    id="location"
                                    label="Location"
                                    value={selectedLocationId}
                                    onChange={handleLocationChange}
                                >
                                    {locations.map((location) => (
                                        <MenuItem key={location.id} value={location.id}>
                                            {location.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                id="outlined-required"
                                label="Year"
                                size="small"
                                className='w-11/12'
                                name='year'
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormControl className="w-11/12" size="small">
                                <InputLabel required id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    id="status"
                                    label="Status"
                                    value={selectedItemStatusId}
                                    onChange={handleItemStatusChange}
                                >
                                    {itemStatuses.map((itemStatus) => (
                                        <MenuItem key={itemStatus.id} value={itemStatus.id}>
                                            {itemStatus.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormGroup className="w-11/12">
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
                            <TextField
                                id="outlined-required"
                                label="Notes"
                                size="small"
                                className='w-11/12'
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
                                className='w-11/12'
                                name='school number'
                                value={schoolNumber}
                                onChange={(e) => setSchoolNumber(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormGroup className="w-11/12">
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
                                    className='w-11/12'
                                    name='amount'
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    />
                            </div>
                        )}
                    </>
                );
            case 'delete':
                if (!selectedItems) {
                    return <p>No items selected.</p>;
                } else {
                    return (
                        <>
                            {selectedItems.length === 1 && (
                                <div className="px-4 grid grid-cols-4">
                                    <div className="col-span-1 grid grid-rows-4">
                                        <div className="row-span-3 flex">
                                            <Image 
                                                src={selectedItems[0].image || "/assets/images/defaultImage.jpg"}
                                                alt={selectedItems[0].name || "Default Image"}
                                                style={{ width: '50px', height: '50px', objectFit: 'cover'}}
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
                            )}
                            {selectedItems.length > 1 && (
                                <div className="flex justify-center">
                                    <div>
                                        <p className="mb-3">Are you sure you want to delete {selectedItems.length} items?</p>
                                        <div>
                                            {selectedItems.map((selectedItem) => (
                                                <div key={selectedItem.id} className="flex items-center gap-3 mt-1">
                                                    <div>
                                                        <Image 
                                                            src={selectedItem.image || "/assets/images/defaultImage.jpg"}
                                                            alt={selectedItem.name || "Default Image"}
                                                            style={{ width: '30px', height: '30px', objectFit: 'cover'}}
                                                            width={20}
                                                            height={20}
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                    <div className="truncate">
                                                        <Tooltip title={selectedItem.name} placement="top-start">
                                                            <span>{selectedItem.name}</span>
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
            <Box className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[50%] rounded-lg shadow-lg max-h-[70%] flex flex-col">
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
                        <div>
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
                        <div>
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
                            <div>
                                <Button 
                                    paddingX="px-2"
                                    textColor="custom-dark-blue" 
                                    borderColor="custom-dark-blue"
                                    textClassName="font-semibold text-xs select-none" 
                                    text="Soft Delete"
                                />
                            </div>
                            <div>
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
        </MaterialUIModal>
    );
}