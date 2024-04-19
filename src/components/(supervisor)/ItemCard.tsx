import Button from "@/components/states/Button";
import { ItemRequest } from "@/models/ItemRequest";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Loading from "@/components/states/Loading";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Image from 'next/image';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';

interface BorrowCardProps {
    active: boolean;
    openModal: (itemRequest: ItemRequest) => void;
    items: ItemRequest[];
    itemLoading: boolean;
    setRejected?: (value: boolean) => void;
    setApproved?: (value: boolean) => void;
    setRequestStatusId?: (value: number) => void;
    openMessageModal?: (value: boolean) => void;
    setMessage?: (value: string) => void;
};

export default function ItemCard({ active, openModal, items, itemLoading, setApproved, setRejected, setRequestStatusId, openMessageModal, setMessage }: BorrowCardProps) {
    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll w-full overflow-x-hidden";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";

    if (itemLoading) { return (<Loading />); };

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
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

    const formatDateYear = (date?: Date | string) => {
        if (!date) {
            return <div>No date found</div>;
        }
    
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
    
        return (
                <span>{year}</span>
        );
    };

    const rejected = (item: ItemRequest) => {
        setRejected!(true);
        openModal(item);
        setRequestStatusId!(3); // 3 === rejected
    };

    const approved = (item: ItemRequest) => {
        setApproved!(true);
        openModal(item);
        setRequestStatusId!(2); // 2 === accepted
    };

    const checkRequestStatusId = (statusId: number) => {
        switch(statusId) {
            case 1:
                return (
                    <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                        <AccessTimeIcon fontSize="small"/>
                        <span>Pending</span>
                    </div>
                );
            case 2:
            case 4:
            case 5:
            case 6:
            case 7:
                return (
                    <div className="flex truncate items-center text-custom-green gap-1 text-sm sm:text-base">
                        <CheckCircleOutlineOutlinedIcon fontSize="small"/>
                        <span>Accepted</span>
                    </div>
                );
            case 3:
                return (
                    <div className="flex truncate items-center text-custom-red gap-1 text-sm sm:text-base">
                        <CancelOutlinedIcon fontSize="small"/>
                        <span>Rejected</span>
                    </div>
                );
            default:
                return <div>Unknown status</div>;
        }
    };

    const openMessage = (message: string) => {
        openMessageModal!(true);
        setMessage!(message);
    };

    return (
        <>
            <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                                <div className="flex flex-row items-end w-5/6">
                                    <div className="w-1/12 mr-2">
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
                                                style={{ width: '100px', height: '72px', objectFit: 'cover' }} 
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        <div className="truncate">
                                            <span className="font-semibold">Name:&nbsp;</span>
                                            <span>{item.item.name}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Model:&nbsp;</span>
                                            <span>{item.item.model}</span>
                                        </div>
                                        <div className="flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>{formatDate(item.startBorrowDate)} - {formatDate(item.endBorrowDate)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        {checkRequestStatusId(item.requestStatusId)}
                                        {item.decisionDate ? (
                                            <div className="flex truncate items-center gap-1">
                                                <span className="font-semibold">{item.requestStatusId===3 ? <span>Reject</span> : <span>Approve</span>}&nbsp;date:</span>
                                                <span>{formatDate(item.decisionDate)}</span>
                                            </div>
                                        ) : (
                                            <div className="truncate">
                                                <span className="font-semibold">Year:&nbsp;</span>
                                                <span>{formatDateYear(item.item.yearBought)}</span>
                                            </div>
                                        )}
                                        <div className="truncate">
                                            <span className="font-semibold">Brand:&nbsp;</span>
                                            <span>{item.item.brand}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        {item.approver && (
                                            <div className="truncate">
                                                <span className="font-semibold">Approver:&nbsp;</span>
                                                <span className="capitalize">{item.approver.firstName} {item.approver.lastName}</span>
                                            </div>
                                        )}
                                        <div className="truncate">
                                            <span className="font-semibold">Requestor:&nbsp;</span>
                                            <span className="capitalize">{item.borrower.firstName} {item.borrower.lastName}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{item.item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                {!item.approver && (
                                    <div className="w-1/12 flex flex-col gap-1">
                                        <Button 
                                            text="Reject" 
                                            textColor="custom-red" 
                                            borderColor="custom-red"
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => rejected(item)}
                                        />
                                        <Button 
                                            text="Approve" 
                                            textColor="custom-green" 
                                            borderColor="custom-green" 
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => approved(item)}
                                        />
                                        <Button 
                                            text="View" 
                                            textColor="white" 
                                            borderColor="custom-primary" 
                                            fillColor="custom-primary"
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => openModal(item)}
                                        />
                                    </div>
                                )}
                                {item.requestStatusId === 3 && (
                                    <Button 
                                        text="Message"
                                        paddingY="py-0"
                                        paddingX="px-2"
                                        onClick={() => openMessage(item.approveMessage)}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="overflow-hidden w-full">
                                <div className="p-2 flex items-center flex-wrap">
                                    <div className="flex w-1/2 flex-col items-start truncate">
                                        <div className="flex items-center flex-wrap truncate">
                                            <PersonOutlineOutlinedIcon fontSize="medium"/>
                                            <span className="font-semibold flex-wrap text-sm sm:text-lg capitalize">{item.borrower.firstName} {item.borrower.lastName}</span>
                                        </div>
                                        {item.approver && (
                                            <div className="flex items-center flex-wrap truncate">
                                                <HandshakeOutlinedIcon fontSize="medium"/>
                                                <span className="font-semibold flex-wrap text-sm sm:text-lg capitalize">{item.approver.firstName} {item.approver.lastName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex w-1/2 flex-col items-end truncate">
                                        {checkRequestStatusId(item.requestStatusId)}
                                        <div className="flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>{formatDate(item.startBorrowDate)} - {formatDate(item.endBorrowDate)}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex flex-col items-center p-4 max-w-xs w-full">
                                    <div className="flex">
                                        <div className="w-1/3 flex justify-center mr-2">
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
                                                    style={{ width: '100px', height: '72px', objectFit: 'cover' }} 
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-col items-start w-2/3">
                                            <div className="flex flex-col items-start w-full text-sm sm:text-base truncate">
                                                <span className="text-gray-400">Name</span>
                                                <span className="truncate">{item.item.name}</span>
                                            </div>
                                            <div className="flex flex-col items-start w-full text-sm sm:text-base truncate">
                                                <span className="text-gray-400">Model</span>
                                                <span className="truncate">{item.item.model}</span>
                                            </div>
                                            <div className="flex flex-col items-start w-full text-sm sm:text-base truncate">
                                                <span className="text-gray-400">Brand</span>
                                                <span className="truncate">{item.item.brand}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-0 w-full">
                                    {item.decisionDate ? (
                                            <div className="flex flex-col items-start w-2/3 text-sm sm:text-base pl-2 truncate">
                                                <span className="text-gray-400">{item.requestStatusId===3 ? <span>Reject</span> : <span>Approve</span>}&nbsp;date</span>
                                                <span>{formatDate(item.decisionDate)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-start w-2/3 text-sm sm:text-base pl-2 truncate">
                                                <span className="text-gray-400">Year</span>
                                                <span>{formatDateYear(item.item.yearBought)}</span>
                                            </div>
                                        )}
                                        <div className="flex flex-col items-start w-2/3 text-sm sm:text-base pl-2 truncate">
                                            <span className="text-gray-400">Location</span>
                                            <span className="truncate">{item.item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                {!item.approver || item.requestStatusId === 3 && (
                                    <hr />
                                )}
                                <div className="flex justify-center items-center p-2 gap-6">
                                {!item.approver && (
                                    <>
                                        <Button 
                                            text="Reject" 
                                            textColor="custom-red" 
                                            borderColor="custom-red"
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => rejected(item)}
                                        />
                                        <Button 
                                            text="Approve" 
                                            textColor="custom-green" 
                                            borderColor="custom-green" 
                                            paddingY="py-0"
                                            font="semibold"
                                            onClick={() => approved(item)}
                                        />
                                    </>
                                )}
                                {item.requestStatusId === 3 && (
                                    <Button 
                                        text="Message"
                                        paddingY="py-0"
                                        paddingX="px-2"
                                        onClick={() => openMessage(item.approveMessage)}
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