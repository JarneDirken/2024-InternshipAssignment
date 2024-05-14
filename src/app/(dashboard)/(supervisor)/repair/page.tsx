'use client';
import useAuth from "@/hooks/useAuth";
import { Filter } from "@/models/Filter";
import { useEffect, useRef, useState } from "react";
import Unauthorized from "../../(error)/unauthorized/page";
import Loading from "@/components/states/Loading";
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import Filters from "@/components/general/Filter";
import { Repair } from "@/models/Repair";
import ItemCard from "@/components/(supervisor)/repair/ItemCard";
import Modal from "@/components/(supervisor)/repair/Modal";
import { useRecoilValue } from "recoil";
import { repariState } from "@/services/store";
import { SortOptions } from "@/models/SortOptions";
import Button from "@/components/states/Button";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import * as XLSX from 'xlsx';
import { useInView } from "react-intersection-observer";
import useUser from "@/hooks/useUser";

export default function Reparation() {
    const { isAuthorized, loading } = useAuth(['Supervisor', 'Admin']);
    const [selectedTab, setSelectedTab] = useState('repair'); // standard open tab
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const { userId, token } = useUser();
    // Items
    const [itemLoading, setItemLoading] = useState(true); // item loading
    const [repair, setRepair] = useState<Repair>();
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [history, setHistory] = useState<Repair[]>([]);
    const [allHistory, setAllHistory] = useState<Repair[]>([]);
    const [repairCount, setRepairCount] = useState(0);
    const [currentItems, setCurrentItems] = useState(repairs);
    const repairRecoilValue = useRecoilValue(repariState);
    // filters
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // filter
    const [isModalOpen, setModalOpen] = useState(false); // modal
    const [repaired, setRepaired] = useState(false);
    const [broken, setBroken] = useState(false);
    const filters: Filter[] = [
        { label: 'Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'item.name' },
        { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange'},
    ];
    const sortOptions: SortOptions[] = [
        { label: 'Name', optionsKey: 'item.name' },
        { label: 'Repair Date', optionsKey: 'repairDate' },
        { label: 'Location', optionsKey: 'item.location.name' }
    ];
    // infinate scroll load
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);     
    const NUMBER_OF_ITEMS_TO_FETCH = 10;
    const listRef = useRef<HTMLDivElement>(null);
    const { ref, inView } = useInView();

    useEffect(() => {
        if(userId && token) {
            getRepairs(true);
            if(selectedTab === "history"){
                getHistory(true);
            }
        }
    }, [userId, nameFilter, borrowDateFilter, repairRecoilValue, token]);

    useEffect(() => {
        if(selectedTab === "history"){
            getHistory(true);
        }
    }, [selectedTab]);

    useEffect(() => {
        switch (selectedTab) {
            case "repair":
                setCurrentItems(repairs);
                break;
            case "history":
                setCurrentItems(history);
                break;
            default:
                setCurrentItems([]);
        }
    }, [selectedTab, repairs, history]);

    // infinate loading scroll
    useEffect(() => {
        if (inView && hasMore && !loading) {
            const currentScrollPosition = listRef.current ? listRef.current.scrollTop : 0;
            if(selectedTab === "repair"){
                getRepairs().then(() => {
                    requestAnimationFrame(() => {
                        if (listRef.current) {
                            listRef.current.scrollTop = currentScrollPosition;
                        }
                    });
                });
            }
            if(selectedTab === "history"){
                getHistory().then(() => {
                    requestAnimationFrame(() => {
                        if (listRef.current) {
                            listRef.current.scrollTop = currentScrollPosition;
                        }
                    });
                });
            }
        }
    }, [inView, loading, hasMore]);

    const closeModal = () => {
        setModalOpen(false);
        setRepaired(false);
        setBroken(false);
    };

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'name':
                setNameFilter(value);
                break;
            case 'Borrow date':
                setBorrowDateFilter(value);
                break;
            default:
                break;
        }
    };

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        if(selectedTab === "repair") { getRepairs(true, sortBy, sortDirection); }
        if(selectedTab === "history") { getHistory(true, sortBy, sortDirection); }
    };

    const parseDateFilter = (dateFilter: string) => {
        const dates = dateFilter.split(" - ");
        const borrowDate = dates[0];
        const returnDate = dates.length > 1 ? dates[1] : new Date().toLocaleDateString('en-US');
    
        return { borrowDate, returnDate };
    };

    const openModal = (item: Repair) => {
        setRepair(item);
        setModalOpen(true);
    };

    const formatDate = (dateString: Date): string => {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    };

    interface ExportDataRepair {
        [key: string]: number | string | undefined;
        RepairId: number;
        ItemName: string;
        ItemBrand: string;
        ItemModel: string;
        ItemYear: string | undefined;
        LastUsed: string;
        Location: string;
        RepairDate: string;
        ReturnDate: string;
        Status: string | undefined;
    };

    const exportRepairHistoryToExcel = (filename: string, worksheetName: string) => {
        if (!allHistory || !allHistory.length) return;
    
        const dataToExport: ExportDataRepair[] = allHistory.map(item => ({
            RepairId: item.id,
            ItemName: item.item.name,
            ItemBrand: item.item.brand,
            ItemModel: item.item.model,
            ItemYear: formatDate(item.item.yearBought!),
            LastUsed: `${item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.firstName} ${item.item.ItemRequests?.[item.item.ItemRequests.length - 1]?.borrower?.lastName}`,
            Location: item.item.location.name,
            RepairDate: formatDate(item.repairDate),
            ReturnDate: formatDate(item.returnDate!),
            Status: item.item.itemStatus?.name,
        }));
    
        // Create a worksheet from the data
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
    
        // Adjust column widths
        const colWidths = Object.keys(dataToExport[0]).map(key => ({
            wch: Math.max(
                ...dataToExport.map(item => item[key] ? item[key]!.toString().length : 0),
                key.length  // Include the length of the header in the calculation
            )
        }));
        worksheet['!cols'] = colWidths;
    
        // Write the workbook to a file
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

    async function getRepairs(initialLoad = false, sortBy = 'repairDate', sortDirection = 'desc') {
        if (!hasMore && !initialLoad) return; // infinate loading
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const currentOffset = initialLoad ? 0 : offset; // infinate loading
        const params: Record<string, string> = {
            name: nameFilter,
            sortBy: sortBy || 'repairDate',
            sortDirection: sortDirection || 'desc',
            offset: currentOffset.toString(), // infinate loading 
            limit: NUMBER_OF_ITEMS_TO_FETCH.toString() // infinate loading 
        };

        // Include dates in the query only if they are defined
        if (borrowDate) {
            params.borrowDate = borrowDate;
            params.returnDate = returnDate;
        }
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        };

        if (token !== null) {
            params.token = token;
        };
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/supervisor/repairs?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.repairs || [];
            const itemCount = data.totalCount || 0;

            setRepairCount(itemCount);

            // infinate loading
            if (initialLoad) {
                setRepairs(fetchedItems);
            } else {
                setRepairs(prevItems => [...prevItems, ...fetchedItems]);
            }
            setOffset(currentOffset + fetchedItems.length);
            setHasMore(fetchedItems.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    async function getHistory(initialLoad = false, sortBy = 'repairDate', sortDirection = 'desc') {
        if (!hasMore && !initialLoad) return; // infinate loading
        setItemLoading(true);
        const { borrowDate, returnDate } = parseDateFilter(borrowDateFilter);
        const currentOffset = initialLoad ? 0 : offset; // infinate loading
        const params: Record<string, string> = {
            name: nameFilter,
            sortBy: sortBy || 'repairDate',
            sortDirection: sortDirection || 'desc',
            offset: currentOffset.toString(), // infinate loading 
            limit: NUMBER_OF_ITEMS_TO_FETCH.toString() // infinate loading 
        };

        // Include dates in the query only if they are defined
        if (borrowDate) {
            params.borrowDate = borrowDate;
            params.returnDate = returnDate;
        }
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        };

        if (token !== null) {
            params.token = token;
        };
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/supervisor/repairhistory?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const infinateLoadHistory = data.repairs;
            const allHistory = data.allRepairs;
            setAllHistory(allHistory);
            // infinate loading
            if (initialLoad) {
                setHistory(infinateLoadHistory);
            } else {
                setHistory(prevItems => [...prevItems, ...infinateLoadHistory]);
            }
            setOffset(currentOffset + infinateLoadHistory.length);
            setHasMore(infinateLoadHistory.length === NUMBER_OF_ITEMS_TO_FETCH);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        } finally {
            setItemLoading(false);
        }
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <Modal 
                open={isModalOpen}
                onClose={closeModal}
                selectedTab={selectedTab}
                item={repair}
                repaired={repaired}
                broken={broken}
                setRepaired={setRepaired}
                setBroken={setBroken}
            />
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    title="Repairs"
                    icon={<HandymanOutlinedIcon fontSize="large" />}
                    active={active}
                    setActive={setActive}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    items={currentItems}
                    filters={filters}
                    sortOptions={sortOptions}
                    isCardView={true}
                />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer hover:text-custom-primary ${selectedTab === 'repair' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('repair')}
                        >
                            In repair
                        </div>
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center text-white font-semibold absolute top-4 right-11 transform translate-x-1/2 -translate-y-1/2 text-xs ${selectedTab === 'repair' ? 'bg-custom-primary' : 'bg-custom-gray'}`}>
                            {repairCount}
                        </div>
                    </div>
                    <div className="relative">
                        <div
                            className={`w-48 flex justify-center py-3 uppercase cursor-pointer hover:text-custom-primary ${selectedTab === 'history' ? 'border-b-4 border-b-custom-primary text-custom-primary font-semibold ' : 'text-custom-gray font-normal'}`}
                            onClick={() => setSelectedTab('history')}
                        >
                            History
                        </div>
                    </div>
                    {selectedTab === "history" && (
                        <div className="flex items-center ml-2">
                            <Button 
                                icon={<InsertDriveFileOutlinedIcon />} 
                                textColor="custom-dark-blue" 
                                borderColor="custom-dark-blue" 
                                buttonClassName="hover:bg-blue-200"
                                fillColor="blue-100" 
                                paddingX="px-2.5"
                                paddingY="py-0.5"
                                textClassName="font-semibold" 
                                text="Export EXCEL"
                                onClick={() => exportRepairHistoryToExcel(`Repair-History`, 'HistoryData')}
                            />
                        </div>
                    )}
                </div>
                {selectedTab === "repair" && (
                    <ItemCard 
                        active={active}
                        openModal={openModal}
                        items={repairs}
                        itemLoading={itemLoading}
                        selectedTab={selectedTab}
                        listRef={listRef}
                        hasMore={hasMore}
                        innerRef={ref}
                    />
                )}
                {selectedTab === "history" && (
                   <ItemCard 
                    active={active}
                    openModal={openModal}
                    items={history}
                    itemLoading={itemLoading}
                    selectedTab={selectedTab}
                    listRef={listRef}
                    hasMore={hasMore}
                    innerRef={ref}
                />
                )}
            </div>
        </div>
    );
}