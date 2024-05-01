import { ItemRequest } from "@/models/ItemRequest";
import Image from "next/image";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoNotTouchOutlinedIcon from '@mui/icons-material/DoNotTouchOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useRouter } from 'next/navigation';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

interface BorrowCardProps {
    active: boolean;
    item: ItemRequest;
};

export default function UserItemView({ active, item}: BorrowCardProps) {
    const router = useRouter();

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

    const checkRequestStatusId = (statusId: number) => {
        switch(statusId) {
            case 1:
                return (
                    <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                        <AccessTimeIcon fontSize="small"/>
                        <span>Pending approval</span>
                    </div>
                );
            case 2:
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
            case 4:
                return (
                    <div className="flex truncate items-center text-custom-green gap-1 text-sm sm:text-base">
                        <CheckCircleOutlineOutlinedIcon fontSize="small"/>
                        <span>Handed over</span>
                    </div>
                );
            case 5:
                return (
                    <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                        <AccessTimeIcon fontSize="small"/>
                        <span>Pending return</span>
                    </div>
                );
            case 6:
                return (
                    <div className="flex truncate items-center text-custom-green gap-1 text-sm sm:text-base">
                        <CheckCircleOutlineOutlinedIcon fontSize="small"/>
                        <span>Returned</span>
                    </div>
                );
            case 7:
                return (
                    <div className="flex truncate items-center text-custom-green gap-1 text-sm sm:text-base">
                        <CheckCircleOutlineOutlinedIcon fontSize="small"/>
                        <span>Checked</span>
                    </div>
                );
            default:
                return <div>Unknown status</div>;
        }
    };

    const checkItemStatusId = (statusId: number) => {
        switch(statusId) {
            case 5:
                return (
                    <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                        <AccessTimeIcon fontSize="small"/>
                        <span>Pending return</span>
                    </div>
                );
            case 6: 
                return (
                    <div className="flex truncate items-center text-custom-red gap-1 text-sm sm:text-base">
                            <DoNotTouchOutlinedIcon fontSize="small"/>
                            <span>Broken</span>
                        </div>
                )
            default:
                return <div>Unknown status</div>
        }
    };

    const calculateOnTime = (expectedReturnDate?: Date | string, actualReturnDate?: Date | string) => {
        if (!expectedReturnDate || !actualReturnDate) {
            return <span>Return date not set</span>;
        }
    
        // Convert strings to Date objects if necessary
        const expectedDate = expectedReturnDate instanceof Date ? expectedReturnDate : new Date(expectedReturnDate);
        const actualDate = actualReturnDate instanceof Date ? actualReturnDate : new Date(actualReturnDate);
    
        // Reset time components to compare only dates
        const expected = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate()).getTime();
        const actual = new Date(actualDate.getFullYear(), actualDate.getMonth(), actualDate.getDate()).getTime();
    
        // Calculate the difference in days
        const msPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds per day
        const timeDiff = actual - expected;
        const daysDiff = Math.round(timeDiff / msPerDay);
    
        // Determine if the return was on time or late
        const onTime = timeDiff <= 0;
        const dayLabel = Math.abs(daysDiff) === 1 ? "day" : "days";
    
        return (
            <div className={`flex items-center gap-1 ${onTime ? 'text-custom-green' : 'text-custom-red'}`}>
                <AccessTimeIcon fontSize="small" />
                {!onTime ? (
                    <span>{Math.abs(daysDiff)} {dayLabel} late</span>
                ) : (
                    <span>On Time</span>
                )}
            </div>
        );
    };

    const viewItemHistory = (itemId: number) => {
        const type="item"
        router.push(`/historypage/${type}/${itemId}`);
    };

    return (
        <div>
            {active ?  
                <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                    <div className="flex flex-row items-center w-full">
                        <div className="mr-2 w-[100px] h-[72px] flex justify-center items-center max-h-[72px] overflow-hidden">
                            <Image 
                                src={!item.item.image ? "/assets/images/defaultImage.jpg" : item.item.image}
                                alt={item.item.name}
                                style={{ width: 'auto', height: '60px'}}
                                width={60}
                                height={60}
                                loading="lazy"
                            />
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
                                    {item.borrowDate ? (
                                        <span>{formatDate(item.borrowDate)} - {item.returnDate ? (formatDate(item.returnDate)) : (<span>/</span>)} </span>
                                    ) : (
                                        <span>{formatDate(item.startBorrowDate)} - {formatDate(item.endBorrowDate)}</span>
                                    )}
                                </div>
                        </div>
                        <div className="flex flex-col w-1/3">
                            {(item.item.itemStatusId === 5 || item.item.itemStatusId === 6) ? (
                                checkItemStatusId(item.item.itemStatusId)
                            ) : (
                                checkRequestStatusId(item.requestStatusId)
                            )}
                            <div className="flex truncate items-center gap-1">
                                <span className="font-semibold">{item.requestStatusId===3 ? <span>Reject</span> : <span>Approve</span>}&nbsp;date:</span>
                                <span>{formatDate(item.decisionDate)}</span>
                            </div>
                            <div className="truncate">
                                <span className="font-semibold">Brand:&nbsp;</span>
                                <span>{item.item.brand}</span>
                            </div>
                        </div>
                        <div className="flex flex-col w-1/3">
                            <div className="truncate">
                                {calculateOnTime(item.endBorrowDate, item.returnDate)}
                            </div>
                            <div className="truncate">
                                {item.requestStatusId!==1 ? (
                                    <>
                                        <span className="font-semibold">{item.requestStatusId===3 ? (<span>Rejected&nbsp;</span>) : (<span>Approved&nbsp;</span>)}by:&nbsp;</span>
                                        <span className='capitalize'>{item.approver?.firstName} {item.approver?.lastName}</span>
                                    </>
                                ) : (
                                    <span className="font-semibold">Not yet approved</span>
                                )}
                            </div>
                            <div className="truncate">
                                <span className="font-semibold">Location:&nbsp;</span>
                                <span>{item.item.location.name}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/12 flex flex-col gap-1 justify-end items-end">
                        <div className='cursor-pointer text-custom-primary' onClick={() => viewItemHistory(item.item.id)}>
                            <RestoreOutlinedIcon fontSize='large'/>
                        </div>
                    </div>
                </div>
                : 
                <div className="overflow-hidden">
                    <div className="p-2 flex items-center flex-wrap">
                        <div className='flex items-center truncate w-full justify-between flex-row'>
                            <div className="flex w-1/2 items-center flex-wrap truncate">
                                <div className='flex'>
                                    <PersonOutlineOutlinedIcon fontSize="medium"/>
                                    <span className="font-semibold flex-wrap text-sm sm:text-lg capitalize">{item.item.name}</span>
                                </div>
                                <div>
                                    {calculateOnTime(item.endBorrowDate, item.returnDate)}
                                </div>
                            </div>
                            <div className="flex w-1/2 flex-col items-end truncate">
                                <div className="flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm">
                                    <AccessTimeIcon fontSize="small"/>
                                    {item.borrowDate ? (
                                        <span>{formatDate(item.borrowDate)} - {item.returnDate ? (formatDate(item.returnDate)) : (<span>/</span>)} </span>
                                    ) : (
                                        <span>{formatDate(item.startBorrowDate)} - {formatDate(item.endBorrowDate)}</span>
                                    )}
                                </div>
                                <div className="flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm">
                                    {(item.item.itemStatusId === 5 || item.item.itemStatusId === 6) ? (
                                        checkItemStatusId(item.item.itemStatusId)
                                    ) : (
                                        checkRequestStatusId(item.requestStatusId)
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="flex flex-col p-4 w-full">
                        <div className="flex">
                            <div className="mr-2 w-[100px] h-[72px] justify-center items-center max-h-[72px] overflow-hidden">
                                <Image 
                                    src={!item.item.image ? "/assets/images/defaultImage.jpg" : item.item.image}
                                    alt={item.item.name}
                                    style={{ width: 'auto', height: '60px'}}
                                    width={60}
                                    height={60}
                                    loading="lazy"
                                />
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
                            <div className='flex flex-col items-start text-sm sm:text-base pl-2 truncate w=full'>
                                <span className="text-gray-400">Location</span>
                                <span className="truncate">{item.item.location.name}</span>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="flex justify-center items-center p-2">
                        <div className='cursor-pointer text-custom-primary' onClick={() => viewItemHistory(item.item.id)}>
                            <RestoreOutlinedIcon fontSize='large'/>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}