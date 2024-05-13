import { ItemRequest } from "@/models/ItemRequest";
import Image from "next/image";
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DoNotTouchOutlinedIcon from '@mui/icons-material/DoNotTouchOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Repair } from "@/models/Repair";
import { Item } from "@/models/Item";

interface BorrowCardProps {
    active: boolean;
    reparations: Repair[];
    item: Item;
};

export default function Reparation({ active, reparations, item}: BorrowCardProps) {
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
            {reparations && reparations.length > 0 && (
                <div>
                    {reparations.map((reparation) => (
                        <div key={reparation.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div key={reparation.id} className="flex flex-row py-2 px-8 items-center justify-between w-full border-b border-gray-300">
                                <div className="flex flex-row items-center w-full">
                                    <div className="mr-2 w-[100px] h-[72px] flex justify-center items-center max-h-[72px] overflow-hidden">
                                        <Image 
                                            src={!item.image ? "/assets/images/defaultImage.jpg" : item.image}
                                            alt={item.name}
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
                        ) : (
                            <div className="overflow-hidden">
                                <div className="p-2 flex items-center flex-wrap">
                                    <div className='flex items-center truncate w-full justify-between flex-row'>
                                        <div className="flex w-1/2 items-center flex-wrap truncate">
                                            <div className='flex'>
                                                <DoNotTouchOutlinedIcon fontSize="medium"/>
                                                <span className="font-semibold flex-wrap text-sm sm:text-lg capitalize">Reparation</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-1/2 truncate items-end text-gray-400 gap-1 text-xs sm:text-sm">
                                            <div className='flex gap-1 items-center'>
                                                <AccessTimeIcon fontSize="small"/>
                                                {reparation.returnDate ? (
                                                    <span>{formatDate(reparation.repairDate)} - {formatDate(reparation.returnDate)} </span>
                                                ) : (
                                                    <span>{formatDate(reparation.repairDate)}</span>
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
                                                src={!item.image ? "/assets/images/defaultImage.jpg" : item.image}
                                                alt={item.name}
                                                style={{ width: 'auto', height: '60px'}}
                                                width={60}
                                                height={60}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="flex flex-col items-start w-2/3">
                                            <div className="flex w-full">
                                                <span className="font-semibold">Notes:&nbsp;</span>
                                                {reparation.notes ? (reparation.notes) : (<span>No notes</span>)}
                                            </div>
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
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                    ))}
                   
                </div>
            )}
        </div>
    );
}