import Button from "@/components/states/Button";
import { ItemRequest } from "@/models/ItemRequest";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Loading from "@/components/states/Loading";
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Image from 'next/image';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';

interface BorrowCardProps {
    active: boolean;
    openModal: (itemRequest: ItemRequest) => void;
    items: ItemRequest[];
    itemLoading: boolean;
    selectedTab?: string;
    setHandover?: (value: boolean) => void;
    setReceive?: (value: boolean) => void;
    setChecked?: (value: boolean) => void;
};

export default function ItemCard({ active, openModal, items, itemLoading, selectedTab, setHandover, setReceive, setChecked }: BorrowCardProps) {
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

    const formatDateTime = (date?: Date | string) => {
        if (!date) {
            return <span>No date set</span>;
        }
    
        const dateObj = date instanceof Date ? date : new Date(date);
    
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        return dateObj.toLocaleDateString('en-US', options).replace(',', ' -');
    };
    
    const handover = (item: ItemRequest) => {
        setHandover!(true);
        openModal(item);
    };

    const receive = (item: ItemRequest) => {
        setReceive!(true);
        openModal(item);
    };

    const checked = (item: ItemRequest) => {
        setChecked!(true);
        openModal(item);
    };

    return (
        <>
            <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                                <div className="flex flex-row items-center w-5/6">
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
                                        {(selectedTab !== "checkitem" && selectedTab !== "history") && (
                                            <div className="flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm">
                                                <AccessTimeIcon fontSize="small"/>
                                                {selectedTab === "borrows" && (
                                                    <span>{formatDateTime(item.borrowDate)}</span>
                                                )}
                                                {selectedTab === "returns" && (
                                                    <span>{formatDateTime(item.returnDate)}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col w-1/3">
                                        {(selectedTab !== "checkitem" && selectedTab !== "history") && (
                                            <>
                                                <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                                                    <AccessTimeIcon fontSize="small"/>
                                                    <span>Pending</span>
                                                </div>
                                                <div className="flex truncate items-center gap-1">
                                                    <span className="font-semibold">{item.requestStatusId===3 ? <span>Reject</span> : <span>Approve</span>}&nbsp;date:</span>
                                                    <span>{formatDate(item.decisionDate)}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="truncate">
                                            <span className="font-semibold">Brand:&nbsp;</span>
                                            <span>{item.item.brand}</span>
                                        </div>
                                        {(selectedTab === "checkitem" || selectedTab === "history") && (
                                            <div className="truncate">
                                                <span className="font-semibold">Location:&nbsp;</span>
                                                <span>{item.item.location.name}</span>
                                            </div>
                                        )}
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
                                        {(selectedTab !== "checkitem" && selectedTab !== "history") && (
                                            <div className="truncate">
                                                <span className="font-semibold">Location:&nbsp;</span>
                                                <span>{item.item.location.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="w-1/12 flex flex-col gap-1">
                                    {selectedTab === "borrows" && (
                                        <Button 
                                            text="Hand over"
                                            textColor="custom-green"
                                            borderColor="custom-green"
                                            paddingX="px-0"
                                            paddingY="py-0"
                                            onClick={() => handover(item)}
                                        />
                                    )}
                                    {selectedTab === "returns" && (
                                        <Button 
                                            text="Received"
                                            textColor="custom-green"
                                            borderColor="custom-green"
                                            paddingX="px-0"
                                            paddingY="py-0"
                                            onClick={() => receive(item)}
                                        />
                                    )}
                                    {selectedTab === "checkitem" && (
                                        <Button 
                                            text="Checked"
                                            textColor="custom-green"
                                            borderColor="custom-green"
                                            paddingX="px-0"
                                            paddingY="py-0"
                                            onClick={() => checked(item)}
                                        />
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="p-2 flex items-center flex-wrap">
                                    <div className={`flex items-start truncate ${selectedTab!=="checkitem" && selectedTab!=="history" ? 'w-1/2 flex-col' : 'w-full justify-between flex-row'}`}>
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
                                        {(selectedTab !== "checkitem" && selectedTab !== "history") && (
                                            <div className="flex truncate items-center text-custom-primary gap-1 text-sm sm:text-base">
                                                <AccessTimeIcon fontSize="small"/>
                                                <span>Pending</span>
                                            </div>
                                        )}
                                        {(selectedTab !== "checkitem" && selectedTab !== "history") && (
                                            <div className="flex truncate items-center text-gray-400 gap-1 text-xs sm:text-sm">
                                                <AccessTimeIcon fontSize="small"/>
                                                {selectedTab === "borrows" && (
                                                    <span>{formatDateTime(item.borrowDate)}</span>
                                                )}
                                                {selectedTab === "returns" && (
                                                    <span>{formatDateTime(item.returnDate)}</span>
                                                )}
                                            </div>
                                        )}
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
                                        {(selectedTab !== "checkitem" && selectedTab !== "history") && (
                                            <div className="flex flex-col items-start w-1/3 text-sm sm:text-base pl-2 truncate">
                                                <span className="text-gray-400">{item.requestStatusId===3 ? <span>Reject</span> : <span>Approve</span>}&nbsp;date</span>
                                                <span>{formatDate(item.decisionDate)}</span>
                                            </div>
                                        )}
                                        <div className={`flex flex-col items-start text-sm sm:text-base pl-2 truncate ${selectedTab!=="checkitem" && selectedTab!=="history" ? 'w-2/3' : 'w-full'}`}>
                                            <span className="text-gray-400">Location</span>
                                            <span className="truncate">{item.item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-center items-center p-2">
                                    {selectedTab === "borrows" && (
                                        <Button 
                                            text="Hand over"
                                            textColor="custom-green"
                                            borderColor="custom-green"
                                            onClick={() => handover(item)}
                                        />
                                    )}
                                    {selectedTab === "returns" && (
                                        <Button 
                                            text="Received"
                                            textColor="custom-green"
                                            borderColor="custom-green"
                                            onClick={() => receive(item)}
                                        />
                                    )}
                                    {selectedTab === "checkitem" && (
                                        <Button 
                                            text="Checked"
                                            textColor="custom-green"
                                            borderColor="custom-green"
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