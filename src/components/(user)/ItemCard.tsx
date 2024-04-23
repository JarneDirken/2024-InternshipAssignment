import Button from "@/components/states/Button";
import { ItemRequest } from "@/models/ItemRequest";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import Image from 'next/image';
import { useState } from "react";

interface BorrowCardProps {
    active: boolean;
    openModal?: (groupItem: ItemRequest) => void;
    items: ItemRequest[];
    calculateReturnDate?: (returnDate?: Date | string) => JSX.Element | null; // Now returns JSX.Element or null
    calculateHistoryDate?: (expectedReturnDate?: Date | string, actualReturnDate?: Date | string) => JSX.Element | null; // Now returns JSX.Element or null
    itemLoading: boolean;
}

export default function ItemCard({ active, openModal, items, calculateReturnDate, calculateHistoryDate, itemLoading }: BorrowCardProps) {
    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll w-full";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";
    const [returnStatus, setReturnStatus] = useState(false);

    if (itemLoading) { return (<Loading />); }

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
    }

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

    return (
        <>
            <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                                <div className="flex flex-row items-end w-5/6">
                                <div className="mr-2 flex w-[100px] h-[72px] justify-center items-center max-h-[72px] overflow-hidden">
                                        {!item.item.image ? (
                                            <Image 
                                                src="/assets/images/defaultImage.jpg"
                                                width={72}
                                                height={100}
                                                alt="Default iamge"
                                                loading="lazy"
                                          />
                                        ) : (
                                                <Image 
                                                    src={item.item.image}
                                                    alt={item.item.name}
                                                    width={100}
                                                    height={72}
                                                    loading="lazy"
                                                />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        <div className="truncate">
                                            {calculateReturnDate && (calculateReturnDate(item.endBorrowDate))}
                                            {calculateHistoryDate && calculateHistoryDate(item.endBorrowDate, item.returnDate)}
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
                                                    <span className="font-semibold">Returned:&nbsp;</span>
                                                    <span>{formatDate(item.returnDate)}</span>
                                                </div>
                                            )}
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
                                </div>
                                <div className="w-1/12">
                                    {calculateReturnDate ? (
                                            <Button 
                                                text="Return" 
                                                textColor="white" 
                                                borderColor="custom-primary" 
                                                fillColor="custom-primary"
                                                paddingY="py-0"
                                                font="semibold"
                                                onClick={() => undefined}
                                            />
                                        ) : (
                                            <Button 
                                                text="View" 
                                                textColor="white" 
                                                borderColor="custom-primary" 
                                                fillColor="custom-primary"
                                                paddingY="py-0"
                                                font="semibold"
                                                onClick={() => openModal!(item)}
                                            />
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
                                            {calculateReturnDate && (calculateReturnDate(item.endBorrowDate))}
                                            {calculateHistoryDate && calculateHistoryDate(item.endBorrowDate, item.returnDate)}
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
                                            {!item.item.image ? (
                                                <Image 
                                                    src="/assets/images/defaultImage.jpg"
                                                    width={72}
                                                    height={100}
                                                    alt="Default iamge"
                                                    loading="lazy"
                                            />
                                            ) : (
                                                    <Image 
                                                        src={item.item.image}
                                                        alt={item.item.name}
                                                        width={100}
                                                        height={72}
                                                        loading="lazy"
                                                    />
                                            )}
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
                                    {calculateReturnDate ? (
                                        <Button 
                                            text="Return" 
                                            textColor="white" 
                                            borderColor="custom-primary" 
                                            fillColor="custom-primary"
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => undefined}
                                        />
                                    ) : (
                                        <Button 
                                            text="View" 
                                            textColor="white" 
                                            borderColor="custom-primary" 
                                            fillColor="custom-primary"
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => openModal!(item)}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
        </div>
        </>
    );
}