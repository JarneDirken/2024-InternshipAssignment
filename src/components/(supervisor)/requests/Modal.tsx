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
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
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
    rejected?: boolean;
    setRejected?: (value: boolean) => void;
    approved?: boolean;
    setApproved?: (value: boolean) => void;
    requestStatusId?: number | null;
    setRequestStatusId?: (value: number | null) => void;
}

export default function Modal({ open, onClose, item, userId, rejected, setRejected, approved, setApproved, requestStatusId, setRequestStatusId }: ModalCardProps) {
    const [message, setMessage] = useState<string | null>(null);  // State can be string or null
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const [requests, setRequest] = useRecoilState(updateRequest);

    async function requestItem() {
        if (!item) { console.error("error"); return; }
        const data = {
            requestId: item.id,
            itemId: item.item.id,
            requestStatusId: requestStatusId,
            approverId: userId,
            approveMessage: message,
            decisionDate: new Date().toISOString(),
            borrowDate: item.startBorrowDate,
            returnDate: item.endBorrowDate
        };

        const response = await fetch(`/api/supervisor/itemrequest/`, {
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

    const formatDate = (date?: Date | string) => {
        if (!date) {
            return <span>No date set</span>;
        }
    
        const dateObj = date instanceof Date ? date : new Date(date);

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return dateObj.toLocaleDateString('en-US', options);
    };

    const viewNameHistory = () => {
        console.log("Name");
    };

    const viewRequestorHistory = () => {
        console.log("Requestor");
    };

    const handleSuccess = () => {
        onClose();
        setRequestStatusId!(null);
        if(rejected) {enqueueSnackbar('Request successfully rejected', { variant: 'success' });}
        if(approved) {enqueueSnackbar('Request successfully approved', { variant: 'success' });}
        setRejected!(false);
        setApproved!(false);
        setRequest(!requests);
        setMessage("");
    };

    const rejectedButton = () => {
        setRejected!(true);
        setRequestStatusId!(3); // 3 === rejected
    };

    const approvedButton = () => {
        setApproved!(true);
        setRequestStatusId!(2); // 2 === accepted
    };

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setMessage(inputValue === "" ? null : inputValue);  // Set to null if empty
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
                    {!rejected && !approved && (
                        <div className="flex items-center gap-2">
                            <ContentPasteOutlinedIcon />
                            <h1 id="borrow-modal-title" className="text-xl">{item.isUrgent&&(<span>Urgent&nbsp;</span>)}Request details</h1>
                        </div>
                    )}
                    {rejected && (
                        <div className="flex items-center gap-2 text-custom-red font-semibold">
                            <WarningAmberIcon fontSize="large"/>
                            <h1 id="borrow-modal-title" className="text-xl">You're about to reject a borrow request. Are you sure?</h1>
                        </div>
                    )}
                    {approved && (
                        <div className="flex items-center gap-2 text-custom-green font-semibold">
                            <CheckCircleOutlineOutlinedIcon fontSize="large"/>
                            <h1 id="borrow-modal-title" className="text-xl">You're about to approve a borrow request. Are you sure?</h1>
                        </div>
                    )}
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
                                <div className="flex gap-2 text-custom-primary">
                                    <AccessTimeIcon fontSize="small"/>
                                    Pending
                                </div>
                                <div className="flex gap-2 text-custom-gray text-sm">
                                    <AccessTimeIcon fontSize="small"/>
                                    {formatDate(item.startBorrowDate)} - {formatDate(item.endBorrowDate)}
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
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 lg:mt-4">
                            <div className="flex justify-between gap-1">
                                <div className="flex flex-col">
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-400">Name</span>
                                        {!rejected && !approved && (
                                            <div className="text-custom-primary cursor-pointer" onClick={viewNameHistory}>
                                                <RestoreOutlinedIcon fontSize="small"/>
                                            </div>
                                        )}
                                    </div>
                                    <span>{item.item.name}</span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-400">Requestor</span>
                                        {!rejected && !approved && (
                                            <div className="text-custom-primary cursor-pointer" onClick={viewRequestorHistory}>
                                                <RestoreOutlinedIcon fontSize="small"/>
                                            </div>
                                        )}
                                    </div>
                                    <span className="capitalize">{item.borrower.firstName} {item.borrower.lastName}</span>
                                </div>
                            </div>
                            <div className="flex justify-between gap-1">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Model</span>
                                    <span>{item.item.model}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Brand</span>
                                    <span>{item.item.brand}</span>
                                </div>
                            </div>
                            <div className="flex justify-between gap-1">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Location</span>
                                    <span>{item.item.location.name}</span>
                                </div>
                                {item.item.consumable && (
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-400">Amount</span>
                                        <span>{item.amountRequest}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {(rejected || approved) && (
                            <div className="flex flex-col gap-3 mt-4 lg:mt-8">
                                <div>
                                    <span></span>
                                    <ThemeProvider theme={theme}>
                                        <TextField
                                            id="outlined"
                                            label={`${rejected ? "Reject " : ""}${approved ? "Approve " : ""}message`}
                                            size="small"
                                            className="bg-white w-full"
                                            name="message"
                                            type="text"
                                            value={message || ""}
                                            onChange={handleMessageChange}
                                            placeholder="Message"
                                            required={rejected}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </ThemeProvider>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-row justify-between overflow-hidden items-center py-2 px-2 md:px-16 xl:px-36 border-t border-t-gray-200 bottom-0">
                    <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={onClose}>
                        <button className="text-custom-gray">Cancel</button>
                    </div>
                    {!rejected && !approved && (
                        <>
                            <div className='border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-red cursor-pointer'
                                onClick={rejectedButton}>
                                <CancelOutlinedIcon fontSize="small" className='text-custom-red' />
                                <button className='text-custom-red'>Reject</button>
                            </div>
                            <div className='border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-green cursor-pointer'
                                onClick={approvedButton}>
                                <CheckCircleOutlineOutlinedIcon fontSize="small" className='text-custom-green' />
                                <button className='text-custom-green'>Approve</button>
                            </div>
                        </>
                    )}
                    {rejected && (
                        <div className={`border py-1 px-3 rounded-lg flex items-center gap-1 ${message ? 'border-custom-red cursor-pointer' : 'border-custom-gray cursor-not-allowed'}`}
                            onClick={message ? requestItem : undefined}>
                            <button className={`text-${message ? 'custom-red' : 'custom-gray cursor-not-allowed'}`}>Confirm</button>
                        </div>
                    )}
                    {approved && (
                        <div className='border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-green cursor-pointer'
                            onClick={requestItem}>
                            <button className='text-custom-green'>Confirm</button>
                        </div>
                    )}
                </div>
            </Box>
        </MaterialUIModal>
    );
}