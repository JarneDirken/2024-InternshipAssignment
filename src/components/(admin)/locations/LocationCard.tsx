import { Location } from "@/models/Location";
import Loading from "@/components/states/Loading";
import Image from 'next/image';
import Checkbox from '@mui/material/Checkbox';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';

interface LocationCardProps {
    openModal: (mode: 'add' | 'edit' | 'delete', item: Location) => void;
    items: Location[];
    itemLoading: boolean;
    selectedItems: Location[];
    onSelectItem: (id: number) => void;
};

export default function LocationCard({ openModal, onSelectItem, selectedItems, items, itemLoading }: LocationCardProps) {
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
                    <div className={`border-b-2 p-3 relative md:hidden`}>
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <Checkbox
                                checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
                                onChange={() => onSelectItem(item.id)} 
                            />
                        </div>
                        <div className="flex">
                            <div className="w-1/5"></div>
                            <div className="flex-1 w-2/4 items-center">
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Name&nbsp;</span><br/>
                                    <Tooltip title={item.name} placement="top-start" arrow>
                                        <span>{item.name}</span>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="w-3/12 flex items-center justify-evenly items-end">
                                <Tooltip title="Edit" placement="top-start" arrow>
                                    <div className="cursor-pointer" onClick={() => openModal('edit', item)}>
                                        <EditOutlinedIcon className="text-gray-400" />
                                    </div>
                                </Tooltip>
                                <Tooltip title="Delete" placement="top-start" arrow>
                                    <div className="cursor-pointer" onClick={() => openModal('delete', item)}>
                                        <DeleteOutlinedIcon className="text-custom-red" />
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className={`border-b-2 py-2 hidden md:grid grid-cols-12`}>
                        <div className="mx-auto">
                            <Checkbox
                                className="col-span-1"
                                checked={selectedItems.some(selectedItem => selectedItem.id === item.id)}
                                onChange={() => onSelectItem(item.id)} 
                            />
                        </div>
                        <div className="truncate col-span-9 lg:col-span-10 p-2 self-center">
                            <Tooltip title={item.name} placement="top-start" arrow>
                                <span>{item.name}</span>
                            </Tooltip>
                        </div>
                        
                        <div className="flex justify-evenly col-span-2 lg:col-span-1 p-2 self-center">
                            <Tooltip title="Edit" placement="top" arrow>
                                <div className="cursor-pointer" onClick={() => openModal('edit', item)}>
                                    <EditOutlinedIcon className="text-gray-400" />
                                </div>
                            </Tooltip>
                            <Tooltip title="Delete" placement="top" arrow>
                                <div className="cursor-pointer" onClick={() => openModal('delete', item)}>
                                    <DeleteOutlinedIcon className="text-custom-red" />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}