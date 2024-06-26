import { Item } from "@/models/Item";
import Loading from "@/components/states/Loading";
import Image from 'next/image';
import Checkbox from '@mui/material/Checkbox';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';

interface ProductCardProps {
    openModal: (mode: 'add' | 'edit' | 'delete', item: Item) => void;
    items: Item[];
    itemLoading: boolean;
    selectedItems: Item[];
    onSelectItem: (id: number) => void;
    hasMore: boolean;
    innerRef: React.Ref<HTMLDivElement>;
};

export default function ProductCard({ openModal, onSelectItem, selectedItems, items, itemLoading, hasMore, innerRef }: ProductCardProps) {
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
                    <div className={`border-b-2 p-3 relative lg:hidden
                        ${
                            !item.active ? 'bg-gray-300' :
                            item.itemStatus?.name === 'Borrowed' ? 'bg-blue-100' :
                            item.itemStatus?.name === 'Broken' ? 'bg-red-100' :
                            item.itemStatus?.name === 'Repairing' ? 'bg-orange-100' : ''
                        }
                    `}>
                        {item.RoleItem?.[0]?.role?.name === 'Teacher' && (
                            <div className="absolute top-2 left-2 text-purple-600">
                                <AdminPanelSettingsRoundedIcon fontSize="medium" />
                            </div>
                        )}
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
                                <div>
                                    <span className="font-medium text-gray-400">Brand&nbsp;</span><br/>
                                    <Tooltip title={item.brand} placement="top-start" arrow>
                                        <div className="truncate">
                                            <span>{item.brand}</span>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-400">Year&nbsp;</span><br/>
                                    <Tooltip title={item.yearBought ? new Date(item.yearBought).getUTCFullYear() : 'N/A'} placement="top-start" arrow>
                                        <div className="truncate">
                                            <span>{item.yearBought ? new Date(item.yearBought).getUTCFullYear() : 'N/A'}</span>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Second Column */}
                            <div className="flex-1 w-2/4">
                                <div>
                                    <span className="font-medium text-gray-400">No.&nbsp;</span><br/>
                                    <Tooltip title={item.number} placement="top-start" arrow>
                                        <div className="truncate">
                                            <span>{item.number}</span>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-400">Name&nbsp;</span><br/>
                                    <Tooltip title={item.name} placement="top-start" arrow>
                                        <div className="truncate">
                                            <span>{item.name}</span>
                                        </div>
                                    </Tooltip>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-400">Model&nbsp;</span><br/>
                                    <Tooltip title={item.model} placement="top-start" arrow>
                                        <div className="truncate">
                                            <span>{item.model}</span>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>

                        {/* Location starts under the first column and extends further */}
                        <div className="flex">
                            <div className="w-1/5"></div> {/* Empty div to align with the first column's position */}
                            <div className="flex-1 w-1/4">
                                <div>
                                    <span className="font-medium text-gray-400">Location&nbsp;</span><br/>
                                    <Tooltip title={item.location.name} placement="top-start" arrow>
                                        <div className="truncate">
                                            <span>{item.location.name}</span>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="w-5/12 flex justify-evenly items-end">
                                <Tooltip title="Edit" placement="top-start" arrow>
                                    <div className="cursor-pointer hover:bg-gray-100 rounded-full" onClick={() => openModal('edit', item)}>
                                        <IconButton size="small">
                                            <EditOutlinedIcon className="text-gray-500" />
                                        </IconButton>
                                    </div>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top-start" arrow>
                                    <div className="cursor-pointer" onClick={() => openModal('delete', item)}>
                                        <IconButton size="small">
                                            <DeleteOutlinedIcon className="text-custom-red" />
                                        </IconButton>
                                    </div>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top-start" arrow>
                                    <div className="cursor-pointer" onClick={() => viewItemHistory(item.id)}>
                                        <IconButton size="small">
                                            <HistoryOutlinedIcon className="text-custom-primary" />
                                        </IconButton>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className={`border-b-2 py-2 hidden lg:grid grid-cols-12 relative 
                        ${
                            !item.active ? 'bg-gray-300' :
                            item.itemStatus?.name === 'Borrowed' ? 'bg-blue-100' :
                            item.itemStatus?.name === 'Broken' ? 'bg-red-100' :
                            item.itemStatus?.name === 'Repairing' ? 'bg-orange-100' : ''
                        }
                    `}>
                        {item.RoleItem?.[0]?.role?.name === 'Teacher' && (
                            <div className="absolute top-1 left-1 text-purple-600">
                                <AdminPanelSettingsRoundedIcon />
                            </div>
                        )}
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
                        <div className="col-span-2 p-2 self-center">
                            <Tooltip title={item.number} placement="top-start" arrow>
                                <div className="truncate">
                                    <span>{item.number}</span>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="col-span-2 p-2 self-center">
                            <Tooltip title={item.name} placement="top-start" arrow>
                                <div className="truncate">
                                    <span>{item.name}</span>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="col-span-1 p-2 self-center">
                            <Tooltip title={item.model} placement="top-start" arrow>
                                <div className="truncate">
                                    <span>{item.model}</span>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="col-span-1 p-2 self-center">
                            <Tooltip title={item.brand} placement="top-start" arrow>
                                <div className="truncate">
                                    <span>{item.brand}</span>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="col-span-1 p-2 self-center">
                            <Tooltip title={item.location.name} placement="top-start" arrow>
                                <div className="truncate">
                                    <span>{item.location.name}</span>
                                </div>
                            </Tooltip>
                        </div>
                        <div className="col-span-1 p-2 self-center">
                            <Tooltip title={item.yearBought ? new Date(item.yearBought).getUTCFullYear() : 'N/A'} placement="top-start" arrow>
                                <div className="truncate">
                                    <span>{item.yearBought ? new Date(item.yearBought).getUTCFullYear() : 'N/A'}</span>
                                </div>
                            </Tooltip>
                        </div>
                        
                        <div className="flex justify-evenly col-span-2 self-center">
                            <Tooltip title="Edit" placement="top" arrow>
                                <div className="cursor-pointer" onClick={() => openModal('edit', item)}>
                                    <IconButton size="small">
                                        <EditOutlinedIcon className="text-gray-500" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top" arrow>
                                <div className="cursor-pointer" onClick={() => openModal('delete', item)}>
                                    <IconButton size="small">
                                        <DeleteOutlinedIcon className="text-custom-red" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                            
                            <Tooltip title="History" placement="top" arrow>
                                <div className="cursor-pointer" onClick={() => viewItemHistory(item.id)}>
                                    <IconButton size="small">
                                        <HistoryOutlinedIcon className="text-custom-primary" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            ))}
            {hasMore && <div ref={innerRef}>Loading more items...</div>}
        </>
    );
}