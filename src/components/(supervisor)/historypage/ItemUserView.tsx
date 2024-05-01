import { ItemRequest } from "@/models/ItemRequest";
import { useRouter } from 'next/navigation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Avatar from "@mui/material/Avatar";
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Image from "next/image";
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DoNotTouchOutlinedIcon from '@mui/icons-material/DoNotTouchOutlined';

interface BorrowCardProps {
    active: boolean;
    item: ItemRequest;
};

export default function ItemUserView({ active, item}: BorrowCardProps) {
    const router = useRouter();

    const viewUserHistory = (userId: number) => {
        const type="user"
        router.push(`/historypage/${type}/${userId}`);
    };

    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
        <div>
            {active ? 
                <div>
                    <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                        <div className="flex flex-row items-center w-full">
                            <div className="mr-2 w-[100px] h-[72px] flex justify-center items-center max-h-[72px] overflow-hidden">
                            <Avatar sx={{ width: 40, height: 40 }}>
                                {item.borrower.profilePic ? (
                                    <img src={item.borrower.profilePic} alt={`${item.borrower.firstName} ${item.borrower.lastName}`} />
                                    ) : (
                                    <span>
                                        {capitalizeFirstLetter(item.borrower.firstName[0])}{capitalizeFirstLetter(item.borrower.lastName[0])}
                                    </span>
                                )}
                            </Avatar>
                            </div>
                            <div className="flex flex-col w-1/3">
                                <div className="truncate">
                                    <span className="font-semibold">Name:&nbsp;</span>
                                    <span className='capitalize'>{item.borrower.firstName} {item.borrower.lastName}</span>
                                </div>
                                <div className="truncate">
                                    <span className="font-semibold">Student code:&nbsp;</span>
                                    <span>{item.borrower.studentCode}</span>
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
                                <div className="truncate">
                                    <span className="font-semibold">Telephone:&nbsp;</span>
                                    <span>{item.borrower.tel}</span>
                                </div>
                                <div className="truncate">
                                    <span className="font-semibold">E-mail:&nbsp;</span>
                                    <span>{item.borrower.email}</span>
                                </div>
                            </div>
                            <div className="flex flex-col w-1/3">
                                {calculateOnTime(item.endBorrowDate, item.returnDate)}
                            </div>
                        </div>
                        <div className="w-1/12 flex flex-col gap-1 justify-end items-end">
                            <div className='cursor-pointer text-custom-primary' onClick={() => viewUserHistory(item.borrower.id)}>
                                <RestoreOutlinedIcon fontSize='large'/>
                            </div>
                        </div>
                    </div>
                    {item.item.Reparations && item.item.Reparations.length > 0 && (
                        <div>
                            {item.item.Reparations.map((reparation) => (
                                <div key={reparation.id} className="flex flex-row py-2 px-8 items-center justify-between w-full">
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
                                            <div className="font-semibold text-lg">
                                                <span>Reparation</span>
                                            </div>
                                            <div className='flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm'>
                                                <AccessTimeIcon fontSize="small"/>
                                                {reparation.returnDate ? (
                                                    <span>{formatDate(reparation.repairDate)} - {formatDate(reparation.returnDate)} </span>
                                                ) : (
                                                    <span>{formatDate(reparation.repairDate)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex w-1/3">
                                            <span className="font-semibold">Notes:&nbsp;</span>
                                            {reparation.notes ? (reparation.notes) : (<span>No notes</span>)}
                                        </div>
                                        <div className="flex flex-col w-1/3">
                                        {reparation.item.itemStatusId === 6 ? (
                                            <div className="flex truncate text-custom-red gap-1 text-sm sm:text-base">
                                                <DoNotTouchOutlinedIcon fontSize="small"/>
                                                <span>Broken</span>
                                            </div>
                                        ) : (
                                            reparation.returnDate ?
                                                <div className="flex gap-1 text-custom-green text-sm sm:text-base">
                                                    <CheckCircleOutlineOutlinedIcon />
                                                    <span>Repaired</span>
                                                </div> 
                                            : 
                                                <div className="flex gap-1 text-custom-primary text-sm sm:text-base">
                                                    <HourglassEmptyOutlinedIcon />
                                                    <span>In repair</span>
                                                </div>
                                        )}
                                        </div>
                                        <div className="w-1/12 flex flex-col gap-1 justify-end items-end"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                : 
                <div className="overflow-hidden">
                    <div className="p-2 flex items-center flex-wrap">
                        <div className='flex items-center truncate w-full justify-between flex-row'>
                            <div className="flex w-1/2 items-center flex-wrap truncate">
                                <div className='flex'>
                                    <PersonOutlineOutlinedIcon fontSize="medium"/>
                                    <span className="font-semibold flex-wrap text-sm sm:text-lg capitalize">{item.borrower.firstName} {item.borrower.lastName}</span>
                                </div>
                            </div>
                            <div className="flex flex-col w-1/2 truncate items-end text-gray-400 gap-1 text-xs sm:text-sm">
                                <div>
                                    {calculateOnTime(item.endBorrowDate, item.returnDate)}
                                </div>
                                <div className='flex gap-1 items-center'>
                                    <AccessTimeIcon fontSize="small"/>
                                    {item.borrowDate ? (
                                        <span>{formatDate(item.borrowDate)} - {item.returnDate ? (formatDate(item.returnDate)) : (<span>/</span>)} </span>
                                    ) : (
                                        <span>{formatDate(item.startBorrowDate)} - {formatDate(item.endBorrowDate)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="flex flex-col p-4 w-full">
                        <div className="flex">
                            <div className="mr-2 w-[100px] h-[72px] justify-center items-center max-h-[72px] overflow-hidden">
                                <Avatar sx={{ width: 40, height: 40 }}>
                                    {item.borrower.profilePic ? (
                                        <img src={item.borrower.profilePic} alt={`${item.borrower.firstName} ${item.borrower.lastName}`} />
                                        ) : (
                                        <span>
                                            {capitalizeFirstLetter(item.borrower.firstName[0])}{capitalizeFirstLetter(item.borrower.lastName[0])}
                                        </span>
                                    )}
                                </Avatar>
                            </div>
                            <div className="flex flex-col items-start w-2/3">
                                <div className="flex flex-col items-start w-full text-sm sm:text-base truncate">
                                    <span className="text-gray-400">Student code</span>
                                    <span className="truncate">{item.borrower.studentCode}</span>
                                </div>
                                <div className="flex flex-col items-start w-full text-sm sm:text-base truncate">
                                    <span className="text-gray-400">Tel</span>
                                    <span className="truncate">{item.borrower.tel}</span>
                                </div>
                                <div className="flex flex-col items-start w-full text-sm sm:text-base truncate">
                                    <span className="text-gray-400">E-mail</span>
                                    <span className="truncate">{item.borrower.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="flex justify-center items-center p-2">
                        <div className='cursor-pointer text-custom-primary' onClick={() => viewUserHistory(item.borrower.id)}>
                            <RestoreOutlinedIcon fontSize='large'/>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}