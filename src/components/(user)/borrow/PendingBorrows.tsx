'use client';
import Button from "@/components/states/Button";
import Loading from "@/components/states/Loading";
import { requestsState } from "@/services/store";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import AccessTimeIcon from '@mui/icons-material/AccessTime';


interface PendingBorrowProps {
    active: boolean;
    nameFilter: string;
    modelFilter: string;
    brandFilter: string;
    locationFilter: string;
    userId: string;
}

export default function PendingBorrows({ active, nameFilter, modelFilter, brandFilter, locationFilter, userId }: PendingBorrowProps) {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useRecoilState(requestsState);
    const [canceled, setCanceled] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    
    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";
    
    // get item requests with pagination and filter on SERVER SIDE
    async function getPendingBorrows(nameFilter = '', modelFilter = '', brandFilter = '', locationFilter = '') {
        setLoading(true);
        try {
            if (!userId) { return; }
            const queryString = new URLSearchParams({
                userId: userId,
                name: nameFilter,
                model: modelFilter,
                brand: brandFilter,
                location: locationFilter
            }).toString();
            const response = await fetch(`/api/user/itemrequest?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setRequests(data.itemRequests);
        } catch (error) {
            console.error("Failed to fetch item requests:", error);
        } finally {
            setLoading(false);
        }
    }

    async function cancelPendingBorrow(requestId: number, itemId: number){
        try {
            const queryString = new URLSearchParams({
                itemId: itemId.toString()
            }).toString();
            const response = await fetch(`/api/user/itemrequest/${requestId}?${queryString}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            handleSuccessCancle();
        } catch (error) {
            console.error("Failed to cancel pending borrow request: ", error)
        }
    }

    const handleSuccessCancle = () => {
        setCanceled(current => !current);
        enqueueSnackbar('Request cancelled successfully', { variant: 'success' });
    }

    useEffect(() => {
        getPendingBorrows(nameFilter, modelFilter, brandFilter, locationFilter);
    }, [nameFilter, modelFilter, brandFilter, locationFilter, canceled]);

    function formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    if (loading) { return (<Loading />); }

    if (requests.length === 0) {
        return <div>No borrow requests found!</div>;
    }

    return (
        <div>
            <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {requests.map((request) => (
                    <div key={request.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                                <div className="flex flex-row items-center w-full">
                                    <div className="w-1/12">
                                        <img 
                                            src={request.item.image}
                                            alt={request.item.name} 
                                            style={{ width: '100px', height: '72px', objectFit: 'cover' }} 
                                            />
                                    </div>
                                    <div className="flex flex-col w-1/4">
                                        <div className="truncate">
                                            <span className="font-semibold">Name:&nbsp;</span>
                                            <span>{request.item.name}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Model:&nbsp;</span>
                                            <span>{request.item.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        <div className="truncate">
                                            <span className="font-semibold">Brand:&nbsp;</span>
                                            <span>{request.item.brand}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{request.item.location.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex truncate items-center text-custom-primary gap-1">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>Pending</span>
                                        </div>
                                        <div className="flex truncate items-center text-gray-400 gap-1 text-sm">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>{formatDate(new Date(request.startBorrowDate))} - {formatDate(new Date(request.endBorrowDate))}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-1/12">
                                    <Button 
                                        text="Cancel"
                                        textColor="custom-red"
                                        borderColor="custom-red" 
                                        paddingY="py-0"
                                        onClick={() => cancelPendingBorrow(request.id, request.itemId)}
                                    />
                                    <Button 
                                        text="View" 
                                        textColor="white" 
                                        borderColor="custom-primary" 
                                        fillColor="custom-primary"
                                        paddingY="py-0"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="p-2 flex items-center">
                                    <div className="flex w-1/2 flex-wrap">
                                        <span className="text-lg font-semibold flex-wrap">{request.item.name}</span>
                                    </div>
                                    <div className="w-1/2 flex flex-col items-end">
                                        <div className="flex items-center text-custom-primary gap-1">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span className="truncate">Pending</span>
                                        </div>
                                        <div className="flex truncate items-center text-gray-400 gap-1 text-sm">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>{formatDate(new Date(request.startBorrowDate))} - {formatDate(new Date(request.endBorrowDate))}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex items-center p-4">
                                    <div className="w-1/3 flex justify-center mr-2">
                                    <img 
                                        src={request.item.image}
                                        alt={request.item.name} 
                                        style={{ width: '100px', height: '72px', objectFit: 'cover' }} 
                                        />
                                    </div>
                                    <div className="flex flex-col items-start w-2/3">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-start truncate">
                                                <span className="text-gray-400">Model</span>
                                                <span>{request.item.model}</span>
                                            </div>
                                            <div className="flex flex-col items-start truncate">
                                                <span className="text-gray-400">Brand</span>
                                                <span>{request.item.brand}</span>
                                            </div>
                                        </div>
                                        <div className="truncate flex flex-col items-start w-full">
                                            <span className="text-gray-400">Location</span>
                                            <span>{request.item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-center items-center p-2">
                                    <Button 
                                        text="Cancel"
                                        textColor="custom-red"
                                        borderColor="custom-red" 
                                        paddingY="py-0"
                                        onClick={() => cancelPendingBorrow(request.id, request.itemId)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}