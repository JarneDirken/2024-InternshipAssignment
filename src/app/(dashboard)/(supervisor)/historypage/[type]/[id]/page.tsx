'use client';
import Unauthorized from "@/app/(dashboard)/(error)/unauthorized/page";
import Filters from "@/components/general/Filter";
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import { Filter } from "@/models/Filter";
import { useEffect, useState } from "react";
import ContentPasteOutlinedIcon from '@mui/icons-material/ContentPasteOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import { Item } from "@/models/Item";
import { User } from "@/models/User";
import ItemCard from "@/components/(supervisor)/historypage/ItemCard";
import { ItemRequest } from "@/models/ItemRequest";
import { SortOptions } from "@/models/SortOptions";
import Button from "@/components/states/Button";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import * as XLSX from 'xlsx';
import useUser from "@/hooks/useUser";

export default function HistoryPage({ params } : {params: {type:string, id: string}}) {
    const type = params.type;
    const id = params.id;
    const { isAuthorized, loading } = useAuth(['Supervisor', 'Admin']);
    const [active, setActive] = useState(true); // this is to toggle from list view to card view
    const { userId, token } = useUser();
    const [history, setHistory] = useState<User[] | Item[]>([]);
    const [title, setTitle] = useState(""); // Manage title as a state
    const [dataFound, setDataFound] = useState(true); // Initially true, set to false if no data
    const [itemLoading, setItemLoading] = useState(true); // item loading
    // filters
    const [nameFilter, setNameFilter] = useState(''); // name filter
    const [borrowDateFilter, setBorrowDateFilter] = useState(''); // filter
    const [nameUserFilter, setNameUserFilter] = useState(''); // name filter
    const [borrowDateUserFilter, setBorrowDateUserFilter] = useState(''); // filter
    const [filteredItemsUser, setFilteredItemsUser] = useState<ItemRequest[]>([]);
    const [filteredItemsItem, setFilteredItemsItem] = useState<ItemRequest[]>([]);
    const icon = type === 'user' ? <PeopleAltOutlinedIcon fontSize="large" /> : <ContentPasteOutlinedIcon fontSize="large" />;
    const sortOptionsUser: SortOptions[] = [
        { label: 'Name', optionsKey: 'item.name' },
        { label: 'Return Date', optionsKey: 'returnDate' },
        { label: 'Location', optionsKey: 'item.location.name' }
    ];
    const sortOptionsItem: SortOptions[] = [
        { label: 'User name', optionsKey: 'borrower.firstName' },
        { label: 'Borrow Date', optionsKey: 'borrowDate' },
    ];
    const itemFilters: Filter[] = [
        { label: 'Name', state: [nameFilter, setNameFilter], inputType: 'text', optionsKey: 'borrower.firstName' },
        { label: 'Borrow Date', state: [borrowDateFilter, setBorrowDateFilter], inputType: 'dateRange' },
    ];
    const userFilters: Filter[] = [
        { label: 'Name', state: [nameUserFilter, setNameUserFilter], inputType: 'text', optionsKey: 'item.name' },
        { label: 'Borrow Date', state: [borrowDateUserFilter, setBorrowDateUserFilter], inputType: 'dateRange' },
    ];

    useEffect(() => {
        if ((type === "user") && userId && token) {
            getHistory("user");
        }
    }, [userId, type, id, nameUserFilter, borrowDateUserFilter, token]);

    useEffect(() => {
        if ((type === "item") && userId && token) {
            getHistory("item");
        }
    }, [userId, type, id, nameFilter, borrowDateFilter, token]);

    useEffect(() => {
        if (type === "user" || type === "item") {
            if (history.length > 0) {
                if (type === 'user') {
                    const user = history[0] as User;
                    setTitle(toTitleCase(`${user.firstName} ${user.lastName}`));
                    // Assuming that `ItemRequestsBorrower` is a property that holds `ItemRequest[]`
                    const userRelatedItems = history.flatMap((entity: User | Item) =>
                        'ItemRequestsBorrower' in entity ? (entity as User).ItemRequestsBorrower || [] : []
                    );
                    setFilteredItemsItem(userRelatedItems);
                } else if (type === 'item') {
                    const item = history[0] as Item;
                    setTitle(toTitleCase(item.name));
                    // Assuming that `ItemRequests` is a property that holds `Users[]`
                    const itemRelatedUsers = history.flatMap((entity: User | Item) =>
                        'ItemRequests' in entity ? (entity as Item).ItemRequests || [] : []
                    );
                    setFilteredItemsUser(itemRelatedUsers);
                }
            }
        }
    }, [history, type]);
    
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

    interface ExportDataUser {
        [key: string]: number | string | undefined;
        RequestID: number;
        ItemName: string;
        Borrower: string;
        Approver: string;
        Location: string;
        RequestDate: string;
        StartBorrowDate: string;
        EndBorrowDate: string;
        DecisionDate: string;
        BorrowDate: string;
        ReturnDate: string;
        File: string | undefined;
        Status: string;
        Urgency: string;
        Description: string;
    };

    const exportUserHistoryToExcel = (filename: string, worksheetName: string) => {
        if (!filteredItemsItem || !filteredItemsItem.length) return;
    
        const dataToExport: ExportDataUser[] = filteredItemsItem.map(item => ({
            RequestID: item.id,
            ItemName: item.item.name, // Item name
            Borrower: `${item.borrower?.firstName} ${item.borrower?.lastName}`,
            Approver: item.approver ? `${item.approver.firstName} ${item.approver.lastName}` : "Approver not set",
            Location: item.item.location.name,
            RequestDate: formatDate(item.requestDate),
            StartBorrowDate: formatDate(item.startBorrowDate),
            EndBorrowDate: formatDate(item.endBorrowDate),
            DecisionDate: item.decisionDate ? formatDate(item.decisionDate) : "",
            BorrowDate: item.borrowDate ? formatDate(item.borrowDate) : "",
            ReturnDate: item.returnDate ? formatDate(item.returnDate) : "",
            Status: item.requestStatus.name,
            Description: item.approveMessage || 'No message', // Handle null values
            Urgency: item.isUrgent ? 'Urgent' : 'Normal', // Example of converting boolean to string
            File: item.file,
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

    interface ExportDataItem {
        [key: string]: number | string | undefined;
        RequestID: number;
        Borrower: string;
        StudentCode: string;
        Telephone: string;
        Email: string;
        Picture?: string;
        Role: string;
        CreatedAt: string;
    };

    interface ExportReparationData {
        [key: string]: number | string | undefined;
        ItemID: number;
        ReparationID: number;
        RepairDate: string;
        ReturnDate?: string;
        Notes?: string;
        Status: string;
    };
    
    const exportItemHistoryToExcel = (filename: string, itemsWorksheetName: string, reparationsWorksheetName: string) => {
        if (!filteredItemsUser || !filteredItemsUser.length) return;
    
        const dataToExport: ExportDataItem[] = filteredItemsUser.map(item => ({
            RequestID: item.id,
            Borrower: `${item.borrower.firstName} ${item.borrower.lastName}`,
            StudentCode: item.borrower.studentCode || "No student code",
            Telephone: item.borrower.tel,
            Email: item.borrower.email,
            Picture: item.borrower.profilePic || "No picture available",
            Role: item.borrower.role.name,
            CreatedAt: formatDate(item.borrower.createdAt),
        }));
    
        // Create a workbook
        const workbook = XLSX.utils.book_new();
    
        // Create and append the item history worksheet
        const itemsWorksheet = XLSX.utils.json_to_sheet(dataToExport);
        // Adjust column widths for the item history worksheet
        itemsWorksheet['!cols'] = Object.keys(dataToExport[0]).map(key => ({
            wch: Math.max(
                ...dataToExport.map(item => item[key] ? item[key]!.toString().length : 0),
                key.length
            )
        }));
        XLSX.utils.book_append_sheet(workbook, itemsWorksheet, itemsWorksheetName);
    
        // Collect reparation data if available
        const reparationData: ExportReparationData[] = [];
        filteredItemsUser.forEach(item => {
            if (item.item.Reparations) {
                item.item.Reparations.forEach(reparation => {
                    let status = '';  // Initialize status variable
                    if (reparation.returnDate) {
                        status = 'Repaired';  // Has a return date means it's repaired
                    } else if (item.item.itemStatusId === 6) {
                        status = 'Broken';  // Item status ID 6 means the item is broken
                    } else {
                        status = 'In repair';  // No return date and not broken means it's still in repair
                    }

                    reparationData.push({
                        ItemID: item.id,
                        ReparationID: reparation.id,
                        RepairDate: formatDate(reparation.repairDate),
                        ReturnDate: reparation.returnDate ? formatDate(reparation.returnDate) : undefined,
                        Notes: reparation.notes,
                        Status: status,  // Use the determined status
                    });
                });
            }
        });
    
        // Check and append the reparations worksheet if data exists
        if (reparationData.length > 0) {
            const reparationsWorksheet = XLSX.utils.json_to_sheet(reparationData);
            // Adjust column widths for the reparations worksheet
            reparationsWorksheet['!cols'] = Object.keys(reparationData[0]).map(key => ({
                wch: Math.max(
                    ...reparationData.map(data => data[key] ? data[key]!.toString().length : 0),
                    key.length
                )
            }));
            XLSX.utils.book_append_sheet(workbook, reparationsWorksheet, reparationsWorksheetName);
        }
    
        // Write the workbook to a file
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };    
    
    const handleFilterChange = (filterType: string, value: string) => {
        if (type === 'user') {
            switch (filterType) {
                case 'Name':
                    setNameUserFilter(value);
                    break;
                case 'Borrow date':
                    setBorrowDateUserFilter(value);
                    break;
                default:
                    break;
            }
        } else if (type === 'item') {
            switch (filterType) {
                case 'Name':
                    setNameFilter(value);
                    break;
                case 'Borrow date':
                    setBorrowDateFilter(value);
                    break;
                default:
                    break;
            }
        }
    };

    const handleSortChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
        if(type === "user") {getHistory("user", sortBy, sortDirection);}
        if(type === "item") {getHistory("item", sortBy, sortDirection);}
    };

    function toTitleCase(str: string) {
        return str.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    type DateFilterResult = {
        borrowDateUser?: string;
        returnDateUser?: string;
        borrowDateItem?: string;
        returnDateItem?: string;
    };
    
    const parseDateFilter = (dateFilter: string, type: string): DateFilterResult => {
        const dates = dateFilter.split(" - ");
        const startDate = dates[0];
        const endDate = dates.length > 1 ? dates[1] : undefined; // Do not default to today's date
    
        if (type === "user") {
            return { borrowDateUser: startDate, returnDateUser: endDate };
        } else if (type === "item") {
            return { borrowDateItem: startDate, returnDateItem: endDate };
        }
        return {}; // Always return an object even if type does not match
    };

    async function getHistory(type: string, sortBy = 'requestDate', sortDirection = 'desc') {
        setItemLoading(true);
        const { borrowDateUser, returnDateUser } = parseDateFilter(borrowDateUserFilter, "user");
        const { borrowDateItem, returnDateItem } = parseDateFilter(borrowDateFilter, "item");
        let params: Record<string, string> = {}

        if (type === "user") {
            params.nameUser = nameUserFilter;
            params.sortBy = sortBy || 'requestDate';
            params.sortDirection = sortDirection || 'desc';
            // Include dates in the query only if they are defined
            if (borrowDateUser) {
                params.borrowDateUser = borrowDateUser;
                if (returnDateUser) params.returnDateUser = returnDateUser;
            }
        }
        else if (type === "item") {
            params.nameItem = nameFilter;
            params.sortBy = sortBy || 'borrowDate';
            params.sortDirection = sortDirection || 'desc';
            if (borrowDateItem) {
                params.borrowDateItem = borrowDateItem;
                if (returnDateItem) params.returnDateItem = returnDateItem;
            }
        }

        params.userId = userId || "";

        if (token !== null) {
            params.token = token;
        };

        const queryString = new URLSearchParams(params).toString();

        try {
            const response = await fetch(`/api/supervisor/historypage/${type}/${id}?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            
            if (Array.isArray(data) && data.length === 0 || !Array.isArray(data) && !Object.keys(data).length) {
                setDataFound(false);
            } else {
                setHistory(Array.isArray(data) ? data : [data]);
            }
        } catch (error) {
            console.error("Failed to fetch items:", error);
            setDataFound(false);
        } finally {
            setItemLoading(false);
        }
    };
    
    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    if (type !== "user" && type !== "item") { return; }

    if (!dataFound) {
        return <div className="bg-white p-4 rounded-xl shadow-md text-center text-lg">
            {`No ${type} found with ID ${id}`}
        </div>;
    }

    return (
        <div>
            <div className="bg-white mb-4 rounded-xl">
            <Filters
                title={`History of ${title}`}
                icon={icon}
                active={active}
                setActive={setActive}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                items={type === "user" ? filteredItemsItem : filteredItemsUser}
                filters={type === 'user' ? userFilters : itemFilters}
                sortOptions={type === 'user' ? sortOptionsUser : sortOptionsItem}
                isCardView={true}
            />
            </div>
            <div className="rounded-xl">
                <div className="flex border-b border-b-gray-300 bg-white rounded-tl-xl rounded-tr-xl z-0 overflow-x-scroll" id="selectTabs">
                    <div className="relative">
                        <div
                            className='w-48 flex justify-center py-3 uppercase border-b-4 border-b-custom-primary text-custom-primary font-semibold'
                        >
                            {type==="user" ? (<span>Requested borrows</span>) : (<span>History</span>)}
                        </div>
                    </div>
                    <div className="flex items-center ml-2">
                        <Button 
                            icon={<InsertDriveFileOutlinedIcon />} 
                            textColor="custom-dark-blue"
                            borderColor="custom-dark-blue"
                            fillColor="blue-100"
                            paddingX="px-2.5"
                            paddingY="py-0.5"
                            textClassName="font-semibold"
                            text="Export EXCEL"
                            onClick={type === "user" ? () => exportUserHistoryToExcel(`${type}-History`, 'HistoryData') : () => exportItemHistoryToExcel(`${type}-History`, 'HistoryData', "ReparationData")}
                        />
                    </div>
                </div>
                <div>
                    <ItemCard
                        active={active}
                        items={type === "user" ? filteredItemsItem : filteredItemsUser}
                        itemLoading={itemLoading}
                        type={type}
                    />
                </div>
            </div>
        </div>
    );
}