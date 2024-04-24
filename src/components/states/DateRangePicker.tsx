import React, { useEffect, useRef, useState } from "react";

interface DatePickerProps {
    borrowDate: Date | null;
    returnDate: Date | null;
    setBorrowDate: (date: Date | null) => void;
    setReturnDate: (date: Date | null) => void;
    setErrorMessage: (message: string | null) => void;
    handleDayClick: () => void;
}

export default function DateRangePicker({ setBorrowDate, setReturnDate, setErrorMessage, handleDayClick }: DatePickerProps) {
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth());
    const currentYear = currentDate.getFullYear(); // Get the current year as a number
    const currentDay = String(currentDate.getDate());
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear.toString()); // Set initial state as string
    const [selectedDay, setSelectedDay] = useState(currentDay);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

    const handleEndDateSelection = (day: number) => {
        const selectedDate = new Date(parseInt(year), parseInt(month), day);
    
        // Check if this is the first date being selected or if resetting the start date
        if (!selectedStartDate || (selectedEndDate && selectedStartDate)) {
            setSelectedStartDate(selectedDate);  // Set the new start date
            setSelectedEndDate(null);            // Reset the end date
            setBorrowDate(selectedDate);         // Update borrow date in parent state
            setReturnDate(null);                 // Clear return date in parent state
            setErrorMessage(null);               // Clear any error messages
        } 
        else if (selectedStartDate && selectedDate < selectedStartDate) {
            // If selected date is before the start date, set an error
            setErrorMessage("Return date must be after the borrow date.");
        } 
        else {
            setSelectedEndDate(selectedDate);   // Set the new end date
            setReturnDate(selectedDate);        // Update return date in parent state
            setErrorMessage(null);              // Clear any error messages
            handleDayClick();                   // Close the picker
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                handleDayClick();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleDayClick]);

    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = event.target.value;
        setMonth(newMonth);
        updateSelectedDay(newMonth, year);
    };
    
    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = event.target.value;
        setYear(newYear);
        updateSelectedDay(month, newYear);
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const updateSelectedDay = (newMonth: string, newYear: string) => {
        const newDate = new Date(parseInt(newYear), parseInt(newMonth), 1);
        if (newDate.setHours(0, 0, 0, 0) > today.setHours(0, 0, 0, 0)) {
            // Future month selected, reset day to 1
            setSelectedDay("1");
        } else if (newDate.getFullYear() === currentDate.getFullYear() && newDate.getMonth() === currentDate.getMonth()) {
            // Current month selected, reset day to today
            setSelectedDay(String(currentDate.getDate()));
        } else {
            // Past month selected, no day should be selectable
            setSelectedDay("");
        }
    };

    const handleNextMonth = () => {
        const newMonth = parseInt(month) + 1;
        if (newMonth > 11) { // Check if the new month exceeds December
            setMonth("0"); // Reset to January
            setYear(String(parseInt(year) + 1)); // Increment the year
            updateSelectedDay("0", String(parseInt(year) + 1)); // Update the selected day accordingly
        } else {
            setMonth(String(newMonth)); // Set to next month
            updateSelectedDay(String(newMonth), year); // Update the selected day accordingly
        }
    };

    const handlePreviousMonth = () => {
        const newMonth = parseInt(month) - 1;
        if (newMonth < 0) { // Check if the month is before January
            setMonth("11"); // Set to December
            setYear(String(parseInt(year) - 1)); // Decrement the year
            updateSelectedDay("11", String(parseInt(year) - 1)); // Update the selected day accordingly
        } else {
            setMonth(String(newMonth)); // Set to previous month
            updateSelectedDay(String(newMonth), year); // Update the selected day accordingly
        }
    };

    const isDateInRange = (day: number) => {
        const date = new Date(parseInt(year), parseInt(month), day);
        return selectedStartDate && selectedEndDate && date > selectedStartDate && date < selectedEndDate;
    };

    const isStartDate = (day: number) => {
        const date = new Date(parseInt(year), parseInt(month), day);
        return selectedStartDate && date.getTime() === selectedStartDate.getTime();
    };

    const isEndDate = (day: number) => {
        const date = new Date(parseInt(year), parseInt(month), day);
        return selectedEndDate && date.getTime() === selectedEndDate.getTime();
    };
    
    const firstDayOfMonth = new Date(parseInt(year), parseInt(month), 1).getDay();
    const daysInMonth = getDaysInMonth(parseInt(year), parseInt(month));
    const years = Array.from({ length: 4 }, (_, index) => currentYear + index);

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="m-px w-10 block text-center text-sm text-gray-500">&nbsp;</div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const isInRange = isDateInRange(d);
        const isStart = isStartDate(d);
        const isEnd = isEndDate(d);
        days.push(
            <button
                key={d}
                type="button"
                className={`m-px w-10 p-2 block text-center text-sm rounded-full ${isStart || isEnd ? "bg-orange-500 text-white" : isInRange ? "bg-orange-200" : "text-gray-800 hover:text-orange-500"}`}
                onClick={() => handleEndDateSelection(d)}
            >
                {d}
            </button>
        );
    }
    
    // Render weekdays header
    const weekDaysHeader = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
        <span key={index} className="m-px w-10 block text-center text-sm text-gray-500">{day}</span>
    ));
    
    return (
        <div ref={datePickerRef}>
            <div id="with-time-tab-preview-datepicker" className="w-80 flex flex-col bg-white border shadow-lg rounded-xl overflow-hidden">
                <div className="p-3">
                    <div className="space-y-0.5">
                        <div className="grid grid-cols-5 items-center gap-x-3 mx-1.5 pb-3">
                            <div className="col-span-1">
                                <button type="button" className="size-8 flex justify-center items-center text-gray-800 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:pointer-events-none" onClick={handlePreviousMonth}>
                                    <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m15 18-6-6 6-6"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="col-span-3 flex justify-center items-center gap-x-1">
                                <div className="relative">
                                    <select 
                                      value={month}
                                      onChange={handleMonthChange}
                                      className="relative flex w-full cursor-pointer text-start font-medium text-gray-800 focus:outline-none"
                                    >
                                        <option value="0">January</option>
                                        <option value="1">February</option>
                                        <option value="2">March</option>
                                        <option value="3">April</option>
                                        <option value="4">May</option>
                                        <option value="5">June</option>
                                        <option value="6">July</option>
                                        <option value="7">August</option>
                                        <option value="8">September</option>
                                        <option value="9">October</option>
                                        <option value="10">November</option>
                                        <option value="11">December</option>
                                    </select>
                                </div>
                                <span className="text-gray-800">/</span>
                                <div className="relative">
                                    <select 
                                      value={year}
                                      onChange={handleYearChange}
                                      className="relative flex w-full cursor-pointer text-start font-medium text-gray-800 focus:outline-none"
                                    >
                                         {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <button type="button" className="size-8 flex justify-center items-center text-gray-800 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:pointer-events-none" onClick={handleNextMonth}>
                                    <svg className="flex-shrink-0 size-4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m9 18 6-6-6-6"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex pb-1.5">{weekDaysHeader}</div>
                        <div className="flex flex-wrap">{days}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}