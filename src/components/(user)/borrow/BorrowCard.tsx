'use client';
import Button from "@/components/states/Button";
import Loading from "@/components/states/Loading";
import { GroupedItem } from "@/models/Item";
import { createRequest } from "@/services/store";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

interface BorrowCardProps {
    active: boolean;
    openModal: (groupItem: GroupedItem) => void;
    nameFilter: string;
    modelFilter: string;
    brandFilter: string;
    locationFilter: string;
    userId: string;
}

export default function BorrowCard({ active, openModal, nameFilter, modelFilter, brandFilter, locationFilter, userId }: BorrowCardProps) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<GroupedItem[]>([]);
    const successfullCreated = useRecoilValue(createRequest);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const { ref, inView } = useInView();
    const NUMBER_OF_ITEMS_TO_FETCH = 10;
    const listRef = useRef<HTMLDivElement>(null);

    const cardContainerHeight = "calc(100vh - 25.6rem)";
    const gridViewClass = "grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4 overflow-y-scroll w-full";
    const listViewClass = "flex flex-col bg-white rounded-bl-xl rounded-br-xl overflow-y-scroll";

    useEffect(() => {
        getItems(true);
    }, [nameFilter, modelFilter, brandFilter, locationFilter]);

    useEffect(() => {
        getItems(true);
    }, [successfullCreated]);

    useEffect(() => {
        if (inView && hasMore && !loading) {
            // Ensure we have a current scroll position as a number, even if listRef.current is null
            const currentScrollPosition = listRef.current ? listRef.current.scrollTop : 0;
        
            getItems().then(() => {
                // Use requestAnimationFrame to ensure the DOM has updated
                requestAnimationFrame(() => {
                    if (listRef.current) {
                        listRef.current.scrollTop = currentScrollPosition;
                    }
                });
            });
        }
    }, [inView, loading, hasMore]);

    async function getItems(initialLoad = false) {
        if (!hasMore && !initialLoad) return;
        
        setLoading(true);
        const currentOffset = initialLoad ? 0 : offset;
        const queryString = new URLSearchParams({
            name: nameFilter,
            model: modelFilter,
            brand: brandFilter,
            location: locationFilter,
            userId: userId,
            offset: currentOffset.toString(),
            limit: NUMBER_OF_ITEMS_TO_FETCH.toString()
        }).toString();
    
        try {
            const response = await fetch(`/api/user/items?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const groupedItems = data.items;
    
            if (initialLoad) {
                setItems(groupedItems);
            } else {
                setItems(prevItems => [...prevItems, ...groupedItems]);
            }
    
            setOffset(currentOffset + groupedItems.length);
            setHasMore(groupedItems.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setLoading(false);
        }
    }

    function renderItemStatus(item: GroupedItem) {
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
                        onClick={() => openModal(item)}
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

    if (loading) { return (<Loading />); }

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items found.
            </div>
        );
    }

    return (
        <>
            <div ref={listRef} className={active ? listViewClass : gridViewClass} style={{ maxHeight: cardContainerHeight }}>
                {items.map((item) => (
                    <div key={item.id} className={`bg-white ${active ? "flex-row rounded-xl" : "rounded-md shadow-lg mb-2"}`}>
                        {active ? (
                            <div className="flex flex-row py-2 px-8 border-b border-gray-300 items-center justify-between w-full">
                                <div className="flex flex-row items-center w-full">
                                    <div className="w-1/12 mr-2">
                                    {!item.image ? (
                                            <Image 
                                                src="/assets/images/defaultImage.jpg"
                                                width={72}
                                                height={100}
                                                alt="Default iamge"
                                          />
                                        ) : (
                                            <img 
                                                src={item.image}
                                                alt={item.name} 
                                                style={{ width: '100px', height: '72px', objectFit: 'cover' }} 
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-1/4 mr-2">
                                        <div className="truncate">
                                            <span className="font-semibold">Name:&nbsp;</span>
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Model:&nbsp;</span>
                                            <span>{item.model}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-3/4">
                                        <div className="flex gap-8 items-center">
                                        <div className="truncate flex items-center">
                                                <span className="font-semibold">Amount:&nbsp;</span>
                                                <span>{item.count}</span>
                                            </div>
                                            <div className="truncate">
                                                <span className="font-semibold">Brand:&nbsp;</span>
                                                <span>{item.brand}</span>
                                            </div>
                                            
                                        </div>
                                        <div className="truncate">
                                            <span className="font-semibold">Location:&nbsp;</span>
                                            <span>{item.location.name}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/12">
                                    {renderItemStatus(item)}
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-hidden w-full">
                                <div className="flex justify-between w-full">
                                    <div className="p-2">
                                        <span className="text-sm font-semibold truncate sm:text-lg">{item.name}</span>
                                    </div>
                                    <div className="truncate flex items-center p-2 text-sm sm:text-base">
                                        <span className="font-semibold">Amount:&nbsp;</span>
                                        <span>{item.count}</span>
                                    </div>
                                </div>
                                <hr />
                                <div className="flex items-center p-4 max-w-xs w-full">
                                    <div className="w-1/3 flex justify-center mr-2">
                                    {!item.image ? (
                                            <Image 
                                                src="/assets/images/defaultImage.jpg"
                                                width={72}
                                                height={100}
                                                alt="Default iamge"
                                          />
                                        ) : (
                                            <img 
                                                src={item.image}
                                                alt={item.name} 
                                                style={{ width: '100px', height: '72px', objectFit: 'cover' }} 
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start w-2/3">
                                        <div className="flex items-center gap-6 max-w-full">
                                            <div className="flex flex-col items-start max-w-2/3 text-sm sm:text-base">
                                                <span className="text-gray-400">Model</span>
                                                <span className="truncate">{item.model}</span>
                                            </div>
                                            <div className="flex flex-col items-start max-w-1/3 text-sm sm:text-base">
                                                <span className="text-gray-400">Brand</span>
                                                <span className="truncate">{item.brand}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start w-full text-sm sm:text-base">
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