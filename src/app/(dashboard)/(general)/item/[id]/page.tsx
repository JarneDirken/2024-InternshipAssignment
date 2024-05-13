'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import { Item } from "@/models/Item";
import { app } from "@/services/firebase-config";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import Image from "next/image";
import Button from "@/components/states/Button";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Modal from "@/components/(user)/borrow/Modal";
import ModalLendings from "@/components/(supervisor)/lendings/Modal";
import { ItemRequest } from "@/models/ItemRequest";
import useUser from "@/hooks/useUser";

export default function GeneralItem({ params } : {params: {id: string}}){
    const id = params.id;
    const { isAuthorized, loading, userRole } = useAuth(['Student','Teacher','Supervisor', 'Admin']);
    const { userId, token } = useUser();
    const [item, setItem] = useState<Item>();
    const [dataFound, setDataFound] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const [isModalCheckOpen, setIsModalCheckOpen] = useState(false);
    const [itemLoading, setItemLoading] = useState(true);
    const [checked, setChecked] = useState(false);
    const [lastItemRequest, setLastItemRequest] = useState<ItemRequest | undefined>();
    const [repairState, setRepairState] = useState(false);

    useEffect(() => {
        if(userId) {
            if (!isModalOpen) {
                getItem();
            }
            
        }
    }, [userId, id, isModalOpen]);

    const formatDate = (dateString?: Date): string => {
        if (!dateString) {return ''}
        const options: Intl.DateTimeFormatOptions = {
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };

    const checkAvailability = (item: Item) => {
        switch(item.itemStatusId){
            case 1:
                return (
                    <div className="flex justify-center">
                        <Button 
                            text="Borrow" 
                            textColor="white" 
                            borderColor="custom-primary" 
                            fillColor="custom-primary"
                            paddingY="py-0"
                            font="semibold"
                            onClick={() => setModalOpen(true)}
                        />
                    </div>
                );
            case 2:
                return (
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-bold">Not available for borrow</span>
                        <div className="text-gray-400 text-sm flex gap-1">
                            <AccessTimeIcon fontSize="small"/>
                            <span>
                                {formatDate(item.ItemRequests?.[item.ItemRequests.length - 1]?.startBorrowDate)}
                                &nbsp;-&nbsp;
                                {formatDate(item.ItemRequests?.[item.ItemRequests.length - 1]?.endBorrowDate)}
                            </span>
                        </div>
                    </div>
                );
            case 3:
            case 4:
                return (
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-bold">Not available for borrow</span>
                        <div className="text-gray-400 text-sm flex gap-1">
                            <AccessTimeIcon fontSize="small"/>
                            <span>
                                {formatDate(item.ItemRequests?.[item.ItemRequests.length - 1]?.borrowDate)}
                                &nbsp;-&nbsp;
                                {formatDate(item.ItemRequests?.[item.ItemRequests.length - 1]?.returnDate)}
                            </span>
                        </div>
                    </div>
                );
            case 5:
            case 6:
                return (
                    <div className="flex flex-col justify-center items-center">
                        <span className="font-bold">Technical difficulties</span>
                    </div>
                );
        };
    };

    async function getItem() {
        setItemLoading(true);
        const params: Record<string, string> = {}
        if (userId !== null) {
            params.userId = userId;
        };
        const queryString = new URLSearchParams(params).toString();
        try {
            const response = await fetch(`/api/item/${id}?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            setItem(data);
            if (data.ItemRequests && data.ItemRequests.length > 0) {
                setLastItemRequest(data.ItemRequests[data.ItemRequests.length - 1]);
            } else {
                setLastItemRequest(undefined);
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
            setDataFound(false);
        } finally {
            setItemLoading(false);
        }
    };

    const isChecked = () => {
        setChecked!(true);
        setIsModalCheckOpen(true);
    };

    if (loading || isAuthorized === null || itemLoading) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    if (!dataFound || !item) {
        return <div className="bg-white p-4 rounded-xl shadow-md text-center text-lg">
            {`No item found with ID ${id}`}
        </div>;
    }

    const getLastItemRequest = () => {
        return item.ItemRequests && item.ItemRequests.length > 0
            ? item.ItemRequests[item.ItemRequests.length - 1]
            : undefined;
    };

    const currentLastItemRequest = getLastItemRequest();

    return (
        <>
            <Modal 
                open={isModalOpen}
                onClose={() => setModalOpen(false)}
                item={item}
                userId={userId}
            />
            <ModalLendings
                open={isModalCheckOpen}
                onClose={() => setIsModalCheckOpen(false)}
                userId={userId}
                item={lastItemRequest}
                checked={checked}
                repairState={repairState}
                setRepairState={setRepairState}
            />
            <div className="bg-white mb-4 rounded-xl">
                <div className="p-4 flex flex-wrap font-semibold text-2xl items-center gap-1">
                    <Inventory2OutlinedIcon />
                    <span>{item.name}</span>
                </div>
                <hr />
                <div className="p-4 flex flex-col md:flex-row md:justify-between">
                    <div className="flex justify-center items-center">
                        <Image 
                            src={!item.image ? "/assets/images/defaultImage.jpg" : item.image}
                            alt={item.name}
                            style={{ width: 'auto', height: '120px'}}
                            width={120}
                            height={120}
                            loading="lazy"
                        />
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col">
                                <span className="text-gray-400 font-semibold">Model</span>
                                <span>{item.model}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 font-semibold">Brand</span>
                                <span>{item.brand}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-400 font-semibold">Location</span>
                                <span>{item.location.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col mt-4 md:justify-center md:items-center gap-2">
                        {checkAvailability(item)}
                        {currentLastItemRequest ? (
                        ((userRole === "Supervisor" || userRole === "Admin") && currentLastItemRequest.requestStatusId === 6) && (
                            <Button 
                                text="Checked"
                                textColor="custom-green"
                                borderColor="custom-green"
                                paddingX="px-2"
                                paddingY="py-0"
                                onClick={isChecked}
                            />
                        )
                    ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}