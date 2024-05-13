import { User } from "@/models/User";
import Loading from "@/components/states/Loading";
import Checkbox from '@mui/material/Checkbox';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';
import { IconButton } from "@mui/material";

interface UserCardProps {
    openModal: (mode: 'add' | 'edit' | 'delete', item: User) => void;
    items: User[];
    itemLoading: boolean;
    selectedItems: User[];
    onSelectItem: (id: number) => void;
    hasMore: boolean;
    innerRef: React.Ref<HTMLDivElement>;
};

export default function UserCard({ openModal, onSelectItem, selectedItems, items, itemLoading, hasMore, innerRef }: UserCardProps) {
    const router = useRouter();

    const viewUserHistory = (itemId: number) => {
            const type="user"
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
                            <div className="flex-1 w-2/4">
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">First Name&nbsp;</span><br/>
                                    <Tooltip title={item.firstName} placement="top-start" arrow>
                                        <span>{item.firstName}</span>
                                    </Tooltip>
                                </div>
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Last Name&nbsp;</span><br/>
                                    <Tooltip title={item.lastName} placement="top-start" arrow>
                                        <span>{item.lastName}</span>
                                    </Tooltip>
                                </div>
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Email&nbsp;</span><br/>
                                    <Tooltip title={item.email} placement="top-start" arrow>
                                        <span>{item.email}</span>
                                    </Tooltip>
                                </div>
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Level&nbsp;</span><br/>
                                    <Tooltip title={item.role.name} placement="top-start" arrow>
                                        <span>{item.role.name}</span>
                                    </Tooltip>
                                </div>
                            </div>

                            {/* Second Column */}
                            <div className="flex-1 w-full flex flex-col justify-between">
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Student Code&nbsp;</span><br/>
                                    <Tooltip title={item.studentCode} placement="top-start" arrow>
                                        <span>{item.studentCode}</span>
                                    </Tooltip>
                                </div>
                                <div className="truncate">
                                    <span className="font-medium text-gray-400">Telephone&nbsp;</span><br/>
                                    <Tooltip title={item.tel} placement="top-start" arrow>
                                        <span>{item.tel}</span>
                                    </Tooltip>
                                </div>
                                <div className="flex justify-evenly items-end mt-auto">
                                    <Tooltip title="Edit" placement="top-start" arrow>
                                        <div className="cursor-pointer" onClick={() => openModal('edit', item)}>
                                            <IconButton size="small">
                                                <EditOutlinedIcon className="text-gray-400" />
                                            </IconButton>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="Delete" placement="top-start" arrow>
                                        <div className="cursor-pointer" onClick={() => openModal('delete', item)}>\
                                            <IconButton size="small">
                                                <DeleteOutlinedIcon className="text-custom-red" />
                                            </IconButton>
                                        </div>
                                    </Tooltip>
                                    <Tooltip title="Delete" placement="top-start" arrow>
                                        <div className="cursor-pointer" onClick={() => viewUserHistory(item.id)}>
                                            <IconButton size="small">
                                                <HistoryOutlinedIcon className="text-custom-primary" />
                                            </IconButton>
                                        </div>
                                    </Tooltip>
                                </div>
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
                        <div className="truncate col-span-2 p-2 self-center">
                            <Tooltip title={item.firstName} placement="top-start" arrow>
                                <span>{item.firstName}</span>
                            </Tooltip>
                        </div>
                        <div className="truncate col-span-2 p-2 self-center">
                            <Tooltip title={item.lastName} placement="top-start" arrow>
                                <span>{item.lastName}</span>
                            </Tooltip>
                        </div>
                        <div className="truncate col-span-1 p-2 self-center">
                            <Tooltip title={item.studentCode} placement="top-start" arrow>
                                <span>{item.studentCode}</span>
                            </Tooltip>
                        </div>
                        <div className="truncate col-span-1 p-2 self-center">
                            <Tooltip title={item.tel} placement="top-start" arrow>
                                <span>{item.tel}</span>
                            </Tooltip>
                        </div>
                        <div className="truncate col-span-2 p-2 self-center">
                            <Tooltip title={item.email} placement="top-start" arrow>
                                <span>{item.email}</span>
                            </Tooltip>
                        </div>
                        <div className="truncate col-span-1 p-2 self-center">
                            <Tooltip title={item.role.name} placement="top-start" arrow>
                                <span>{item.role.name}</span>
                            </Tooltip>
                        </div>
                        
                        <div className="flex justify-evenly col-span-2 p-2 self-center">
                            <Tooltip title="Edit" placement="top" arrow>
                                <div className="cursor-pointer" onClick={() => openModal('edit', item)}>
                                    <IconButton size="small">
                                        <EditOutlinedIcon className="text-gray-400" />
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
                                <div className="cursor-pointer" onClick={() => viewUserHistory(item.id)}>
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