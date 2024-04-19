import { ParameterType } from "@/models/ParameterType";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";

interface DatePickerProps {
    borrowDate: Date | null;
    returnDate: Date | null;
    setBorrowDate: (date: Date) => void;
    setReturnDate: (date: Date) => void;
    onDateSelection: (type: 'borrow' | 'return', date: Date) => void;
    setErrorMessage: (message: string | null) => void;
    editingDateType: 'borrow' | 'return' | null;  // Indicates which date is being edited
    setEditingDateType: (type: 'borrow' | 'return' | null) => void;
}

export default function DatePicker({ borrowDate, returnDate, setBorrowDate, setReturnDate, onDateSelection, setErrorMessage, editingDateType, setEditingDateType }: DatePickerProps) {
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth());
    const currentYear = currentDate.getFullYear(); // Get the current year as a number
    const currentHour24 = currentDate.getHours(); // Get the hour in 24-hour format
    const currentHour = (currentHour24 % 12) || 12; // Converts 24-hour format to 12-hour format, making sure 0 becomes 12.
    const amPm = currentHour24 >= 12 ? 'PM' : 'AM';
    const currentMinute = currentDate.getMinutes();
    const currentDay = String(currentDate.getDate());
    const today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear.toString()); // Set initial state as string
    const [hour, setHour] = useState(currentHour.toString()); // State for hour in 12-hour format
    const [minute, setMinute] = useState(currentMinute.toString().padStart(2, '0')); // Ensuring minute is always two digits
    const [period, setPeriod] = useState(amPm);
    const [selectedDay, setSelectedDay] = useState(currentDay);
    const [isSettingBorrowDate, setIsSettingBorrowDate] = useState(true);
    const [edit, setEdit] = useState(false);
    const setDatePickerState = (date: Date, isBorrowDate: boolean) => {
        const hour24 = date.getHours();
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour = (hour24 % 12) || 12;
        const minute = date.getMinutes().toString().padStart(2, '0');
        const month = date.getMonth().toString();
        const day = date.getDate().toString();
        const year = date.getFullYear().toString();
        setMonth(month);
        setYear(year);
        setHour(hour.toString());
        setMinute(minute);
        setPeriod(period);
        setSelectedDay(day);
        setIsSettingBorrowDate(isBorrowDate);
    };

    const [startMorningTime, setStartMorningTime] = useState<Dayjs | null>(null);
    const [endMorningTime, setEndMorningTime] = useState<Dayjs | null>(null);
    const [startEveningTime, setStartEveningTime] = useState<Dayjs | null>(null);
    const [endEveningTime, setEndEveningTime] = useState<Dayjs | null>(null);
    const [startMorningTimeString, setStartMorningTimeString] = useState('');
    const [endMorningTimeString, setEndMorningTimeString] = useState('');
    const [startEveningTimeString, setStartEveningTimeString] = useState('');
    const [endEveningTimeString, setEndEveningTimeString] = useState('');
    type DayjsSetterType = (value: Dayjs | null) => void;
    type StringSetterType = (value: string) => void;
    
    useEffect(() => {
        setEdit(true);
        if (editingDateType === 'borrow' && borrowDate) {
            // Set DatePicker to reflect the borrow date
            setDatePickerState(borrowDate, true);
        } else if (editingDateType === 'return' && returnDate) {
            // Set DatePicker to reflect the return date
            setDatePickerState(returnDate, false);
        }
    }, [editingDateType]);

    useEffect(() => {
        getParameters();
    }, []);

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':').map(Number);  // Convert strings to numbers
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;  // Convert to 12-hour format
        return minute === 0 ? `${hour12}${period}` : `${hour12}:${minute}${period}`;
    };

    const handleDateFormat = () => {
        if (startMorningTimeString && endMorningTimeString && startEveningTimeString && endEveningTimeString) {
            const formattedMorningStart = formatTime(startMorningTimeString);
            const formattedMorningEnd = formatTime(endMorningTimeString);
            const formattedEveningStart = formatTime(startEveningTimeString);
            const formattedEveningEnd = formatTime(endEveningTimeString);
    
            return (
                <span>{`${formattedMorningStart}-${formattedMorningEnd} & ${formattedEveningStart}-${formattedEveningEnd}`}</span>
            );
        } else {
            return <span>Loading...</span>;
        }
    };    

    const handleApplyDate = () => {
        let hourAdjusted = period === 'PM' ? (parseInt(hour) % 12 + 12) : parseInt(hour) % 12;
        if (period === 'AM' && parseInt(hour) === 12) {
            hourAdjusted = 0; // Adjust for midnight being 0 in 24-hour format
        }
    
        const fullDate = new Date(parseInt(year), parseInt(month), parseInt(selectedDay), hourAdjusted, parseInt(minute));
    
        if (editingDateType === 'borrow') {
            // Editing the borrow date
            if (returnDate && fullDate >= returnDate) {
                setErrorMessage("Borrow date must be before the return date.");
                return;
            }
            setBorrowDate(fullDate);
            onDateSelection('borrow', fullDate);
        } else if (editingDateType === 'return') {
            // Editing the return date
            if (borrowDate && fullDate <= borrowDate) {
                setErrorMessage("Return date must be after the borrow date.");
                return;
            }
            setReturnDate(fullDate);
            onDateSelection('return', fullDate);
        } else {
            // This is the case where no editing type is set, should only happen when setting dates for the first time
            if (isSettingBorrowDate) {
                setBorrowDate(fullDate);
                setIsSettingBorrowDate(false);
                onDateSelection('borrow', fullDate);
            } else {
                if (borrowDate && fullDate <= borrowDate) {
                    setErrorMessage("Return date must be after the borrow date.");
                } else {
                    setReturnDate(fullDate);
                    setIsSettingBorrowDate(true); // Reset for next use
                    onDateSelection('return', fullDate);
                }
            }
        }
    
        // Clear any existing error messages if all goes well
        setEdit(false);
        setEditingDateType(null);
        setErrorMessage(null);
    };

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

    const handleHourChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setHour(event.target.value);
    };

    const handleMinuteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setMinute(event.target.value);
    };

    const handlePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setPeriod(event.target.value);
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
    
    const firstDayOfMonth = new Date(parseInt(year), parseInt(month), 1).getDay();
    const daysInMonth = getDaysInMonth(parseInt(year), parseInt(month));
    const years = Array.from({ length: 4 }, (_, index) => currentYear + index);

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="m-px w-10 block text-center text-sm text-gray-500">&nbsp;</div>);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateBeingRendered = new Date(parseInt(year), parseInt(month), d);
        const isBeforeToday = dateBeingRendered < today;
        days.push(
            <button
                key={d}
                type="button"
                className={`m-px w-10 p-2 block text-center text-sm rounded-full ${d === parseInt(selectedDay) ? "bg-custom-primary text-white" : isBeforeToday ? "text-gray-400" : "text-gray-800 hover:text-custom-primary"}`}
                onClick={() => isBeforeToday ? null : setSelectedDay(String(d))}
                disabled={isBeforeToday}
            >
                {d}
            </button>
        );
    }
    
    // Render weekdays header
    const weekDaysHeader = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
        <span key={index} className="m-px w-10 block text-center text-sm text-gray-500">{day}</span>
    ));

    async function getParameters() {
        try {
            const response = await fetch(`/api/admin/parameter`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: ParameterType[] = await response.json();
            
            // Define setTime with explicit types for parameters
            const setTime = (paramName: string, dayjsSetter: DayjsSetterType, stringSetter: React.Dispatch<React.SetStateAction<string>>) => {
                const param = data.find(p => p.name === paramName);
                if (param) {
                    const [hour, minute] = param.value.split(':');
                    const dayjsTime = dayjs().hour(parseInt(hour)).minute(parseInt(minute)).second(0);
                    dayjsSetter(dayjsTime);
                    stringSetter(param.value);
                }
            };
            setTime('morningStartTime', setStartMorningTime, setStartMorningTimeString);
            setTime('morningEndTime', setEndMorningTime, setEndMorningTimeString);
            setTime('eveningStartTime', setStartEveningTime, setStartEveningTimeString);
            setTime('eveningEndTime', setEndEveningTime, setEndEveningTimeString);
        } catch (error) {
            console.error("Failed to fetch parameters:", error);
        }
    };
    
    return (
        <div>
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
                    <div className="mt-3 flex justify-center items-center gap-x-2">
                        <div className="inline-flex border border-gray-200 rounded-lg p-1">
                            <div className="relative">
                                <select value={hour} onChange={handleHourChange} className="focus:outline-none">
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i + 1}>{i + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <span className="text-gray-800">:</span>
                            <div className="relative">
                                <select value={minute} onChange={handleMinuteChange} className="focus:outline-none">
                                    {Array.from({ length: 60 }, (_, i) => (
                                        <option key={i} value={i < 10 ? `0${i}` : i.toString()}>{i < 10 ? `0${i}` : i}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <select value={period} onChange={handlePeriodChange} className="focus:outline-none">
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`flex justify-between items-center gap-x-2 p-3 ${((!returnDate || !borrowDate) || editingDateType) ? 'border-t border-gray-500' : 'border-none'}`}>
                    <div className="text-xs w-1/2 flex flex-col">
                        <span>Normal borrow times: </span>
                        {handleDateFormat()}
                    </div>
                    <div>
                        {((!returnDate || !borrowDate) || editingDateType) && (
                            <button 
                                type="button" 
                                className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-custom-primary text-white disabled:opacity-50 disabled:pointer-events-none"
                                onClick={handleApplyDate}
                            >
                                {editingDateType ? `Edit ${editingDateType} date` : (isSettingBorrowDate ? 'Apply borrow date' : 'Apply return date')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}