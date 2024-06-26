import Button from "@/components/states/Button";
import { ItemRequest } from "@/models/ItemRequest";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Loading from "@/components/states/Loading";
import Image from 'next/image';
import { RefObject, useState } from "react";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { updateRequest } from "@/services/store";
import DoNotTouchOutlinedIcon from '@mui/icons-material/DoNotTouchOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

interface BorrowCardProps {
    active: boolean;
    openModal?: (groupItem: ItemRequest) => void;
    items: ItemRequest[];
    calculateReturnDate?: (returnDate?: Date | string) => JSX.Element | null; // Now returns JSX.Element or null
    calculateHistoryDate?: (expectedReturnDate?: Date | string, actualReturnDate?: Date | string) => JSX.Element | null; // Now returns JSX.Element or null
    itemLoading: boolean;
    userId: string | null;
    listRef: RefObject<HTMLDivElement>;
    hasMore: boolean;
    innerRef: React.Ref<HTMLDivElement>;
    openMessageModal?: (value: boolean) => void;
    setMessage?: (value: string) => void;
}

export default function ItemCard({ active, openModal, items, calculateReturnDate, calculateHistoryDate, itemLoading, userId, listRef, hasMore, innerRef, openMessageModal, setMessage }: BorrowCardProps) {
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll w-full";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const [requests, setRequest] = useRecoilState(updateRequest);

    if (itemLoading) { return (<Loading />); }

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
    };

    const handleSuccess = () => {
        enqueueSnackbar('Item succesfully returned', { variant: 'success' })
        setRequest(!requests);
    };

    async function returnItem(item: ItemRequest){
        if (!item) { console.error("error"); return; }
        const data = {
            requestId: item.id,
            itemId: item.item.id,
            userId,
        };

        const response = await fetch(`/api/user/returns/`, {
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

    const checkAvailability = (request: ItemRequest) => {
        switch(request.item.itemStatusId) {
            case 1:
            case 2:
            case 3:
            case 4:
                switch(request.requestStatusId) {
                    case 1:
                        return (
                            <div className="flex truncate items-center text-custom-primary gap-1">
                                <AccessTimeIcon fontSize="small"/>
                                <span>Pending</span>
                            </div>
                        );
                    case 2:
                        return (
                            <div className="flex truncate items-center text-custom-green gap-1">
                                <CheckCircleOutlineOutlinedIcon fontSize="small"/>
                                <span>Accepted</span>
                            </div>
                        );
                    case 3:
                        return (
                            <div className="flex truncate items-center text-custom-red gap-1">
                                <CancelOutlinedIcon fontSize="small"/>
                                <span>Rejected</span>
                            </div>
                        );
                    case 4:
                        return (
                            <div className="flex truncate items-center text-custom-green gap-1">
                                <CheckCircleOutlineOutlinedIcon fontSize="small"/>
                                <span>Received</span>
                            </div>
                        );
                    case 5:
                        return (
                            <div className="flex truncate items-center text-custom-primary gap-1">
                                <AccessTimeIcon fontSize="small"/>
                                <span>Pending return</span>
                            </div>
                        );
                    case 6:
                    case 7:
                        return (
                            <div className="flex truncate items-center text-custom-green gap-1">
                                <CheckCircleOutlineOutlinedIcon fontSize="small"/>
                                <span>Finished</span>
                            </div>
                        );
                    case 8:
                        return (
                            <div className="flex truncate items-center text-custom-red gap-1">
                                <CancelOutlinedIcon fontSize="small"/>
                                <span>Cancelled</span>
                            </div>
                        );
                }   
            case 5:
                return (
                    <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                        <AccessTimeIcon fontSize="small"/>
                        <span>In repair</span>
                    </div>
                );
            case 6:
                return (
                    <div className="flex truncate items-center text-custom-red gap-1 text-sm sm:text-base">
                        <DoNotTouchOutlinedIcon fontSize="small"/>
                        <span>Broken</span>
                    </div>
                );
        }
    };

    const openMessage = (message: string) => {
        if (openMessageModal && setMessage) {
            openMessageModal(true);
            setMessage(message);
        }
    };

    return (
        <>
            <div ref={listRef} className={active ? listViewClass : gridViewClass} style={{maxHeight: "60vh"}}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                                <div className="flex flex-row items-center w-5/6">
                                <div className="mr-2 flex w-[100px] h-[72px] justify-center items-center max-h-[72px] overflow-hidden">
                                        <Image 
                                            src={!item.item.image ? "/assets/images/defaultImage.jpg" : item.item.image}
                                            alt={item.item.name}
                                            style={{ width: 'auto', height: '72px'}}
                                            width={72}
                                            height={100}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        <div className="truncate">
                                        {(item.requestStatusId === 4 && item.item.itemStatusId === 3) && (
                                                <>
                                                    {calculateReturnDate && (calculateReturnDate(item.endBorrowDate))}
                                                    {calculateHistoryDate && calculateHistoryDate(item.endBorrowDate, item.returnDate)}
                                                </>
                                            )}
                                            {(item.requestStatusId === 5 && item.item.itemStatusId === 4) && (
                                                <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                                                    <AccessTimeIcon fontSize="small"/>
                                                    <span>Pending return</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Name:&nbsp;</span>
                                            <span>{item.item.name}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Model:&nbsp;</span>
                                            <span>{item.item.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        <div className="flex gap-8 items-center">
                                            <div className="truncate">
                                                <span className="font-semibold">Brand:&nbsp;</span>
                                                <span>{item.item.brand}</span>
                                            </div>
                                            
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{item.item.location.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-1/3 ml-4">
                                        <div className="flex gap-8 items-center">
                                            <div className="truncate">
                                                {calculateReturnDate ? (
                                                    <div>
                                                        <span className="font-semibold">Borrow date:&nbsp;</span>
                                                        <span>{formatDate(item.borrowDate)}</span>
                                                    </div>
                                                ): (
                                                    <div>
                                                        <span className="font-semibold">Borrowed:&nbsp;</span>
                                                        <span>{formatDate(item.borrowDate)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                        </div>
                                        <div className="truncate">
                                            {calculateReturnDate ? (
                                                <div>
                                                    <span className="font-semibold">Return date:&nbsp;</span>
                                                    <span>{formatDate(item.endBorrowDate)}</span>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className="font-semibold">Borrowed:&nbsp;</span>
                                                    <span>{formatDate(item.borrowDate)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/12">
                                {(item.requestStatusId === 4 && item.item.itemStatusId === 3) && (
                                    calculateReturnDate ? (
                                        <Button 
                                            text="Return" 
                                            textColor="white" 
                                            borderColor="custom-primary" 
                                            fillColor="custom-primary"
                                            buttonClassName="hover:bg-custom-primary-hover"
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => returnItem(item)}
                                        />
                                    ) : (
                                        null
                                    )
                                )}
                                {((item.approveMessage) || (item.requestStatusId === 2 && item.approveMessage)) && (
                                        <Button 
                                            text="Message"
                                            paddingY="py-0"
                                            paddingX="px-2"
                                            onClick={() => openMessage(item.approveMessage)}
                                        />
                                    )}
                                {calculateReturnDate ? (
                                    <div></div>
                                ) : (
                                    checkAvailability(item)
                                )}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden w-full">
                                <div className="p-2 flex items-center flex-wrap">
                                    <div className="flex w-1/2 flex-wrap">
                                        <span className="font-semibold flex-wrap text-sm sm:text-lg">{item.item.name}</span>
                                    </div>
                                    <div className="flex w-1/2 flex-col items-end">
                                        <div className="flex items-center text-custom-primary gap-1 text-sm sm:text-base">
                                        {(item.requestStatusId === 4 && item.item.itemStatusId === 3) && (
                                                <>
                                                    {calculateReturnDate && (calculateReturnDate(item.endBorrowDate))}
                                                    {calculateHistoryDate && calculateHistoryDate(item.endBorrowDate, item.returnDate)}
                                                </>
                                            )}
                                            {(item.requestStatusId === 5 && item.item.itemStatusId === 4) && (
                                                <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                                                    <AccessTimeIcon fontSize="small"/>
                                                    <span>Pending return</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>{formatDate(item.borrowDate)} - {formatDate(item.endBorrowDate)}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex items-center p-4 max-w-xs w-full">
                                    <div className="mr-2 flex w-[100px] h-[72px] justify-center items-center max-h-[72px] overflow-hidden">
                                        <Image 
                                            src={!item.item.image ? "/assets/images/defaultImage.jpg" : item.item.image}
                                            alt={item.item.name}
                                            style={{ width: 'auto', height: '72px'}}
                                            width={72}
                                            height={100}
                                            loading="lazy"
                                        />
                                        </div>
                                    <div className="flex flex-col items-start w-2/3">
                                        <div className="flex items-center gap-6 max-w-full">
                                            <div className="flex flex-col items-start max-w-2/3 text-sm sm:text-base">
                                                <span className="text-gray-400">Model</span>
                                                <span className="truncate">{item.item.model}</span>
                                            </div>
                                            <div className="flex flex-col items-start max-w-1/3 text-sm sm:text-base">
                                                <span className="text-gray-400">Brand</span>
                                                <span className="truncate">{item.item.brand}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start w-full text-sm sm:text-base">
                                            <span className="text-gray-400">Location</span>
                                            <span className="truncate">{item.item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-center items-center p-2">
                                {(item.requestStatusId === 4 && item.item.itemStatusId === 3) && (
                                    calculateReturnDate ? (
                                        <Button 
                                            text="Return" 
                                            textColor="white" 
                                            borderColor="custom-primary" 
                                            fillColor="custom-primary"
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => returnItem(item)}
                                        />
                                    ) : (
                                        null
                                    )
                                )}
                                {((item.approveMessage) || (item.requestStatusId === 2 && item.approveMessage)) && (
                                        <Button 
                                            text="Message"
                                            paddingY="py-0"
                                            paddingX="px-2"
                                            onClick={() => openMessage(item.approveMessage)}
                                        />
                                    )}
                                {calculateReturnDate ? (
                                    <div></div>
                                ) : (
                                    checkAvailability(item)
                                )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {hasMore && <div ref={innerRef}>Loading more items...</div>}
        </div>
        </>
    );
}