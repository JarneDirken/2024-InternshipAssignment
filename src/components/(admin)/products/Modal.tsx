'use client';
import { useSnackbar } from "notistack";
import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { TextField, Popover } from '@mui/material';
//icons
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { ClearIcon } from "@mui/x-date-pickers/icons";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { YearCalendar } from '@mui/x-date-pickers/YearCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from "react";
import { Item } from "@/models/Item";
import Button from "@/components/states/Button";
import { Checkbox, FormGroup } from "@mui/material";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Image from 'next/image';
import Tooltip from '@mui/material/Tooltip';
import * as XLSX from 'xlsx';

import { Role } from "@/models/Role";
import { Location } from "@/models/Location";
import { ItemStatus } from "@/models/ItemStatus";

interface ItemImport {
    number: string;
    name: string;
    model: string;
    brand: string;
    locationId: number | undefined; // since it could be undefined if location name is not found
    roleId: number | undefined; // since it could be undefined if role name is not found
    yearBought: Date;
    itemStatusId: number | undefined; // since it could be undefined if status name is not found
    active: boolean;
    notes: string | undefined;
    schoolNumber: string | undefined;
    consumable: boolean;
    amount: number | undefined;
    userId: String | null; // Adjust based on your actual usage, assuming it might be null
}

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    onItemsUpdated: () => void;
    selectedItems?: Item[];
    roles: Role[];
    locations: Location[];
    itemStatuses: ItemStatus[];
    mode: 'add' | 'edit' | 'delete' | 'import';
    userId: String | null;
    token: String | null;
    uniqueNames: string[];
    uniqueModels: string[];
    uniqueBrands: string[];  
    existingNumbers: string[];
}

export default function Modal({ open, onClose, onItemsUpdated, selectedItems, mode, userId, roles, locations, itemStatuses, uniqueNames, uniqueModels, uniqueBrands, existingNumbers, token }: ModalCardProps) {
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
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    const openDatePicker = Boolean(anchorEl);

    // File import states
    type ImportData = string[][];
    const [importData, setImportData] = useState<ImportData>([]);

    // File upload states
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null); // file url from firebase
    const [originalFileUrl, setOriginalFileUrl] = useState<string | null>(null);
    const primitiveUserId = userId ? String(userId) : null; // uid from firebase

    // Item error states
    const [nameError, setNameError] = useState('');
    const [numberError, setNumberError] = useState('');
    const [modelError, setModelError] = useState('');
    const [brandError, setBrandError] = useState('');
    const [roleError, setRoleError] = useState('');
    const [locationError, setLocationError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [consumableError, setConsumableError] = useState('');

    // Item states
    const [name, setName] = useState<string | null>(null);
    const [number, setNumber] = useState<string | null>(null);
    const [model, setModel] = useState<string | null>(null);
    const [brand, setBrand] = useState<string | null>(null);
    const [year, setYear] = useState<Dayjs | null>(dayjs());
    const [notes, setNotes] = useState<string | null>(null);
    const [schoolNumber, setSchoolNumber] = useState<string | null>(null);
    const [itemActive, setItemActive] = useState(true);
    const [consumable, setConsumable] = useState(false);
    const [amount, setAmount] = useState<number | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [selectedItemStatusId, setSelectedItemStatusId] = useState<number | null>(null);

    const resetErrors = () => {
        setNameError('');
        setNumberError('');
        setModelError('');
        setBrandError('');
        setRoleError('');
        setLocationError('');
        setStatusError('');
        setConsumableError('');
    }

    const resetFields = () => {
        setFileUrl(null);
        setFile(null);
        setName(null);
        setNumber(null);
        setModel(null);
        setBrand(null);
        setYear(dayjs());
        setNotes(null);
        setSchoolNumber(null);
        setItemActive(true);
        setConsumable(false);
        setAmount(null);
        setSelectedRoleId(null);
        setSelectedLocation(null);
        setSelectedItemStatusId(null);
        resetErrors();
    };

    useEffect(() => {
        if (mode === 'edit' && items.length === 1) {
            const item = items[0];
            setOriginalFileUrl(item.image || null);
            setFileUrl(item.image || null);
            setName(item.name || null);
            setNumber(item.number || null);
            setModel(item.model || null);
            setBrand(item.brand || null);
            setYear(item.yearBought ? dayjs(item.yearBought) : dayjs());
            setNotes(item.notes || null);
            setSchoolNumber(item.schoolNumber || null);
            setItemActive(item.active);
            setConsumable(item.consumable);
            setAmount(item.amount ? item.amount : null);
            setSelectedRoleId(item.RoleItem && item.RoleItem.length > 0 ? item.RoleItem[0].roleId : null);
            setSelectedItemStatusId(item.itemStatusId || null);
            setSelectedLocation(item.location || null);
        } else if (mode === 'add') {
            // Reset all states to default for adding new item
            resetFields();
            const availableStatus = itemStatuses.find(status => status.name === 'Available');
            if (availableStatus) {
                setSelectedItemStatusId(availableStatus.id);
            }
        } else if (mode === 'import') {
            setImportData([]);
        }
    }, [items, mode]);

    const handleSuccess = () => {
        if (mode === 'add' || mode === 'edit' || mode === 'delete') {}
        onItemsUpdated();
        onClose();
    };

    const validateFields = () => {
        let isValid = true;
        resetErrors();

        if (!name) {
            setNameError('Name is required.');
            isValid = false;
        }
        if (!number) {
            setNumberError('Number is required.');
            isValid = false;
        } else if (number.length < 19 || number.length > 22) {
            setNumberError('Number must be between 19 and 22 characters.');
            isValid = false;
        } else if (mode === 'add' && existingNumbers.includes(number)) {
            setNumberError('Number must be unique.');
            isValid = false;
        } else if (mode === 'edit' && number !== items[0].number && existingNumbers.includes(number)) {
            setNumberError('Number must be unique.');
            isValid = false;
        }
        if (!model) {
            setModelError('Model is required.');
            isValid = false;
        }
        if (!brand) {
            setBrandError('Brand is required.');
            isValid = false;
        }
        if (!selectedRoleId) {
            setRoleError('Role is required.');
            isValid = false;
        }
        if (!selectedLocation) {
            setLocationError('Location is required.');
            isValid = false;
        }
        if (!selectedItemStatusId) {
            setStatusError('Status is required.');
            isValid = false;
        }
        if (consumable && amount == null) {
            setConsumableError('Amount is required when item is a consumable.');
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
            token: token,
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
        if (!validateFields()) {
            enqueueSnackbar('Please correct the errors before submitting.', { variant: 'error' });
            return;
        }
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
            roleItemId: items[0]?.RoleItem?.[0].id,
            roleId: selectedRoleId,
            userId: primitiveUserId,
            token: token,
        };

        const response = await fetch(`/api/admin/products/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            if (originalFileUrl && originalFileUrl !== fileUrl) {
                const storage = getStorage();
                const imageRef = ref(storage, originalFileUrl);
    
                try {
                    await deleteObject(imageRef);
                } catch (error) {
                    console.error('Failed to delete original image from Firebase:', error);
                }
            }

            setFile(null);
            setFileUrl('');
            setOriginalFileUrl(null);
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
            token: token,
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
            token: token,
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
            token: token,
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
            token: token,
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

    const handleImportData = async () => {
        if (importData.length <= 1) {
            enqueueSnackbar('No data to import.', { variant: 'error' });
            return;
        }
    
        const itemsToCreate = [];
    
        for (let i = 1; i < importData.length; i++) {
            const row = importData[i];
            const [
                number, name, model, brand, location, yearStr, role, status, 
                activeStr, note, schoolNumber, consumableStr, amountStr
            ] = row;
    
            // Convert year from string to number
            const year = parseInt(yearStr);
            const active = activeStr === "true" ? true : activeStr === "false" ? false : Boolean(activeStr);
            const consumable = consumableStr === "true" ? true : consumableStr === "false" ? false : Boolean(consumableStr);
            let amount = undefined;

            if (consumable && amountStr !== "") {
                const parsedAmount = parseInt(amountStr);
                if (!isNaN(parsedAmount)) {
                    amount = parsedAmount;
                }
            }

            // Prepare data
            const itemData = {
                number: number.toString(),
                name: name.toString(),
                model: model.toString(),
                brand: brand.toString(),
                locationId: locations.find(loc => loc.name === location)?.id,
                roleId: roles.find(r => r.name === role)?.id,
                yearBought: new Date(year, 0, 2), // Assuming year is just a number
                itemStatusId: itemStatuses.find(s => s.name === status)?.id,
                active: active,
                notes: note || undefined,
                schoolNumber: schoolNumber || undefined,
                consumable: consumable,
                amount: amount,
                userId: primitiveUserId, // Assuming `userId` is from context or props
                token: token,
            };
    
            // Validation checks
            if (!number || existingNumbers.includes(number)) {
                enqueueSnackbar(`Row ${i + 1}: Invalid or duplicate 'Number'.`, { variant: 'error' });
                return;
            }
            if (!name) {
                enqueueSnackbar(`Row ${i + 1}: 'Name' is required.`, { variant: 'error' });
                return;
            }
            if (!model) {
                enqueueSnackbar(`Row ${i + 1}: 'Model' is required.`, { variant: 'error' });
                return;
            }
            if (!brand) {
                enqueueSnackbar(`Row ${i + 1}: 'Brand' is required.`, { variant: 'error' });
                return;
            }
            if (!itemData.locationId) {
                enqueueSnackbar(`Row ${i + 1}: Invalid 'Location'.`, { variant: 'error' });
                return;
            }
            if (!itemData.roleId) {
                enqueueSnackbar(`Row ${i + 1}: Invalid 'Role'.`, { variant: 'error' });
                return;
            }
            if (!itemData.itemStatusId) {
                enqueueSnackbar(`Row ${i + 1}: Invalid or missing 'Status'.`, { variant: 'error' });
                return;
            }
            if (typeof year !== 'number' || year < 2000 || year > new Date().getFullYear()) {
                enqueueSnackbar(`Row ${i + 1}: Invalid 'Year'. Must be between 2000 and the current year.`, { variant: 'error' });
                return;
            }
            if (typeof active !== 'boolean' && active !== "true" && active !== "false") {
                enqueueSnackbar(`Row ${i + 1}: 'Active' must be true or false.`, { variant: 'error' });
                return;
            }
            if (consumable && amount === undefined) {
                enqueueSnackbar(`Row ${i + 1}: 'Amount' must be specified and valid for consumable items.`, { variant: 'error' });
                return;
            }
    
            // If validation passes, add to items to create
            itemsToCreate.push(itemData);
        }
    
        // If all rows are valid, create items
        if (itemsToCreate.length > 0) {
            enqueueSnackbar('All items are valid, starting import...', { variant: 'success' });
            await handleMultiAdd(itemsToCreate);
        }
    };

    const handleMultiAdd = async (items: ItemImport[]) => {
        for (const item of items) {
            const response = await fetch(`/api/admin/products/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: item }),
            });
    
            if (!response.ok) {
                const message = `Failed to create product: ${item.name}`;
                console.error(message);
                enqueueSnackbar(message, { variant: 'error' });
                return; // Stop further processing if any request fails
            }
        }
        
        handleSuccess();
        enqueueSnackbar('All products successfully created', { variant: 'success' });
        setImportData([]); // Clear import data after successful creation
    };

    const handleConsumableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConsumable(event.target.checked);
        if (!event.target.checked) {
            setAmount(null);  // Reset amount to null when consumable is unchecked
        }
    };
    
    const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setNotes(value ? value : null);
    };
    
    const handleSchoolNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSchoolNumber(value ? value : null);
    };

    const handleYearChange = (newYear: Dayjs | null) => {
        setYear(newYear);
        console.log(year);
        setAnchorEl(null); // Close popover on year selection
    };


    const handleItemActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setItemActive(event.target.checked);
    }

    const handleRoleChange = (event: React.ChangeEvent<{}>, value: Role | null) => {
        setSelectedRoleId(value ? value.id : null);
        setRoleError('');
    };

    const handleLocationChange = (event: React.ChangeEvent<{}>, value: Location | null) => {
        setSelectedLocation(value); // Set the selected location
        setLocationError(''); // Reset the location error
    };

    const handleItemStatusChange = (event: React.ChangeEvent<{}>, value: ItemStatus | null) => {
        // Set the selected item status ID
        setSelectedItemStatusId(value ? value.id : null);
        setStatusError(''); // Reset the status error
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
        // In edit mode, check if there's an original image and if the current file URL is different
        if (mode === 'edit' && originalFileUrl && fileUrl !== originalFileUrl) {
            // Delete the newly uploaded image that was not saved
            const storage = getStorage();
            const fileRef = ref(storage, `${fileUrl}`);

            try {
                await deleteObject(fileRef);
                console.log('New image deleted as it was not saved');
            } catch (error) {
                console.error('Error deleting new image:', error);
            }
        } else if (mode === 'add') {
            const storage = getStorage();
            const fileRef = ref(storage, `${fileUrl}`);

            try {
                await deleteObject(fileRef);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }

        // Reset state but keep the original image URL intact if in edit mode
        setFile(null);
        setFileUrl(null);

        // Reset the file input value
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    }
};

    const cancelModal = async () => {
        if (mode === 'add' && fileUrl || mode === 'edit' && originalFileUrl && fileUrl !== originalFileUrl) {
            const storage = getStorage();
            const fileRef = ref(storage, `${fileUrl}`);

            try {
                await deleteObject(fileRef);
            } catch (error) {
                console.error('Error deleting file:', error);
            }
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
        if (mode === 'import') {
            setImportData([]);
        }
        onClose();
    }

    const readExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = new Uint8Array(event.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
    
            // Read the first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
    
            // Convert worksheet to JSON
            const jsonData: ImportData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as ImportData;
            setImportData(jsonData);
            console.log(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImportUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            readExcelFile(file);
        }
    };

    const handleDropImport = async (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file) {
            readExcelFile(file);
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
                            <Autocomplete
                                size="small"
                                className="w-11/12 sm:w-10/12"
                                freeSolo  // Allows users to type their own entries
                                options={uniqueNames}  // Use the unique names passed via props
                                value={name}
                                onChange={(event, newValue) => {
                                    setName(newValue || '');
                                    setNameError('');
                                }}
                                onInputChange={(event, newInputValue) => {
                                    setName(newInputValue || '');
                                    setNameError('');
                                }}
                                renderInput={(params) => <TextField {...params} label="Name" required error={!!nameError} helperText={nameError} />}
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
                                error={!!numberError}
                                helperText={numberError}
                                onChange={(e) => {
                                    setNumber(e.target.value);
                                    setNumberError('');
                                }}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <Autocomplete
                                size="small"
                                className="w-11/12 sm:w-10/12"
                                freeSolo  // Allows users to type their own entries
                                options={uniqueModels}  // Use the unique names passed via props
                                value={model}
                                onChange={(event, newValue) => {
                                    setModel(newValue || '');
                                    setModelError('');
                                }}
                                onInputChange={(event, newInputValue) => {
                                    setModel(newInputValue || '');
                                    setModelError('');
                                }}
                                renderInput={(params) => <TextField {...params} label="Model" required error={!!modelError} helperText={modelError} />}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <Autocomplete
                                size="small"
                                className="w-11/12 sm:w-10/12"
                                freeSolo  // Allows users to type their own entries
                                options={uniqueBrands}  // Use the unique names passed via props
                                value={brand}
                                onChange={(event, newValue) => {
                                    setBrand(newValue || '');
                                    setBrandError('');
                                }}
                                onInputChange={(event, newInputValue) => {
                                    setBrand(newInputValue || '');
                                    setBrandError('');
                                }}
                                renderInput={(params) => <TextField {...params} label="Brand" required error={!!brandError} helperText={brandError} />}
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
                                renderInput={(params) => <TextField {...params} label="Role" required error={!!roleError} helperText={roleError} />}
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
                                renderInput={(params) => <TextField {...params} label="Location" required error={!!locationError} helperText={locationError} />}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                label="Year"
                                size="small"
                                name="year"
                                required
                                className='w-11/12 sm:w-10/12'
                                onClick={(event) => setAnchorEl(event.currentTarget)}
                                value={year ? year.format('YYYY') : ''}
                                InputProps={{ readOnly: true }}
                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Popover
                                    open={openDatePicker}
                                    anchorEl={anchorEl}
                                    onClose={() => setAnchorEl(null)}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'center',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'center',
                                    }}
                                >
                                    <YearCalendar
                                        value={year}
                                        onChange={handleYearChange}
                                        disableFuture
                                    />
                                </Popover>
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
                                renderInput={(params) => <TextField {...params} label="Status" required error={!!statusError} helperText={statusError} />}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                label="Notes"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='notes'
                                value={notes || ''}
                                onChange={handleNotesChange}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                label="School number"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='school number'
                                value={schoolNumber || ''}
                                onChange={handleSchoolNumberChange}
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
                                    label="Amount"
                                    size="small"
                                    className='w-11/12 sm:w-10/12'
                                    name='amount'
                                    type="number"
                                    value={amount}
                                    error={!!consumableError}
                                    helperText={consumableError}
                                    onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : null)}
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
            case 'import':
                return (
                    <>
                        <div className="flex justify-center">
                            <div className="px-4 grid grid-cols-2">
                                {importData.length === 0 && (
                                    <>
                                        <div className="col-span-1 flex justify-center items-center">
                                            <a href="/assets/templates/Item-Data-Template.xlsx" download="TemplateFile.xlsx">
                                                <Button 
                                                    icon={<InsertDriveFileOutlinedIcon className="text-xl" />}
                                                    textColor="custom-dark-blue" 
                                                    borderColor="custom-dark-blue"
                                                    fillColor="blue-100" 
                                                    buttonClassName="hover:bg-blue-200"
                                                    textClassName="font-semibold select-none" 
                                                    text="Template"
                                                />
                                            </a>
                                        </div>
                                    
                                        <label
                                            htmlFor="file-upload"
                                            className="mx-auto bg-gray-100 border-2 border-gray-300 border-dotted p-3 flex flex-col justify-center items-center rounded col-span-1"
                                            onDragOver={handleDragOver}
                                            onDrop={handleDropImport}
                                        >
                                            <FileUploadOutlinedIcon className="text-gray-600 mb-1.5" />
                                            <div className="text-sm">
                                                <span className="text-blue-500 select-none">Click to upload</span><span className="select-none"> or drag and drop</span>
                                            </div>
                                            <span className="text-xs text-gray-400 select-none">XLSX and XLS only.</span>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                onChange={handleImportUpload}
                                                className="opacity-0 w-0 h-0"
                                                accept=".xlsx, .xls"
                                            />
                                        </label>
                                    </>
                                )}
                                {importData.length >= 1 && (
                                    <div className="flex flex-row justify-around items-center gap-2 sm:col-span-2">
                                        <div>
                                            Import file has been loaded.
                                        </div>
                                        <div className="cursor-pointer" onClick={() => setImportData([])}>
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
                            </div>
                        </div>
                    </>
                );
        }
    };

    return (
        <MaterialUIModal
            open={open}
            onClose={cancelModal}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[60%] lg:w-[50%] rounded-lg shadow-lg max-h-[70%] flex flex-col">
                <ThemeProvider theme={theme}>
                    <div className="flex justify-between items-center py-3 px-4 border-b-2 border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="font-bold my-auto">{mode === 'add'? <Inventory2OutlinedIcon /> : mode === 'edit' ? <Inventory2OutlinedIcon /> : mode === 'import' ? <InsertDriveFileOutlinedIcon /> : <WarningAmberRoundedIcon className="text-custom-red text-3xl" />}</span>
                            <span className={`font-bold ${mode === 'delete' ? 'text-custom-red' : ''}`}>
                                {mode === 'add' ? 'Add product' : mode === 'edit' ? 'Edit product' : mode === 'import' ? 'Import products' :
                                selectedItems?.length === 1 ? "You're about to delete this item. Are you sure?" :
                                "Delete products"}
                            </span>
                        </div>
                        <div onClick={cancelModal}>
                            <span><CloseOutlinedIcon /></span>
                        </div>
                    </div>
                    <div id="modal-description" className="modal-body h-full p-3 overflow-y-auto">
                        {renderContent()}
                    </div>
                    <div className="flex justify-around py-3 px-4 border-t-2 border-gray-200">
                        <div onClick={cancelModal}>
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
                        {mode === 'import' && (   
                            <div onClick={handleImportData}>
                                <Button 
                                    icon={<InsertDriveFileOutlinedIcon className="text-xl" />}
                                    textColor="custom-dark-blue" 
                                    borderColor="custom-dark-blue"
                                    buttonClassName="hover:bg-blue-200 transition-colors"
                                    textClassName="font-semibold select-none" 
                                    text="Import"
                                />
                            </div>
                        )}
                        {mode === 'delete' && (     // Only show delete button if mode is delete
                            <>
                                {selectedItems && (
                                    <>
                                        {(selectedItems.length > 1 || (selectedItems.length === 1 && selectedItems[0].active)) && (
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
                                                    buttonClassName="hover:bg-blue-200 transition-colors"
                                                    textClassName="font-semibold text-xs select-none" 
                                                    text="Soft Delete"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
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
                                        textClassName="font-semibold text-xs select-none" 
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