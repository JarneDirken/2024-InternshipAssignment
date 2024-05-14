'use client';
import Loading from "@/components/states/Loading";
import useAuth from "@/hooks/useAuth";
import Unauthorized from "../../(error)/unauthorized/page";
import { useEffect, useMemo, useState } from "react";
import { ItemRequest } from "@/models/ItemRequest";
import { Gauge, LineChart, PieChart, pieArcLabelClasses } from '@mui/x-charts';
import Filters from "@/components/general/Filter";
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import { Filter } from "@/models/Filter";
import useUser from "@/hooks/useUser";

export default function Analytics() {
    const { isAuthorized, loading } = useAuth(['Admin']);
    const { userId, token } = useUser();
    const [items, setItems] = useState<ItemRequest[]>([]);
    const [monthlyCounts, setMonthlyCounts] = useState(Array(12).fill(0));
    const [totalRequestsMade, setTotalRequestsMade] = useState(0);
    const [totalRequestsCancelled, setTotalRequestsCancelled] = useState(0);
    const [totalRequestsFinished, setTotalRequestsFinshed] = useState(0);
    const [active, setActive] = useState(false);
    const [year, setYear] = useState(() => new Date().getFullYear().toString());;
    const filters: Filter[] = [
        { label: 'Year', state: [year, setYear], inputType: 'text', optionsKey: 'startBorrowDate' },
    ];

    useEffect(() => {
        if (userId) {
            getAllBorrows();
        }
    }, [userId, year]);

    const handleFilterChange = (filterType: string, value: string) => {
        switch (filterType) {
            case 'year':
                setYear(value);
                break;
            default:
                break;
        }
    };

    function calculateMonthlyBorrows(items: ItemRequest[]) {
        const monthCounts = Array(12).fill(0);
        items.forEach(item => {
            const month = new Date(item.borrowDate!).getMonth();
            if (!isNaN(month)) {
                monthCounts[month]++;
            }
        });
        if (monthCounts.some(isNaN)) {
            console.error('Invalid month count detected:', monthCounts);
        } else {
            setMonthlyCounts(monthCounts);
        }
    };

    const xLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    async function getAllBorrows() {
        const params: Record<string, string> = {
            year: year,
        };
    
        // Only add userId to the query if it is not null
        if (userId !== null) {
            params.userId = userId;
        };

        if (token !== null) {
            params.token = token;
        };
    
        const queryString = new URLSearchParams(params).toString();
    
        try {
            const response = await fetch(`/api/admin/analytics?${queryString}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const fetchedItems = data.itemRequests || [];
            const totalMadeRequests = data.totalMade;
            const totalCancelledRequests = data.totalCancelled;
            const totalFinishedRequests = data.totalFinished;

            setItems(fetchedItems);
            calculateMonthlyBorrows(fetchedItems);
            setTotalRequestsMade(totalMadeRequests);
            setTotalRequestsCancelled(totalCancelledRequests);
            setTotalRequestsFinshed(totalFinishedRequests);
        } catch (error) {
            console.error("Failed to fetch items:", error);
            setItems([]);
        }
    };

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div>
            <div className="bg-white mb-4 rounded-xl">
                <Filters
                    title="Analytics"
                    icon={<PollOutlinedIcon fontSize="large" />}
                    onFilterChange={handleFilterChange}
                    items={items}
                    filters={filters}
                    active={active}
                    setActive={setActive}
                    isSort={false}
                />
            </div>
            <div className="bg-white rounded-xl overflow-x-scroll" style={{height: "65vh"}}>
                <div className="flex flex-wrap overflow-x-scroll p-4">
                    <div className="w-full flex flex-wrap justify-between items-center">
                        <LineChart
                            width={500}
                            height={300}
                            series={[
                                { data: monthlyCounts },
                            ]}
                            xAxis={[{ scaleType: 'point', data: xLabels }]}
                            yAxis={[
                                {
                                min: 0,
                                label: 'Amount requested',
                                scaleType: 'linear',
                                },
                            ]}
                        />
                        <PieChart
                            series={[
                                {
                                arcLabel: (item) => `${item.value}`,
                                data: [
                                    { id: 0, value: totalRequestsMade, label: 'Requests made' },
                                    { id: 1, value: totalRequestsCancelled, label: 'Requests cancelled' },
                                    { id: 2, value: totalRequestsFinished, label: 'Requests completed' },
                                ],
                                },
                            ]}
                            width={400}
                            height={200}
                            margin={{ right: 200 }}
                            sx={{
                                [`& .${pieArcLabelClasses.root}`]: {
                                fill: 'white',
                                fontWeight: 'bold',
                                },
                            }}
                        />
                    </div>
                    <div className="w-full flex flex-col md:flex-row items-center">
                        <div className="w-full flex flex-col justify-center items-center">
                            <div>Total requests Made</div>
                            <Gauge
                                value={totalRequestsMade}
                                startAngle={0}
                                endAngle={360}
                                valueMax={totalRequestsMade}
                                innerRadius="80%"
                                outerRadius="100%"
                                height={200}
                            />
                        </div>
                        <div className="w-full flex flex-col justify-center items-center">
                            <div>Amount of requests cancelled</div>
                            <Gauge
                                value={totalRequestsCancelled}
                                valueMax={totalRequestsMade}
                                startAngle={0}
                                endAngle={360}
                                innerRadius="80%"
                                outerRadius="100%"
                                height={200}
                            />
                        </div>
                        <div className="w-full flex flex-col justify-center items-center">
                            <div>Amount of requests finished</div>
                            <Gauge
                                value={totalRequestsFinished}
                                valueMax={totalRequestsMade}
                                startAngle={0}
                                endAngle={360}
                                innerRadius="80%"
                                outerRadius="100%"
                                height={200}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}