'use client';
import { useSnackbar } from "notistack";
import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
//icons
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
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
                    <>
                        <div className="flex justify-between py-3 px-4 border-b-2 border-gray-200">
                            <div className="flex gap-2">
                                <span className="font-bold"><Inventory2OutlinedIcon /></span>
                                <span className="font-bold">Add product</span>
                            </div>
                            <div className="">
                                <span><CloseOutlinedIcon /></span>
                            </div>
                        </div>
                        <div></div>
                    </>
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
                <div id="modal-description" className="modal-body">
                    {renderContent()}
                </div>
                <div>
                    <button onClick={handleAction}>
                        {mode === 'delete' ? 'Delete' : 'Save'}
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </Box>
        </MaterialUIModal>
    );
}