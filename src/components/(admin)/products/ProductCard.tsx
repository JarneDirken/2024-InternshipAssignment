import { Item } from "@/models/Item";
import Loading from "@/components/states/Loading";
import Image from 'next/image';
import Checkbox from '@mui/material/Checkbox';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';

interface ProductCardProps {
    openModal: (item: Item) => void;
    items: Item[];
    itemLoading: boolean;
    selectedItems: Set<number>;
    onSelectItem: (id: number) => void;
};

export default function ProductCard({ openModal, onSelectItem, selectedItems, items, itemLoading }: ProductCardProps) {
    const router = useRouter();

    const viewItemHistory = (itemId: number) => {
            const type="item"
            router.push(`/historypage/${type}/${itemId}`);
    };
    
    if (itemLoading) { return (<Loading />); };

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
    };

    return (
        <>
            <div>
                {items.map((item) => (
                    <>
                        {/* Mobile View */}
                        <div key={item.id} className="border-b-2 p-3 relative lg:hidden">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                <Checkbox
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => onSelectItem(item.id)} 
                                />
                            </div>
                            <div className="flex">
                                {/* First Column */}
                                <div className="w-1/5"></div>
                                <div className="flex-1 w-1/4">
                                    {!item.image ? (
                                        <Image 
                                            src="/assets/images/defaultImage.jpg"
                                            style={{ width: 'auto', height: 'auto'}}
                                            width={60}
                                            height={60}
                                            alt="Default iamge"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <Image 
                                            src={item.image}
                                            alt={item.name}
                                            style={{ width: 'auto', height: 'auto' }} 
                                            width={60}
                                            height={60}
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="truncate">
                                        <span className="font-medium text-gray-400">Brand&nbsp;</span><br/>
                                        <span>{item.brand}</span>
                                    </div>
                                    <div className="truncate">
                                        <span className="font-medium text-gray-400">Year&nbsp;</span><br/>
                                        <span>{item.yearBought ? new Date(item.yearBought).getFullYear() : 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Second Column */}
                                <div className="flex-1 w-2/4">
                                    <div className="truncate">
                                        <span className="font-medium text-gray-400">No.&nbsp;</span><br/>
                                        <span>{item.number}</span>
                                    </div>
                                    <div className="truncate">
                                        <span className="font-medium text-gray-400">Name&nbsp;</span><br/>
                                        <span>{item.name}</span>
                                    </div>
                                    <div className="truncate">
                                        <span className="font-medium text-gray-400">Model&nbsp;</span><br/>
                                        <span>{item.model}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location starts under the first column and extends further */}
                            <div className="flex">
                                <div className="w-1/5"></div> {/* Empty div to align with the first column's position */}
                                <div className="flex-1 w-1/4">
                                    <div className="truncate">
                                        <span className="font-medium text-gray-400">Location&nbsp;</span><br/>
                                        <span>{item.location.name}</span>
                                    </div>
                                </div>
                                <div className="w-5/12 flex justify-evenly items-end">
                                    <EditOutlinedIcon className="text-gray-400" />
                                    <DeleteOutlinedIcon className="text-custom-red" />
                                    <div className="cursor-pointer" onClick={() => viewItemHistory(item.id)}>
                                        <HistoryOutlinedIcon className="text-custom-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop View */}
                        <div key={item.id} className="border-b-2 py-2 hidden lg:grid grid-cols-12">
                            <div className="mx-auto">
                                <Checkbox
                                    className="col-span-1"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => onSelectItem(item.id)} 
                                />
                            </div>
                            <div className="col-span-1">
                                <Image 
                                    src={!item.image ? "/assets/images/defaultImage.jpg" : item.image}
                                    alt={item.name}
                                    style={{ width: 'auto', height: '42px'}}
                                    width={60}
                                    height={60}
                                    loading="lazy"
                                />
                            </div>
                            <div className="truncate col-span-2 p-2 self-center">
                                <Tooltip title={item.number} placement="top-start">
                                    <span>{item.number}</span>
                                </Tooltip>
                            </div>
                            <div className="truncate col-span-2 p-2 self-center">
                                <Tooltip title={item.name} placement="top-start">
                                    <span>{item.name}</span>
                                </Tooltip>
                            </div>
                            <div className="truncate col-span-1 p-2 self-center">
                                <Tooltip title={item.model} placement="top-start">
                                    <span>{item.model}</span>
                                </Tooltip>
                            </div>
                            <div className="truncate col-span-1 p-2 self-center">
                                <Tooltip title={item.brand} placement="top-start">
                                    <span>{item.brand}</span>
                                </Tooltip>
                            </div>
                            <div className="truncate col-span-1 xl:col-span-2 p-2 self-center">
                                <Tooltip title={item.location.name} placement="top-start">
                                    <span>{item.location.name}</span>
                                </Tooltip>
                            </div>
                            <div className="truncate col-span-1 p-2 self-center">
                                <Tooltip title={item.yearBought ? new Date(item.yearBought).getFullYear() : 'N/A'} placement="top-start">
                                    <span>{item.yearBought ? new Date(item.yearBought).getFullYear() : 'N/A'}</span>
                                </Tooltip>
                            </div>
                            
                            <div className="flex justify-evenly col-span-2 xl:col-span-1 p-2 self-center">
                                <Tooltip title="Edit" placement="top">
                                    <EditOutlinedIcon className="text-gray-400" />
                                </Tooltip>
                                <Tooltip title="Delete" placement="top">
                                    <DeleteOutlinedIcon className="text-custom-red" />
                                </Tooltip>
                                <div className="cursor-pointer" onClick={() => viewItemHistory(item.id)}>
                                    <Tooltip title="History" placement="top">
                                        <HistoryOutlinedIcon className="text-custom-primary" />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </>
                ))}
        </div>
        </>
    );
}