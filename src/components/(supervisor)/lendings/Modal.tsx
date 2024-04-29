'use client';
import { useSnackbar } from "notistack";
import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { ItemRequest } from "@/models/ItemRequest";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Image from 'next/image';
//icons
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { updateRequest } from "@/services/store";

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    item: ItemRequest | undefined;
    userId: String | null;
    handover?: boolean;
    receive?: boolean;
    checked?: boolean;
    repairState?: boolean;
    setRepairState?: (value: boolean) => void;
}

export default function Modal({ open, onClose, item, userId, handover, receive, checked, repairState, setRepairState }: ModalCardProps) {
    const [message, setMessage] = useState<string | null>("");  // State can be string or null
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const [requests, setRequest] = useRecoilState(updateRequest);

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setMessage(inputValue === "" ? null : inputValue);  // Set to null if empty
    };

    async function handOverItem() {
        if (!item) { console.error("error"); return; }
        const data = {
            requestId: item.id,
            itemId: item.item.id,
            userId
        };

        const response = await fetch(`/api/supervisor/pendingborrows/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Item succesfully handed over', { variant: 'success' })
        } else {
            console.error('Failed to update item request');
        }
    };

    async function receiveItem() {
        if (!item) { console.error("error"); return; }
        const data = {
            requestId: item.id,
            itemId: item.item.id,
            userId
        };

        const response = await fetch(`/api/supervisor/pendingreturns/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Item succesfully received', { variant: 'success' })
        } else {
            console.error('Failed to update item request');
        }
    };

    async function checkItem(repairState: boolean | undefined) {
        if (!item) { console.error("error"); return; }
        const data = {
            requestId: item.id,
            itemId: item.item.id,
            repairState,
            message,
            userId
        };

        const response = await fetch(`/api/supervisor/checkitem/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
        } else {
            console.error('Failed to update item request');
        }
    };

    const handleSuccess = () => {
        onClose();
        setRequest(!requests);
    };

    const formatDateTime = (date?: Date | string) => {
        if (!date) {
            return <span>No date set</span>;
        }
    
        const dateObj = date instanceof Date ? date : new Date(date);
    
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return dateObj.toLocaleDateString('en-US', options).replace(',', ' -');
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
            onClose={onClose}
            aria-labelledby="borrow-modal-title"
            aria-describedby="borrow-modal-description"
        >
            <Box
                className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[50%] rounded-lg shadow-lg h-[70%] flex flex-col"
            >
                <div className="flex px-4 py-4 justify-between items-center border-b border-b-gray-300">
                    <div className="flex items-center gap-2 text-custom-green font-semibold">
                        {handover && (
                            <>
                                <CheckCircleOutlineOutlinedIcon fontSize="large"/>
                                <h1 id="borrow-modal-title" className="text-xl">You're about to lend this item out. Are you sure?</h1>
                            </>
                        )}
                        {receive && (
                            <>
                                <CheckCircleOutlineOutlinedIcon fontSize="large"/>
                                <h1 id="borrow-modal-title" className="text-xl">You're about to receive this item. Are you sure?</h1>
                            </>
                        )}
                        {checked && (
                            repairState ? (
                                <>
                                    <WarningAmberIcon fontSize="large" className="text-custom-primary"/>
                                    <h1 id="borrow-modal-title" className="text-xl text-custom-primary">You're about to mark this item as broken. Are you sure?</h1>
                                </>
                            ) : (
                                <>
                                    <CheckCircleOutlineOutlinedIcon fontSize="large"/>
                                    <h1 id="borrow-modal-title" className="text-xl">You're about to check this item. Are you sure?</h1>
                                </>
                            )
                        )}
                    </div>
                    <ClearIcon className="cursor-pointer" onClick={onClose} />
                </div>
                <div id="borrow-modal-description" className="overflow-y-auto flex-grow">
                    <div className="flex flex-col xl:flex-col px-8 xl:px-28 py-2">
                        <div className="flex flex-col xl:flex-row xl:gap-8 py-2">
                            <div className="flex flex-col xl:w-1/2">
                                <div className="flex justify-center mb-2 xl:justify-start">
                                    {!item.item.image ? (
                                        <Image 
                                            src="/assets/images/defaultImage.jpg"
                                            width={72}
                                            height={100}
                                            alt="Default iamge"
                                        />
                                    ) : (
                                        <img 
                                            src={item.item.image}
                                            alt={item.item.name} 
                                            style={{ width: '200px', height: '200px', objectFit: 'cover' }} 
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col xl:w-1/2 xl:items-end gap-2">
                                <div className="flex gap-2 text-custom-gray text-sm">
                                    <AccessTimeIcon fontSize="small"/>
                                    {handover ? (
                                        formatDateTime(item.borrowDate)
                                    ) : (
                                        formatDateTime(item.returnDate)
                                    )}
                                </div>
                                <div>
                                {item.isUrgent && (
                                    <div className="flex flex-col">
                                        <a href={item.file} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                                            <div className="flex items-center text-custom-blue underline cursor-pointer">
                                                <span>Signed Approval Document</span>
                                                <DownloadOutlinedIcon fontSize="small" />
                                            </div>
                                        </a>
                                    </div>
                                )}
                                </div>
                                <div>
                                    <span>Information requestor:</span>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-400">Telephone:&nbsp;</span>
                                        <a className="text-custom-blue underline cursor-pointer" 
                                            href={`tel:${item.borrower.tel}`} rel="noopener noreferrer">
                                                {item.borrower.tel}
                                        </a>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-semibold text-gray-400">Email:&nbsp;</span>
                                        <a className="text-custom-blue underline cursor-pointer" 
                                            href={`mailto:${item.borrower.email}`} rel="noopener noreferrer">
                                                {item.borrower.email}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 lg:mt-4">
                            <div className="flex justify-between gap-1">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Name</span>
                                    <span>{item.item.name}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Requestor</span>
                                    <span className="capitalize">{item.borrower.firstName} {item.borrower.lastName}</span>
                                </div>
                            </div>
                            <div className="flex justify-between gap-1">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Model</span>
                                    <span>{item.item.model}</span>
                                </div>
                                {item.approver && (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-400">Approver</span>
                                        <span className="capitalize">{item.approver.firstName} {item.approver.lastName}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between gap-1">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Location</span>
                                    <span>{item.item.location.name}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Brand</span>
                                    <span>{item.item.brand}</span>
                                </div>
                            </div>
                        </div>
                        {repairState && (
                            <div className="mt-4">
                                <ThemeProvider theme={theme}>
                                        <TextField
                                            id="outlined"
                                            label="Repair message"
                                            size="small"
                                            className="bg-white w-full"
                                            name="message"
                                            type="text"
                                            value={message || ""}
                                            onChange={handleMessageChange}
                                            placeholder="Message"
                                            required
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </ThemeProvider>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between overflow-hidden items-center py-2 px-2 md:px-16 xl:px-36 border-t border-t-gray-200 bottom-0">
                    {handover && (
                        <div className="flex justify-between w-full">
                            <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={onClose}>
                                <button className="text-custom-gray">Cancel</button>
                            </div>
                            <div className='border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-green cursor-pointer'
                                onClick={handOverItem}>
                                <button className='text-custom-green'>Confirm</button>
                            </div>
                        </div>
                    )}
                    {receive && (
                        <div className="flex justify-between w-full">
                            <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={onClose}>
                                <button className="text-custom-gray">Cancel</button>
                            </div>
                            <div className='border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-green cursor-pointer'
                                onClick={receiveItem}>
                                <button className='text-custom-green'>Confirm</button>
                            </div>
                        </div>
                    )}
                    {checked && (
                        <div className="flex justify-between w-full">
                            {repairState ? (
                                <>
                                <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={() => setRepairState!(false)}>
                                    <button className="text-custom-gray">Cancel</button>
                                </div>
                                <div className={`border py-1 px-3 rounded-lg flex items-center gap-1 ${message ? 'border-custom-primary cursor-pointer' : 'border-custom-gray cursor-not-allowed'}`}
                                    onClick={message ? () => checkItem(repairState) : undefined}>
                                    <button className={`${message ? 'text-custom-primary cursor-pointer' : 'text-custom-gray cursor-not-allowed'}`}>Confirm</button>
                                </div>
                                </>
                            ) : (
                                <>
                                <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={onClose}>
                                    <button className="text-custom-gray">Cancel</button>
                                </div>
                                <div className='border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-green cursor-pointer'
                                    onClick={() => checkItem(repairState)}>
                                    <button className='text-custom-green'>Confirm</button>
                                </div>
                                    <div className='border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-primary cursor-pointer'
                                    onClick={() => setRepairState!(true)}>
                                    <button className='text-custom-primary'>Repair</button>
                                </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </Box>
        </MaterialUIModal>
    );
}