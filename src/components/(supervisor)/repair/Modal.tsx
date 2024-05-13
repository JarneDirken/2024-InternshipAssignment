import { useSnackbar } from "notistack";
import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Image from 'next/image';
//icons
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Repair } from "@/models/Repair";
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import { useRecoilState } from "recoil";
import { repariState } from "@/services/store";
import DoNotTouchOutlinedIcon from '@mui/icons-material/DoNotTouchOutlined';
import { useRouter } from 'next/navigation';

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    item: Repair | undefined;
    selectedTab: string;
    repaired: boolean;
    broken: boolean;
    setRepaired: (value: boolean) => void;
    setBroken: (value: boolean) => void;
}

export default function Modal({ open, onClose, item, repaired, broken, setRepaired, setBroken, selectedTab }: ModalCardProps) {
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const [repair, setRepair] = useRecoilState(repariState);
    const router = useRouter();

    async function repairItem() {
        if (!item) { console.error("error"); return; }
        const data = {
            repairId: item.id,
            itemId: item.itemId,
            broken
        };

        const response = await fetch(`/api/supervisor/repairs/`, {
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

    const viewItemHistory = (itemId: number) => {
        const type="item"
        router.push(`/historypage/${type}/${itemId}`);
    };

    const viewUserHistory = (userId: number) => {
        const type="user"
        router.push(`/historypage/${type}/${userId}`);
    };

    const handleSuccess = () => {
        onClose();
        setRepair(!repair);
        if(broken) {enqueueSnackbar('Item successfully marked as broken', { variant: 'success' });}
        if(repaired) {enqueueSnackbar('Item successfully marked as repaired', { variant: 'success' });}
    };

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
                    {!repaired && !broken && (
                        <div className="flex items-center gap-2">
                            <HandymanOutlinedIcon fontSize="large"/>
                            <h1 id="borrow-modal-title" className="text-xl">Repair details</h1>
                        </div>
                    )}
                    {repaired && (
                        <div className="flex items-center gap-2 text-custom-green font-semibold">
                            <CheckCircleOutlineOutlinedIcon fontSize="large"/>
                            <h1 id="borrow-modal-title" className="text-xl">You&apos;re about to mark this item as repaired. Are you sure?</h1>
                        </div>
                    )}
                    {broken && (
                        <div className="flex items-center gap-2 text-custom-red font-semibold">
                            <WarningAmberIcon fontSize="large"/>
                            <h1 id="borrow-modal-title" className="text-xl">You&apos;re about to mark this item as broken. Are you sure?</h1>
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
                                {selectedTab === "history" ? (
                                    <>
                                        {item.returnDate && (
                                            <div className="flex truncate text-custom-green gap-1 text-sm sm:text-base">
                                                <CheckCircleOutlineOutlinedIcon fontSize="small"/>
                                                <span>Repaired</span>
                                            </div>
                                        )}
                                        {item.item.itemStatusId === 6 && (
                                            <div className="flex truncate text-custom-red gap-1 text-sm sm:text-base">
                                                <DoNotTouchOutlinedIcon fontSize="small"/>
                                                <span>Broken</span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex truncate text-custom-primary gap-1 text-sm sm:text-base">
                                        <AccessTimeIcon fontSize="small"/>
                                        <span>Pending</span>
                                    </div>
                                )}
                                <div className="flex gap-2 text-custom-gray text-sm">
                                    <AccessTimeIcon fontSize="small"/>
                                    {item.returnDate ? (
                                        <span>{formatDate(item.repairDate)} - {formatDate(item.returnDate)}</span>
                                    ) : (
                                        <span>{formatDate(item.repairDate)} - /</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 lg:mt-4">
                            <div className="flex justify-between gap-1">
                                <div className="flex flex-col">
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-400">Name</span>
                                        <div className="text-custom-primary cursor-pointer" onClick={() => viewItemHistory(item.itemId)}>
                                            <RestoreOutlinedIcon fontSize="small"/>
                                        </div>
                                    </div>
                                    <span>{item.item.name}</span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex gap-2">
                                        <span className="font-semibold text-gray-400">Last used</span>
                                        <div className="text-custom-primary cursor-pointer" onClick={() => viewUserHistory(item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.id ?? 0)}>
                                            <RestoreOutlinedIcon fontSize="small"/>
                                        </div>
                                    </div>
                                    <span className="capitalize">
                                        {item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.firstName ?? 'Default First Name'}{' '}
                                        {item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.lastName ?? 'Default Last Name'}
                                    </span>
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
                                        <span>{item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.amountRequest ?? '/'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between gap-1">
                                <div className="flex flex-col">
                                    <span className="font-semibold text-gray-400">Notes</span>
                                    <span>{item.notes}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`flex flex-row overflow-hidden items-center py-2 px-2 md:px-16 xl:px-36 border-t border-t-gray-200 bottom-0 ${selectedTab==="history" ? 'justify-center' : 'justify-between'}`}>
                    <div className="border-custom-gray border py-1 px-3 rounded-lg cursor-pointer" onClick={onClose}>
                        <button className="text-custom-gray">Cancel</button>
                    </div>
                    {(!repaired && !broken && selectedTab !== "history") && (
                        <>
                            <div className='group border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-red group-hover:border-custom-red-hover cursor-pointer'
                                onClick={() => setBroken(true)}>
                                <CancelOutlinedIcon fontSize="small" className='text-custom-red group-hover:text-custom-red-hover' />
                                <button className='text-custom-red group-hover:text-custom-red-hover'>Broken</button>
                            </div>
                            <div className='group border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-green group:border-custom-green-hover cursor-pointer'
                                onClick={() => setRepaired(true)}>
                                <CheckCircleOutlineOutlinedIcon fontSize="small" className='text-custom-green group-hover:text-custom-green-hover' />
                                <button className='text-custom-green group-hover:text-custom-green-hover'>Repaired</button>
                            </div>
                        </>
                    )}
                    {broken && (
                        <div className='group border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-red hover:border-custom-red-hover cursor-pointer'
                            onClick={repairItem}>
                            <button className='text-custom-red group-hover:text-custom-red-hover'>Confirm</button>
                        </div>
                    )}
                    {repaired && (
                        <div className='group border py-1 px-3 rounded-lg flex items-center gap-1 border-custom-green hover:border-custom-green-hover cursor-pointer'
                            onClick={repairItem}>
                            <button className='text-custom-green group-hover:text-custom-green-hover'>Confirm</button>
                        </div>
                    )}
                </div>
            </Box>
        </MaterialUIModal>
    );
}