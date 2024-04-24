'use client';
import { useEffect, useState } from "react";

export default function HistoryPage({ params } : {params: {type:string, id: string}}) {
    const type = params.type;
    const id = params.id;

    // Placeholder for fetched data
    const [history, setHistory] = useState(null);

    useEffect(() => {
        getHistory();
    },[])

    useEffect(() => {
        console.log(history);
    },[history])

    async function getHistory() {
        try {
            const response = await fetch(`/api/supervisor/historypage/${type}/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();

            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch items:", error);
        }
    };

    return (
        <div>
            <h1>History for {type} id of {id}</h1>
        </div>
    );
}