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
import { Item } from "@/models/Item";

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    item?: Item;
    mode: 'add' | 'edit' | 'delete';
}

export default function Modal({ open, onClose, item, mode }: ModalCardProps) {
    const [message, setMessage] = useState<string | null>(null);  // State can be string or null
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const [requests, setRequest] = useRecoilState(updateRequest);

    async function handOverItem() {
        if (!item) { console.error("error"); return; }
        const data = {
            itemId: item.id,
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
            itemId: item.id,
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

    async function checkItem() {
        if (!item) { console.error("error"); return; }
        const data = {
            itemId: item.id,
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

    const handleSuccess = () => {
        onClose();
        setRequest(!requests);
        setMessage("");
    };

    const handleAdd = async () => {
        // Logic to handle add
    };

    const handleEdit = async () => {
        // Logic to handle edit
    };

    const handleDelete = async () => {
        // Logic to handle delete
    };

    const renderContent = () => {
        switch (mode) {
            case 'add':
                return (
                    <TextField label="Item Name" variant="outlined" fullWidth />
                    // Add more input fields as necessary
                );
            case 'edit':
                return (
                    <>
                        <TextField
                            label="Item Name"
                            variant="outlined"
                            defaultValue={item?.name}
                            fullWidth
                        />
                    </>
                );
            case 'delete':
                return (
                    <p>Are you sure you want to delete {item?.name}?</p>
                );
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
                <div className="modal-header">
                    {/* Render dynamic header based on mode */}
                    {mode === 'delete' ? 'Confirm Deletion' : 'Item Details'}
                </div>
                <div id="modal-description" className="modal-body">
                    {renderContent()}
                </div>
                <div className="modal-footer">
                    <button onClick={handleAction}>
                        {mode === 'delete' ? 'Delete' : 'Save'}
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </Box>
        </MaterialUIModal>
    );
}