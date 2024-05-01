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
    openModal: (mode: 'add' | 'edit' | 'delete', item: Item) => void;
    items: Item[];
    itemLoading: boolean;
    selectedItems: Item[];
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
            {items.map((item) => (
                <div key={item.id}>
                    <div className={`border-b-2 p-3 relative lg:hidden ${!item.active ? 'bg-red-100' : ''}`}>
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Checkbox
                                checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
                                onChange={() => onSelectItem(item.id)} 
                            />
                        </div>
                        <div className="flex">
                            {/* First Column */}
                            <div className="w-1/5"></div>
                            <div className="flex-1 w-1/4">
                                <Image 
                                    src={item.image || "/assets/images/defaultImage.jpg"}
                                    alt={item.name || "Default Image"}
                                    style={{ width: 'auto', height: 'auto' }} 
                                    width={60}
                                    height={60}
                                    loading="lazy"
                                />
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Brand&nbsp;</span><br/>
                                    <Tooltip title={item.brand} placement="top-start">
                                        <span>{item.brand}</span>
                                    </Tooltip>
                                </div>
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Year&nbsp;</span><br/>
                                    <Tooltip title={item.yearBought ? new Date(item.yearBought).getFullYear() : 'N/A'} placement="top-start">
                                        <span>{item.yearBought ? new Date(item.yearBought).getFullYear() : 'N/A'}</span>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Second Column */}
                            <div className="flex-1 w-2/4">
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">No.&nbsp;</span><br/>
                                    <Tooltip title={item.number} placement="top-start">
                                        <span>{item.number}</span>
                                    </Tooltip>
                                </div>
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Name&nbsp;</span><br/>
                                    <Tooltip title={item.name} placement="top-start">
                                        <span>{item.name}</span>
                                    </Tooltip>
                                </div>
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Model&nbsp;</span><br/>
                                    <Tooltip title={item.model} placement="top-start">
                                        <span>{item.model}</span>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        {/* Location starts under the first column and extends further */}
                        <div className="flex">
                            <div className="w-1/5"></div> {/* Empty div to align with the first column's position */}
                            <div className="flex-1 w-1/4">
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Location&nbsp;</span><br/>
                                    <Tooltip title={item.location.name} placement="top-start">
                                        <span>{item.location.name}</span>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="w-5/12 flex justify-evenly items-end">
                                <Tooltip title="Edit" placement="top-start">
                                    <div className="cursor-pointer" onClick={() => openModal('edit', item)}>
                                        <EditOutlinedIcon className="text-gray-400" />
                                    </div>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top-start">
                                    <div className="cursor-pointer" onClick={() => openModal('delete', item)}>
                                        <DeleteOutlinedIcon className="text-custom-red" />
                                    </div>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top-start">
                                    <div className="cursor-pointer" onClick={() => viewItemHistory(item.id)}>
                                        <HistoryOutlinedIcon className="text-custom-primary" />
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className={`border-b-2 py-2 hidden lg:grid grid-cols-12 ${!item.active ? 'bg-red-100' : ''}`}>
                        <div className="mx-auto">
                            <Checkbox
                                className="col-span-1"
                                checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
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
                                <div className="cursor-pointer" onClick={() => openModal('edit', item)}>
                                    <EditOutlinedIcon className="text-gray-400" />
                                </div>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top">
                                <div className="cursor-pointer" onClick={() => openModal('delete', item)}>
                                    <DeleteOutlinedIcon className="text-custom-red" />
                                </div>
                            </Tooltip>
                            
                            <Tooltip title="History" placement="top">
                                <div className="cursor-pointer" onClick={() => viewItemHistory(item.id)}>
                                    <HistoryOutlinedIcon className="text-custom-primary" />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}