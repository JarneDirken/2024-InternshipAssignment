import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Loading from "@/components/states/Loading";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import Image from 'next/image';
import { Repair } from "@/models/Repair";
import Button from '@/components/states/Button';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DoNotTouchOutlinedIcon from '@mui/icons-material/DoNotTouchOutlined';

interface BorrowCardProps {
    active: boolean;
    openModal: (item: Repair) => void;
    items: Repair[];
    itemLoading: boolean;
    selectedTab?: string;
};

export default function ItemCard({ active, openModal, items, itemLoading, selectedTab }: BorrowCardProps) {
    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll";
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

    return (
        <>
            <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                                <div className="flex flex-row items-center w-full">
                                    <div className="mr-2 w-[100px] h-[72px] justify-center items-center max-h-[72px] overflow-hidden">
                                        {!item.item.image ? (
                                                <Image 
                                                    src="/assets/images/defaultImage.jpg"
                                                    style={{ width: 'auto', height: 'auto'}}
                                                    width={72}
                                                    height={100}
                                                    alt="Default iamge"
                                                    loading="lazy"
                                            />
                                            ) : (
                                                <Image 
                                                    src={item.item.image}
                                                    alt={item.item.name}
                                                    style={{ width: 'auto', height: 'auto' }} 
                                                    width={100}
                                                    height={72}
                                                    loading="lazy"
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
                                            {item.returnDate ? (
                                                <span>{formatDate(item.repairDate)} - {formatDate(item.returnDate)}</span>
                                            ) : (
                                                <span>{formatDate(item.repairDate)} - /</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-1/4">
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
                                        <div className="truncate">
                                            <span className="font-semibold">Year:&nbsp;</span>
                                            <span>{formatDateYear(item.item.yearBought)}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Brand:&nbsp;</span>
                                            <span>{item.item.brand}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        <div className="truncate">
                                            <span className="font-semibold">Requestor:&nbsp;</span>
                                            <span className="capitalize">
                                                {item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.firstName ?? 'Default First Name'}{' '}
                                                {item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.lastName ?? 'Default Last Name'}
                                            </span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{item.item.location.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-1/5 justify-end items-end">
                                        <div>
                                            <Button 
                                                text='Details'
                                                paddingX='px-2'
                                                paddingY='py-1'
                                                textColor='custom-primary'
                                                borderColor='custom-primary'
                                                onClick={() => openModal(item)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="p-2 flex items-center flex-wrap">
                                    <div className="flex w-1/2 flex-col items-start truncate">
                                        <div className="flex items-center flex-wrap truncate">
                                            <HandymanOutlinedIcon fontSize="medium"/>
                                            <span className="font-semibold flex-wrap text-sm sm:text-lg">{item.item.name}</span>
                                        </div>
                                        <div className="flex items-center flex-wrap truncate">
                                            <PersonOutlineOutlinedIcon fontSize="medium"/>
                                            <span className="capitalize font-semibold flex-wrap text-sm sm:text-lg">
                                                {item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.firstName ?? 'Default First Name'}{' '}
                                                {item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.lastName ?? 'Default Last Name'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex w-1/2 flex-col items-end truncate">
                                        <div className="flex justify-center items-center">
                                            <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                                                <AccessTimeIcon fontSize="small"/>
                                                <span>Pending</span>
                                            </div>
                                        </div>
                                        <div className="flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm">
                                            <AccessTimeIcon fontSize="small"/>
                                            <span>{formatDate(item.repairDate)} - /</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex flex-col p-4 w-full">
                                    <div className="flex">
                                        <div className="mr-2 w-[100px] h-[72px] justify-center items-center max-h-[72px] overflow-hidden">
                                        {!item.item.image ? (
                                                <Image 
                                                    src="/assets/images/defaultImage.jpg"
                                                    style={{ width: '100%', height: 'auto' }}
                                                    width={72}
                                                    height={100}
                                                    alt="Default iamge"
                                                    loading="lazy"
                                            />
                                            ) : (
                                                <Image 
                                                    src={item.item.image}
                                                    alt={item.item.name}
                                                    style={{ width: '100%', height: 'auto' }}
                                                    width={100}
                                                    height={72}
                                                    loading="lazy"
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
                                        <div className="flex flex-col items-start w-1/3 text-sm sm:text-base pl-2 truncate">
                                            <span className="text-gray-400">Year</span>
                                            <span>{formatDateYear(item.item.yearBought)}</span>
                                        </div>
                                        <div className="flex flex-col items-start w-2/3 text-sm sm:text-base pl-2 truncate">
                                            <span className="text-gray-400">Location</span>
                                            <span className="truncate">{item.item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex flex-col w-full justify-center items-center p-1">
                                    <div>
                                        <Button 
                                            text='Details'
                                            paddingX='px-2'
                                            paddingY='py-1'
                                            textColor='custom-primary'
                                            borderColor='custom-primary'
                                            onClick={() => openModal(item)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
        </div>
        </>
    );
}