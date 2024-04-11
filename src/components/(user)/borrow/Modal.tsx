'use client';
import { Item } from "@/models/Item";
import { createRequest } from "@/services/store";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { useRecoilState } from "recoil";
import MaterialUIModal  from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from "@mui/material/TextField";
import { LocalizationProvider, StaticDateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useCart from "@/hooks/useCart";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
//icons
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    item?: Item;
    userId: String | null;
}

export default function Modal({ open, onClose, item, userId }: ModalCardProps) {
    const [value, setValue] = useState(dayjs()); // date picker
    const [amount, setAmount] = useState<string | null>(null);
    const [isUrgent, setIsUrgent] = useState(true); // change this to view / not view the urgent borrow request
    const [file, setFile] = useState<File | null>(null); // file uploader
    const [fileUrl, setFileUrl] = useState('');
    const [startDateTime, setStartDateTime] = useState(new Date('2024-04-08T08:20').toISOString());
    const [endDateTime, setEndDateTime] = useState(new Date('2024-04-12T08:15').toISOString());
    const [request, setRequest] = useRecoilState(createRequest);
    const { enqueueSnackbar } = useSnackbar();
    const { cart, addToCart, removeFromCart, clearCart } = useCart();
    const primitiveUserId = userId ? String(userId) : null;

    function checkDateTime(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        // Function to check if date is a weekday
        const isWeekday = (date: Date) => {
            const day = date.getDay();
            return day >= 1 && day <= 5; // 1 is Monday, 5 is Friday
        };
    
        // Function to check if time is between 8-9 AM or 5-6 PM
        const isValidTime = (date: Date) => {
            const hours = date.getHours();
            return (hours >= 8 && hours < 9) || (hours >= 17 && hours < 18);
        };
    
        // Check if both dates are on weekdays
        if (!isWeekday(start) || !isWeekday(end)) {
            setIsUrgent(false);
            return;
        }
    
        // Check if times are valid
        if (!isValidTime(start) || !isValidTime(end)) {
            setIsUrgent(false);
            return;
        }
    
        // If both dates are the same, ensure start is AM and end is PM
        if (start.toDateString() === end.toDateString() && (start.getHours() >= 9 || end.getHours() < 17)) {
            setIsUrgent(false);
            return;
        }
    
        // If all checks passed, set isUrgent to true
        setIsUrgent(true);
    }

    const handleUploadToFirebase = async (file: File, userId: string) => {
        const storage = getStorage();
        // Ensure you include the authenticated user's UID in the path
        const storageRef = ref(storage, `files/${userId}/${file.name}`);
    
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            setFileUrl(downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };    

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setAmount(inputValue !== '' ? inputValue : null);
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
        if (file) {
            const storage = getStorage();
            const fileRef = ref(storage, `gs://internshipassignment-c6d15.appspot.com/files/${file.name}`);
    
            try {
                await deleteObject(fileRef);
                setFile(null);
                // Reset the file input value if necessary
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } catch (error) {
                console.error('Error deleting file:', error);
            }
        }
    };

    const handleSuccess = () => {
        setRequest(!request);
        enqueueSnackbar('Borrowed item successfully', { variant: 'success' });
    }

    const handleAddToCart = (item: Item) => {
        if (!item) {
            console.error("No item to add");
            return;
        }
    
        const cartItem = {
            item,
            borrowDetails: {
                startDateTime,
                endDateTime,
                isUrgent,
                file,
                amount
            }
        };
    
        const result = addToCart(cartItem);
        enqueueSnackbar(result.message, { variant: result.success ? 'success' : 'error' });
        onClose();
    };

    async function borrowItem() {
        if (!item) {console.error("error"); return;}
        const data = {
            itemId: item.id,
            requestStatusId: 1,
            borrowerId: userId,
            requestDate: new Date().toISOString(),
            startBorrowDate: startDateTime,
            endBorrowDate: endDateTime,
            file: fileUrl,
            isUrgent: isUrgent,
            amountRequest: amount,
        };
        
        const response = await fetch(`/api/user/itemrequest/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            onClose();
            handleSuccess();
        } else {
            console.error('Failed to create item request');
        }
    }

    const theme = createTheme({
        palette: {
          primary: {
            main: '#ff9800', // your primary color
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              textPrimary: {
                color: '#ff9800',
              },
            },
          },
        },
      });

    if(!item) { return;}

    return (
        <MaterialUIModal
            open={open}
            onClose={onClose}
            aria-labelledby="borrow-modal-title"
            aria-describedby="borrow-modal-description"
        >
            <Box 
                className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[50%] rounded-lg shadow-lg h-[70%]"
            >
                <div className="flex px-4 py-4 justify-between items-center border-b border-b-gray-300">
                    <div className="flex items-center gap-2">
                        <PersonAddAltOutlinedIcon />
                        <h1 id="borrow-modal-title" className="text-xl">Borrow details</h1>
                    </div>
                    <ClearIcon className="cursor-pointer" onClick={onClose} />
                </div>
                <div id="borrow-modal-description" className="overflow-y-auto h-[87%]">
                    <div className=" flex flex-col xl:flex-row xl:gap-8 px-8 py-2">
                        <div className="flex flex-col xl:w-1/2 xl:px-12">
                            <div className="flex justify-center mb-2 xl:justify-start">
                                <img src={item.image} height={200} width={200} alt={item.name} />
                            </div>
                            <div className="flex flex-col gap-3 lg:mt-4">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Name</span>
                                    <span>{item.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-400">Model</span>
                                        <span>{item.model}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-400">Brand</span>
                                        <span>{item.brand}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Location</span>
                                    <span>{item.location.name}</span>
                                </div>
                                {item.consumable && (
                                    <div className="mt-2">
                                        <ThemeProvider theme={theme}>
                                            <TextField
                                                id="outlined"
                                                label="Amount"
                                                size="small"
                                                className="bg-white w-full"
                                                name="amount"
                                                value={amount}
                                                onChange={handleAmountChange}
                                                placeholder="Search"
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                            />
                                        </ThemeProvider>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="xl:w-1/2 xl:block xl:items-end xl:justify-end flex justify-center shadow-lg scale-90 transform hide-picker-actions z-0 mr-8">
                            <ThemeProvider theme={theme}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div> 
                                    <StaticDateTimePicker
                                    displayStaticWrapperAs="mobile"
                                    openTo="day"
                                    value={value}
                                    onChange={(newValue) => {
                                        if (newValue !== null) {
                                        setValue(newValue);
                                        }
                                    }}
                                    />
                                </div>
                                </LocalizationProvider>
                            </ThemeProvider>
                        </div>
                    </div>
                    {isUrgent && (
                        <div className="flex flex-col px-12">
                            <div className="flex flex-row justify-between items-center px-8">
                                <span className="">Download the file and re-upload it with a signature of your teacher.</span>
                                <span className="text-custom-blue underline cursor-pointer">Download</span>
                            </div>
                            <div className="flex flex-col justify-center items-center mt-2 px-8">
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer border-dashed border border-gray-400 bg-gray-100 w-full rounded py-8 px-8 text-center"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <CloudUploadOutlinedIcon fontSize="large" className="text-custom-gray" />
                                <div className="flex flex-col">
                                    <span className="font-semibold"><span className="text-custom-blue">Click to upload</span> or drag and drop</span>
                                    <span className="text-custom-gray">JPG, JPEG, PNG, PDF less than 5MB.</span>
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleFileChange}
                                    className="opacity-0 w-0 h-0"
                                    accept="image/jpeg,image/png,application/pdf"
                                />
                            </label>
                                {file && (
                                <div className="flex flex-row gap-2">
                                    <span>File selected: {file.name}</span>
                                    <ClearIcon className="cursor-pointer" onClick={handleClearFile} />
                                </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-center items-center">
                                <span className="capitalize font-bold">You are making an <span className="text-custom-red">urgent borrow request!</span> are you sure you want to continue?</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-row justify-between items-center py-2 px-2 md:px-16 border-t border-t-gray-200 mt-4">
                        <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={onClose}>
                            <button className="text-custom-gray">Cancel</button>
                        </div>
                        <div className={`border py-1 px-3 rounded-lg flex items-center gap-1 ${!isUrgent || file ? 'border-custom-green text-custom-green cursor-pointer' : 'border-gray-300 text-gray-300 cursor-not-allowed'}`} 
                            onClick={isUrgent && !file ? undefined : borrowItem}>
                            <CheckCircleOutlineOutlinedIcon fontSize="small" className={`${!isUrgent || file ? 'text-custom-green':'text-custom-gray cursor-not-allowed'}`}/>
                            <button className={`${!isUrgent || file ? 'text-custom-green':'text-custom-gray cursor-not-allowed disabled'}`}>Borrow</button>
                        </div>
                        <div className={`border py-1 px-3 rounded-lg flex items-center gap-1 ${!isUrgent || file ? 'border-custom-primary text-custom-primary cursor-pointer' : 'border-gray-300 text-gray-300 cursor-not-allowed'}`} 
                            onClick={() => isUrgent && !file ? undefined : handleAddToCart(item)}>
                            <ShoppingCartOutlinedIcon fontSize="small" className={`${!isUrgent || file ? 'text-custom-primary':'text-custom-gray cursor-not-allowed'}`} />
                            <button className={`${!isUrgent || file ? 'text-custom-primary':'text-custom-gray cursor-not-allowed disabled'}`}>Add cart</button>
                        </div>
                    </div>
                </div>
            </Box>
        </MaterialUIModal>
    );
}