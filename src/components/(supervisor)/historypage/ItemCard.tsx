import Loading from "@/components/states/Loading";
import { ItemRequest } from '@/models/ItemRequest';
import UserItemView from './UserItemView';
import ItemUserView from './ItemUserView';

interface BorrowCardProps {
    active: boolean;
    items: ItemRequest[];
    itemLoading: boolean;
    type: string;
};

export default function ItemCard({ active, items, itemLoading, type}: BorrowCardProps) {
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

    return (
        <>
            <div className={active ? listViewClass : gridViewClass} style={{ maxHeight: "60vh" }}>
                {type === "user" ? 
                    items.map((item, index) => (
                        <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                            <UserItemView item={item} active={active} />
                        </div>
                    ))
                :
                    items.map((item, index) => (
                        <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                            <ItemUserView key={item.id} item={item} active={active} />
                        </div>
                    ))
                }
        </div>
        </>
    );
}