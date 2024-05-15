'use client';
import { Item } from "@/models/Item";
import { createRequest } from "@/services/store";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from "@mui/material/TextField";
import useCart from "@/hooks/useCart";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
import Image from 'next/image';
//icons
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import DatePicker from "@/components/states/DatePicker";
import EditIcon from '@mui/icons-material/Edit';
import dayjs, { Dayjs } from "dayjs";
import { ParameterType } from "@/models/ParameterType";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    item?: Item;
    userId: String | null;
    token: String | null;
}

export default function Modal({ open, onClose, item, userId, token }: ModalCardProps) {
    const [amount, setAmount] = useState<string | null>(null); // amount 
    const [isUrgent, setIsUrgent] = useState(false); // change this to view / not view the urgent borrow request
    const [file, setFile] = useState<File | null>(null); // file uploader
    const [fileUrl, setFileUrl] = useState<string | null>(null); // file url from firebase
    const [request, setRequest] = useRecoilState(createRequest); // check if request is made
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const { addToCart } = useCart(); // useCart hook
    const primitiveUserId = userId ? String(userId) : null; // uid from firebase
    const [borrowDate, setBorrowDate] = useState<Date | null>(null); // borrow date
    const [returnDate, setReturnDate] = useState<Date | null>(null); // return date
    const [errorMessage, setErrorMessage] = useState<String | null>(null); // error message with dates
    const [editingDateType, setEditingDateType] = useState<'borrow' | 'return' | null>(null);
    const [startMorningTime, setStartMorningTime] = useState<Dayjs | null>(null);
    const [endMorningTime, setEndMorningTime] = useState<Dayjs | null>(null);
    const [startEveningTime, setStartEveningTime] = useState<Dayjs | null>(null);
    const [endEveningTime, setEndEveningTime] = useState<Dayjs | null>(null);
    const [startMorningTimeString, setStartMorningTimeString] = useState('');
    const [endMorningTimeString, setEndMorningTimeString] = useState('');
    const [startEveningTimeString, setStartEveningTimeString] = useState('');
    const [endEveningTimeString, setEndEveningTimeString] = useState('');
    const [morningBufferTime, setMorningBufferTime] = useState('');
    const [EveningBufferTime, setEveningBufferTime] = useState('');
    type DayjsSetterType = (value: Dayjs | null) => void;
    const [templateUrl, setTemplateUrl] = useState('');

    useEffect(() => {
        if (borrowDate && returnDate) {
            checkDateTime(borrowDate.toString(), returnDate.toString());
        }
    }, [borrowDate, returnDate, editingDateType]);

    useEffect(() => {
        getParameters();
        fetchCurrentTemplateUrl();
    }, []);

    const handleEditDate = (type: 'borrow' | 'return') => {
        setEditingDateType(type);
    };

    function checkDateTime(startDate: string, endDate: string) {
        if (!startMorningTime || !endEveningTime || !endMorningTime || !startEveningTime) {
            return;
        }
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const now = dayjs();
        const bufferTimeMorning = parseInt(morningBufferTime, 10);
        const bufferTimeEvening = parseInt(EveningBufferTime, 10);
    
        // Check if date is a weekday
        const isWeekday = (date: dayjs.Dayjs) => {
            const day = date.day();
            return day !== 0 && day !== 6;
        };

        const setTimeOnDate = (time: dayjs.Dayjs, date: dayjs.Dayjs): dayjs.Dayjs => {
            return dayjs(date)
                .hour(time.hour())
                .minute(time.minute())
                .second(0);
        };
        
        const adjustedStartMorningTime = setTimeOnDate(startMorningTime, start).subtract(1, 'second');
        const adjustedEndMorningTime = setTimeOnDate(endMorningTime, start).add(1, 'second');
        const adjustedStartEveningTimeBorrow = setTimeOnDate(startEveningTime, start).subtract(1, 'second');
        const adjustedEndEveningTimeBorrow = setTimeOnDate(endEveningTime, start).add(1, 'second');
        const adjustedStartMorningTimeReturn = setTimeOnDate(startMorningTime, end).subtract(1, 'second');
        const adjustedEndMorningTimeReturn = setTimeOnDate(endMorningTime, end).add(1, 'second');
        const adjustedStartEveningTime = setTimeOnDate(startEveningTime, end).subtract(1, 'second');
        const adjustedEndEveningTime = setTimeOnDate(endEveningTime, end).add(1, 'second');

        const startMorningPlusBuffer = adjustedStartMorningTime.subtract(bufferTimeMorning, "minutes");
        const startEveningPlusBuffer = adjustedStartEveningTime.subtract(bufferTimeEvening, "minutes");

        if (!isWeekday(start)) {
            setErrorMessage("Borrow date should be a week day");
            return;
        }

        if (!isWeekday(end)) {
            setErrorMessage("Return date should be a week day");
            return;
        }

        if (start.isBefore(now) || end.isBefore(now)) {
            setErrorMessage("Dates cannot be in the past");
            return;
        }
    
        if (start.isBefore(adjustedStartMorningTime) || start.isAfter(adjustedEndEveningTime)) {
            setErrorMessage("Borrow date should be between the hours");
            return;
        }
    
        if (!((end.isAfter(adjustedStartMorningTimeReturn) && end.isBefore(adjustedEndMorningTimeReturn)) ||
            (end.isAfter(adjustedStartEveningTime) && end.isBefore(adjustedEndEveningTime)))) {
            setErrorMessage("Return date should be within morning or evening hours");
            return;
        }

        if ((now.isAfter(startMorningPlusBuffer) && now.isBefore(adjustedEndMorningTime)) &&
            (start.isAfter(startMorningPlusBuffer) && start.isBefore(adjustedEndMorningTime)) ||
            (now.isAfter(startEveningPlusBuffer) && now.isBefore(adjustedEndEveningTime)) &&
            (end.isAfter(startEveningPlusBuffer) && end.isBefore(adjustedEndEveningTime))) {
            setErrorMessage("You cannot make a request for the upcoming timeslot. Please choose another time.");
            return;
        }

        if ((start.isBefore(adjustedStartMorningTime) || start.isAfter(adjustedEndMorningTime)) &&
            (start.isBefore(adjustedStartEveningTimeBorrow) || start.isAfter(adjustedEndEveningTimeBorrow))) {
            setIsUrgent(true);
            return;
        }

        setErrorMessage(null);
        setIsUrgent(false);
    };

    const handleDateSelection = (type: 'borrow' | 'return', date: Date) => {
        if (type === 'borrow') {
            setBorrowDate(date);
        } else {
            setReturnDate(date);
        }
    };

    const formatDateDisplay = (date: Date | null) => {
        if (!date) return '';
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    };

    const closeModal = () => {
        setBorrowDate(null);
        setReturnDate(null);
        setFileUrl(null);
        setIsUrgent(false);
        setFile(null);
        setEditingDateType(null);
        setErrorMessage(null);
        onClose();
    };

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
        if ((inputValue === '' || !isNaN(parseFloat(inputValue))) && inputValue.match(/^[-]?\d*\.?\d*$/)) {
            setAmount(inputValue !== '' ? inputValue : null);
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
        if (file) {
            const storage = getStorage();
            // Include the user ID in the file reference path
            const fileRef = ref(storage, `files/${primitiveUserId}/${file.name}`);
    
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

    const handleSuccess = () => {
        setRequest(!request);
        enqueueSnackbar('Borrowed item successfully', { variant: 'success' });
        closeModal();
    }

    const handleAddToCart = (item: Item) => {
        if (!item) {
            console.error("No item to add");
            return;
        }

        if (!token) {
            return "";
        }

        const primitiveToken: string = token.valueOf();

        const cartItem = {
            item,
            borrowDetails: {
                startDateTime: borrowDate,
                endDateTime: returnDate,
                isUrgent,
                file: fileUrl,
                amountRequest: amount,
                token: primitiveToken,
            }
        };

        const result = addToCart(cartItem);
        if (result.success) {
            setFile(null);
            setFileUrl('');
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
        enqueueSnackbar(result.message, { variant: result.success ? 'success' : 'error' });
        closeModal();
    };

    async function borrowItem() {
        if (!item) { console.error("error"); return; }
        const data = {
            itemId: item.id,
            requestStatusId: 1,
            borrowerId: userId,
            requestDate: new Date().toISOString(),
            startBorrowDate: borrowDate,
            endBorrowDate: returnDate,
            file: fileUrl,
            isUrgent: isUrgent,
            amountRequest: amount,
            token: token,
        };

        const response = await fetch(`/api/user/itemrequest/`, {
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
        } else {
            console.error('Failed to create item request');
        }
    };

    async function getParameters() {
        try {
            const response = await fetch(`/api/admin/parameter`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: ParameterType[] = await response.json();
            
            // Define setTime with explicit types for parameters
            const setTime = (paramName: string, dayjsSetter: DayjsSetterType, stringSetter: React.Dispatch<React.SetStateAction<string>>) => {
                const param = data.find(p => p.name === paramName);
                if (param) {
                    const [hour, minute] = param.value.split(':');
                    const dayjsTime = dayjs().hour(parseInt(hour)).minute(parseInt(minute)).second(0);
                    dayjsSetter(dayjsTime);
                    stringSetter(param.value);
                }
            };

            // Define setBufferTime for buffer time parameters
            const setBufferTime = (paramName: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
                const param = data.find(p => p.name === paramName);
                if (param) {
                    setter(param.value); // Directly set the string since buffer time is just a number of minutes
                }
            };

            setTime('morningStartTime', setStartMorningTime, setStartMorningTimeString);
            setTime('morningEndTime', setEndMorningTime, setEndMorningTimeString);
            setTime('eveningStartTime', setStartEveningTime, setStartEveningTimeString);
            setTime('eveningEndTime', setEndEveningTime, setEndEveningTimeString);

            setBufferTime('morningBufferTime', setMorningBufferTime);
            setBufferTime('eveningBufferTime', setEveningBufferTime);
        } catch (error) {
            console.error("Failed to fetch parameters:", error);
        }
    };

    async function fetchCurrentTemplateUrl() {
        const storage = getStorage();
        const directoryRef = ref(storage, 'templates/urgentBorrow/');
    
        try {
            const result = await listAll(directoryRef);
            if (result.items.length > 0) {
                const fileRef = result.items[0];  // Assuming there's at least one file and we take the first one
                const url = await getDownloadURL(fileRef);
                setTemplateUrl(url);
            } else {
                console.error('No files found in the directory.');
            }
        } catch (error) {
            console.error('Failed to list files:', error);
        }
    };

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

    if (!item) { return; }

    return (
        <MaterialUIModal
            open={open}
            onClose={closeModal}
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
                    <ClearIcon className="cursor-pointer" onClick={closeModal} />
                </div>
                <div id="borrow-modal-description" className="overflow-y-auto h-[87%]">
                    <div className="flex flex-col xl:flex-col xl:gap-8 px-8 py-2">
                        <div className="flex flex-col xl:flex-row xl:gap-8 py-2">
                            <div className="flex flex-col xl:w-1/2">
                                <div className="flex justify-center mb-2 xl:justify-start">
                                    {!item.image ? (
                                            <Image 
                                                src="/assets/images/defaultImage.jpg"
                                                width={72}
                                                height={100}
                                                alt="Default iamge"
                                          />
                                        ) : (
                                            <img 
                                                src={item.image}
                                                alt={item.name} 
                                                style={{ width: '200px', height: '200px', objectFit: 'cover' }} 
                                            />
                                        )}
                                </div>
                                <div className="flex flex-col gap-3 lg:mt-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-400">Name</span>
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="flex justify-between gap-1">
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
                                                    type="number"
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
                            <div className="xl:w-1/2 xl:block xl:items-end xl:justify-end flex justify-center transform z-0">
                                <DatePicker
                                    borrowDate={borrowDate}
                                    returnDate={returnDate}
                                    setBorrowDate={setBorrowDate}
                                    setReturnDate={setReturnDate}
                                    onDateSelection={handleDateSelection}
                                    setErrorMessage={setErrorMessage}
                                    editingDateType={editingDateType}
                                    setEditingDateType={setEditingDateType}
                                    startMorningTimeString={startMorningTimeString}
                                    endMorningTimeString={endMorningTimeString}
                                    startEveningTimeString={startEveningTimeString}
                                    endEveningTimeString={endEveningTimeString}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between gap-1">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-400">Borrow date</span>
                                    {borrowDate && returnDate && (
                                        <div className="rounded-full bg-custom-primary w-6 h-6 flex items-center justify-center text-white font-semibold cursor-pointer">
                                            <EditIcon fontSize="small" onClick={() => handleEditDate("borrow")} />
                                        </div>
                                    )}
                                </div>
                                {!borrowDate && (<span>Select a date</span>)}
                                <span >{formatDateDisplay(borrowDate)}</span>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-400">Return date</span>
                                    {borrowDate && returnDate && (
                                        <div className="rounded-full bg-custom-primary w-6 h-6 flex items-center justify-center text-white font-semibold cursor-pointer">
                                            <EditIcon fontSize="small" onClick={() => handleEditDate("return")}/>
                                        </div>
                                    )}
                                </div>
                                {!returnDate && (<span>Select a date</span>)}
                                <span>{formatDateDisplay(returnDate)}</span>
                            </div>
                        </div>
                    </div>
                    {errorMessage && (
                        <div className="flex justify-center font-bold text-custom-red">
                            {errorMessage}
                        </div>
                    )}
                    {isUrgent && (
                        <div className="flex flex-col px-8">
                            <div className="flex flex-row justify-between items-center">
                                <span className="">Download the file and re-upload it with a signature of your teacher.</span>
                                <a href={templateUrl} download target="_blank" rel="noopener noreferrer">
                                    <span className="text-custom-blue underline cursor-pointer">Download</span>
                                </a>
                            </div>
                            <div className="flex flex-col justify-center items-center mt-2">
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
                            <div className="my-4 flex justify-center items-center">
                                <span className="capitalize font-bold">You are making an <span className="text-custom-red">urgent borrow request!</span> are you sure you want to continue?</span>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-row justify-between items-center py-2 px-2 md:px-16 border-t border-t-gray-200 bottom-0">
                        <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={closeModal}>
                            <button className="text-custom-gray">Cancel</button>
                        </div>
                        <div className={`group border py-1 px-3 rounded-lg flex items-center gap-1 ${(!isUrgent && !fileUrl || isUrgent && fileUrl) && borrowDate && returnDate && !errorMessage ? 'border-custom-green text-custom-green cursor-pointer hover:border-custom-green-hover' : 'border-gray-300 text-gray-300 cursor-not-allowed'}`}
                            onClick={(!isUrgent && !fileUrl || isUrgent && fileUrl) && borrowDate && returnDate && !errorMessage ? borrowItem : undefined}>
                            <CheckCircleOutlineOutlinedIcon fontSize="small" className={`${(!isUrgent && !fileUrl || isUrgent && fileUrl) && borrowDate && returnDate && !errorMessage ? 'text-custom-green group-hover:text-custom-green-hover' : 'text-custom-gray cursor-not-allowed'}`} />
                            <button className={`${(!isUrgent && !fileUrl || isUrgent && fileUrl) && borrowDate && returnDate && !errorMessage ? 'text-custom-green group-hover:text-custom-green-hover' : 'text-custom-gray cursor-not-allowed disabled'}`}>Borrow</button>
                        </div>
                        <div className={`group border py-1 px-3 rounded-lg flex items-center gap-1 ${(!isUrgent && !fileUrl || isUrgent && fileUrl) && borrowDate && returnDate && !errorMessage ? 'border-custom-primary text-custom-primary cursor-pointer hover:border-custom-primary-hover' : 'border-gray-300 text-gray-300 cursor-not-allowed'}`}
                            onClick={() => (!isUrgent && !fileUrl || isUrgent && fileUrl) && borrowDate && returnDate && !errorMessage ? handleAddToCart(item) : undefined}>
                            <ShoppingCartOutlinedIcon fontSize="small" className={`${(!isUrgent && !fileUrl || isUrgent && fileUrl) && borrowDate && returnDate && !errorMessage ? 'text-custom-primary group-hover:text-custom-primary-hover' : 'text-custom-gray cursor-not-allowed'}`} />
                            <button className={`${(!isUrgent && !fileUrl || isUrgent && fileUrl) && borrowDate && returnDate && !errorMessage ? 'text-custom-primary group-hover:text-custom-primary-hover' : 'text-custom-gray cursor-not-allowed disabled'}`}>Add cart</button>
                        </div>
                    </div>
                </div>
            </Box>
        </MaterialUIModal>
    );
}