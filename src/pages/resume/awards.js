import React, { useState, useCallback, useEffect, useRef } from 'react';
import EditorLayout from '../../components/resume/EditorLayout';

const FormInput = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-bold text-gray-400 uppercase mb-2">
            {label}
        </label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500"
        />
    </div>
);

const FormTextarea = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-bold text-gray-400 uppercase mb-2">
            {label}
        </label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows="4"
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500"
        ></textarea>
    </div>
);

const DatePicker = ({ value, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const wrapperRef = useRef(null);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

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
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-left focus:ring-cyan-500 focus:border-cyan-500">
                {value || <span className="text-gray-500">Select date</span>}
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => setYear(year - 1)} className="text-white font-bold text-lg px-2">‹</button>
                        <span className="font-semibold">{year}</span>
                        <button type="button" onClick={() => setYear(year + 1)} className={`text-white font-bold text-lg px-2 ${year >= currentYear ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={year >= currentYear}>›</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {months.map((month, index) => {
                            const isFutureMonth = year === currentYear && index > currentMonth;
                            return (
                                <button key={month} type="button" onClick={() => handleSelect(month.substring(0, 3))} className={`p-2 rounded-md text-sm ${isFutureMonth ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`} disabled={isFutureMonth}>
                                    {month}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
const AwardItem = ({ award, index, onUpdate, onDelete, onSave }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onUpdate(award.id, { ...award, [name]: value });
    };
    const handleDateSelect = (date) => {
        onUpdate(award.id, { ...award, date: date });
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                    {award.name || `Award or Honor ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(award.id)} className="text-gray-500 hover:text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(award.id); }}>
                <FormInput
                    label="What was the award name? *"
                    name="name"
                    value={award.name}
                    onChange={handleInputChange}
                    placeholder="Award or Honor Name"
                />
                <FormInput
                    label={`Which organization gave you the ${award.name || 'award or honor'}? `}
                    name="organization"
                    value={award.organization}
                    onChange={handleInputChange}
                    placeholder="Institution Name"
                />
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">When did you get the award?</label>
                    <DatePicker
                        value={award.date}
                        onSelect={handleDateSelect}
                    />
                </div>
                <FormTextarea
                    label="How is the award relevant?"
                    name="relevance"
                    value={award.relevance}
                    onChange={handleInputChange}
                    placeholder="Additional information about the Award/Honor."
                />

                <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg">
                        SAVE TO AWARDS & HONORS LIST
                    </button>
                </div>
            </form>
        </div>
    );
};


const Awards = () => {
    const createNewAward = () => ({
        id: Date.now(),
        name: '',
        organization: '',
        date: '',
        relevance: '',
    });

    const [awards, setAwards] = useState([createNewAward()]);

    const addAward = () => {
        setAwards([...awards, createNewAward()]);
    };

    const updateAward = useCallback((id, updatedData) => {
        setAwards(currentAwards => currentAwards.map(award => (award.id === id ? updatedData : award)));
    }, []);

    const deleteAward = (id) => {
        if (awards.length > 1) {
            setAwards(awards.filter(award => award.id !== id));
        }
    };

    const saveAward = (id) => {
        const awardToSave = awards.find(award => award.id === id);
        console.log("Saving Award:", awardToSave);
        alert(`${awardToSave.name || 'Award'} saved!`);
    };

    return (
        <EditorLayout>
            {awards.map((award, index) => (
                <AwardItem
                    key={award.id}
                    award={award}
                    index={index}
                    onUpdate={updateAward}
                    onDelete={deleteAward}
                    onSave={saveAward}
                />
            ))}
            <div className="flex justify-center">
                <button onClick={addAward} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
                    ADD ANOTHER AWARD OR HONOR
                </button>
            </div>
        </EditorLayout>
    );
};

export default Awards;