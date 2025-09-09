import React, { useState, useEffect, useRef } from 'react';

const DatePicker = ({ value, onSelect, startDate, showToggle, isCurrent, onToggleCurrent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const wrapperRef = useRef(null);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const startYear = startDate ? parseInt(startDate.split(' ')[1], 10) : null;
    const startMonthName = startDate ? startDate.split(' ')[0] : null;
    const startMonthIndex = startMonthName ? months.findIndex(m => m.startsWith(startMonthName)) : -1;

    const handleSelect = (month) => {
        onSelect(`${month} ${year}`);
        setIsOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 text-left focus:ring-blue-500 focus:border-blue-500">
                {value || <span className="text-gray-500">Select date</span>}
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-64 bg-[#1e293b] border border-gray-700 rounded-lg p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            type="button"
                            onClick={() => setYear(year - 1)}
                            className={`text-white font-bold text-lg px-2 ${startYear && year <= startYear ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={startYear && year <= startYear}
                        >
                            ‹
                        </button>
                        <span className="font-semibold">{year}</span>
                        <button
                            type="button"
                            onClick={() => setYear(year + 1)}
                            className={`text-white font-bold text-lg px-2 ${year >= currentYear ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={year >= currentYear}
                        >
                            ›
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {months.map((month, index) => {
                            const isFutureMonth = year === currentYear && index > currentMonth;
                            const isBeforeStartDate = startYear !== null && (year < startYear || (year === startYear && index < startMonthIndex));
                            const isDisabled = isFutureMonth || isBeforeStartDate;
                            return (
                                <button
                                    key={month}
                                    type="button"
                                    onClick={() => handleSelect(month.substring(0, 3))}
                                    className={`p-2 rounded-md text-sm ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                                    disabled={isDisabled}
                                >
                                    {month}
                                </button>
                            );
                        })}
                    </div>
                    {showToggle && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                            <span className="text-sm">Currently work here</span>
                            <button
                                type="button"
                                onClick={onToggleCurrent}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isCurrent ? 'bg-blue-600' : 'bg-gray-600'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isCurrent ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DatePicker;
