'use client';
import Button from "@/components/states/Button";
import Loading from "@/components/states/Loading";
import { Item } from "@/models/Item";
import { createRequest, itemsState } from "@/services/store";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { useInView } from 'react-intersection-observer';

interface BorrowCardProps {
    active: boolean;
    openModal: (id: number) => void;
    nameFilter: string;
    modelFilter: string;
    brandFilter: string;
    locationFilter: string;
}

export default function BorrowCard({ active, openModal, nameFilter, modelFilter, brandFilter, locationFilter }: BorrowCardProps) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useRecoilState(itemsState);
    const successfullCreated = useRecoilValue(createRequest);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView();
    const NUMBER_OF_ITEMS_TO_FETCH = 7;
    const listRef = useRef<HTMLDivElement>(null);

    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";

    // get items with pagination and filter on SERVER SIDE
    async function getItems(initialLoad = false) {
        if (!hasMore && !initialLoad) return;
        
        setLoading(true);
        const currentOffset = initialLoad ? 0 : offset;
        const queryString = new URLSearchParams({
            name: nameFilter,
            model: modelFilter,
            brand: brandFilter,
            location: locationFilter,
            offset: currentOffset.toString(),
            limit: NUMBER_OF_ITEMS_TO_FETCH.toString()
        }).toString();

        try {
            const response = await fetch(`/api/user/items?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (initialLoad) {
                setItems(data.items);
            } else {
                setItems(prevItems => [...prevItems, ...data.items]);
            }

            setOffset(currentOffset + data.items.length);
            setHasMore(data.items.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getItems(true);
    }, [nameFilter, modelFilter, brandFilter, locationFilter, successfullCreated]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            // Save the current scroll position
            // Ensure currentScrollPosition is a number by using the nullish coalescing operator (??)
            // to fall back to 0 if listRef.current is null
            const currentScrollPosition = listRef.current?.scrollTop ?? 0;
    
            getItems().then(() => {
                // Restore the scroll position after new items have been loaded
                if (listRef.current) {
                    listRef.current.scrollTop = currentScrollPosition;
                }
            });
        }
    }, [inView, loading, hasMore]);

    if (loading) { return (<Loading />); }

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
    }

    function renderItemStatus(item: Item) {
        switch (item.itemStatusId) {
            case 1:
                return (
                    <Button 
                        text="Borrow" 
                        textColor="white" 
                        borderColor="custom-primary" 
                        fillColor="custom-primary"
                        paddingY="py-0"
                        font="semibold"
                        onClick={() => openModal(item.id)}
                    />
                );
            case 2:
                return <span>Pending borrow</span>;
            case 3:
                return <span>Being Borrowed</span>;
            case 4:
                return <span>Pending return</span>;
            case 5:
                return <span>Reparation</span>;
            case 6:
                return <span>Broken</span>;
            default:
                return null;
        }
    }

    return (
        <>
            <div ref={listRef} className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between">
                                <div className="flex flex-row gap-10 items-center">
                                    <div>
                                        <img src={item.image} height={100} width={100} alt={item.name} />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="truncate">
                                            <span className="font-semibold">Name:&nbsp;</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Model:&nbsp;</span>
                                            <span>{item.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="truncate">
                                            <span className="font-semibold">Brand:&nbsp;</span>
                                            <span>{item.brand}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {renderItemStatus(item)}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                <div className="p-2">
                                    <span className="text-lg font-semibold truncate">{item.name}</span>
                                </div>
                                <hr />
                                <div className="flex items-center p-4 max-w-xs">
                                    <div className="w-1/3 flex justify-center mr-2">
                                        <img src={item.image} height={140} width={140} alt={item.name} />
                                    </div>
                                    <div className="flex flex-col items-start w-2/3">
                                        <div className="flex items-center gap-6 max-w-full">
                                            <div className="flex flex-col items-start max-w-2/3">
                                                <span className="text-gray-400">Model</span>
                                                <span className="truncate">{item.model}</span>
                                            </div>
                                            <div className="flex flex-col items-start max-w-1/3">
                                                <span className="text-gray-400">Brand</span>
                                                <span className="truncate">{item.brand}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start w-full">
                                            <span className="text-gray-400">Location</span>
                                            <span className="truncate">{item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-center items-center p-2">
                                    {renderItemStatus(item)}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {hasMore && <div ref={ref}>Loading more items...</div>}
        </div>
        </>
    );
}