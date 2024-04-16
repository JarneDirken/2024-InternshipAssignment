import Button from "@/components/states/Button";
import { ItemRequest } from "@/models/ItemRequest";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface BorrowCardProps {
    active: boolean;
    openModal: (groupItem: ItemRequest) => void;
    userId: string;
    items: ItemRequest[];
}

export default function ReturnCard({ active, openModal, userId, items }: BorrowCardProps) {
    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll w-full";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
    }

    const calculateDaysRemaining = (returnDate?: Date | string) => {
        if (!returnDate) {
            return <span>Return date not set</span>;
        }
    
        // Convert returnDate to a Date object if it's not one.
        const validReturnDate = returnDate instanceof Date ? returnDate : new Date(returnDate);
    
        const currentDate = new Date();
        const returnDateOnly = new Date(validReturnDate.getFullYear(), validReturnDate.getMonth(), validReturnDate.getDate());
        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
        // Use getTime() to get timestamps and calculate the difference in milliseconds
        const msPerDay = 24 * 60 * 60 * 1000; // Number of milliseconds per day
        const daysDiff = Math.round((returnDateOnly.getTime() - currentDateOnly.getTime()) / msPerDay);
    
        let urgent = daysDiff < 2;
        let tooLate = daysDiff < 0;

        const dayLabel = Math.abs(daysDiff) === 1 ? "day" : "days";
    
        return (
            <div className={`flex items-center gap-1 ${urgent ? 'text-custom-red' : 'text-custom-primary'}`}>
                <AccessTimeIcon fontSize="small" />
                {tooLate ? (
                    <span>{Math.abs(daysDiff)} {dayLabel} late</span>
                ) : (
                    <span>{daysDiff} {dayLabel} remaining</span>
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
        <>
            <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                                <div className="flex flex-row items-end w-5/6">
                                    <div className="w-1/12 mr-2">
                                        <img 
                                            src={item.item.image}
                                            alt={item.item.name} 
                                            style={{ width: '100px', height: '72px', objectFit: 'cover' }} 
                                            />
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        <div className="truncate">
                                            <span>{calculateDaysRemaining(item.endBorrowDate)}</span>
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
                                                <span className="font-semibold">Borrow date:&nbsp;</span>
                                                <span>{formatDate(item.borrowDate)}</span>
                                            </div>
                                            
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Return date:&nbsp;</span>
                                            <span>{formatDate(item.endBorrowDate)}</span>
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
                                    <Button 
                                        text="Return" 
                                        textColor="white" 
                                        borderColor="custom-primary" 
                                        fillColor="custom-primary"
                                        paddingY="py-0"
                                        font="semibold"
                                        onClick={() => openModal(item)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden w-full">
                                <div className="flex justify-between w-full">
                                    <div className="p-2">
                                        <span className="text-sm font-semibold truncate sm:text-lg">{item.item.name}</span>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex items-center p-4 max-w-xs w-full">
                                    <div className="w-1/3 flex justify-center mr-2">
                                        <img 
                                            src={item.item.image}
                                            alt={item.item.name} 
                                            style={{ width: '100px', height: '72px', objectFit: 'cover' }} 
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
                                    <Button 
                                        text="Return" 
                                        textColor="white" 
                                        borderColor="custom-primary" 
                                        fillColor="custom-primary"
                                        paddingY="py-0"
                                        font="semibold"
                                        onClick={() => openModal(item)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
        </div>
        </>
    );
}