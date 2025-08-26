import React, { useState, useEffect, useRef } from 'react';
import EditorLayout from '../../components/resume/EditorLayout';

// --- Reusable Helper Components ---

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

// --- Updated DatePicker Component ---

const DatePicker = ({ value, onSelect, showToggle, isCurrent, onToggleCurrent }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const wrapperRef = useRef(null);

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Get current year and month for validation
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
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);


    return (
        <div className="relative w-full" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-left focus:ring-cyan-500 focus:border-cyan-500"
            >
                {value || <span className="text-gray-500">Select date</span>}
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <button type="button" onClick={() => setYear(year - 1)} className="text-white font-bold text-lg px-2">‹</button>
                        <span className="font-semibold">{year}</span>
                        {/* Disable next year button if it's the current year */}
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
                            // Check if the month is in the future
                            const isFutureMonth = year === currentYear && index > currentMonth;
                            return (
                                <button
                                    key={month}
                                    type="button"
                                    onClick={() => handleSelect(month.substring(0,3))}
                                    className={`p-2 rounded-md text-sm ${isFutureMonth ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                                    disabled={isFutureMonth}
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
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isCurrent ? 'bg-cyan-500' : 'bg-gray-600'}`}
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


// --- Component for a single Experience Form ---

const ExperienceItem = ({ experience, index, onUpdate, onDelete, onSave }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onUpdate(experience.id, { ...experience, [name]: value });
    };

    const handleDateSelect = (name, date) => {
        onUpdate(experience.id, { ...experience, [name]: date, isCurrent: name === 'endDate' ? false : experience.isCurrent });
    };

    const toggleIsCurrent = () => {
        onUpdate(experience.id, { ...experience, isCurrent: !experience.isCurrent });
    };
    const handleAccomplishmentChange = (e) => {
        let { value } = e.target;

        // Ensure the text starts with a bullet point if it's not empty
        if (value.length > 0 && !value.startsWith('• ')) {
            value = '• ' + value;
        }
        
        // This simple update is enough, the complex logic is in onKeyDown
        onUpdate(experience.id, { ...experience, bullets: value });
    };

    const handleAccomplishmentKeyDown = (e) => {
        const { selectionStart, value } = e.target;

        if (e.key === 'Enter') {
            e.preventDefault();
            const newValue = `${value.slice(0, selectionStart)}\n• ${value.slice(selectionStart)}`;
            onUpdate(experience.id, { ...experience, bullets: newValue });
        }

        if (e.key === 'Backspace') {
            const lines = value.split('\n');
            const currentLineIndex = value.substring(0, selectionStart).split('\n').length - 1;
            const currentLine = lines[currentLineIndex];

            // Check if the line is empty except for the bullet point (e.g., "• " or "•")
            if (currentLine.trim() === '•' && selectionStart === value.lastIndexOf(currentLine) + currentLine.length) {
                e.preventDefault();
                // Remove the current line entirely
                const newLines = lines.filter((_, index) => index !== currentLineIndex);
                // If it's the very last line and we're deleting it, start fresh
                const newValue = newLines.length === 0 ? '• ' : newLines.join('\n');
                onUpdate(experience.id, { ...experience, bullets: newValue });
            }
        }
    };
    
    useEffect(() => {
        if (experience.isCurrent) {
            onUpdate(experience.id, { ...experience, endDate: 'Present' });
        }
    }, [experience.isCurrent]);

    const companyName = experience.company || 'THE COMPANY';

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl">
                    <span className="font-bold">{experience.role || `Experience ${index + 1}`}</span>
                    <span className="text-base font-normal text-gray-400 ml-2">{`${experience.company}`}</span>
                    <span className="text-base font-normal text-gray-400 ml-2">{`${experience.startDate || 'Start Date'} - ${experience.endDate || 'Current'}`}</span>
                    
                </h2>
                <button onClick={() => onDelete(experience.id)} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(experience.id); }}>
                <FormInput label={`WHAT WAS YOUR ROLE AT ${companyName}? *`} name="role" value={experience.role} onChange={handleInputChange} />
                <FormInput label="FOR WHICH COMPANY DID YOU WORK? *" name="company" value={experience.company} onChange={handleInputChange} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{`HOW LONG WERE YOU WITH ${companyName}?`}</label>
                        <div className="flex items-center gap-4">
                            <DatePicker 
                                value={experience.startDate}
                                onSelect={(date) => handleDateSelect('startDate', date)}
                            />
                            <DatePicker 
                                value={experience.endDate}
                                onSelect={(date) => handleDateSelect('endDate', date)}
                                showToggle={true}
                                isCurrent={experience.isCurrent}
                                onToggleCurrent={toggleIsCurrent}
                            />
                        </div>
                    </div>
                    <FormInput label={`WHERE WAS ${companyName} LOCATED?`} name="location" value={experience.location} onChange={handleInputChange} />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{`WHAT DID YOU DO AT ${companyName}?`}</label>
                    <textarea 
                        name="bullets"
                        value={experience.bullets}
                        onChange={handleAccomplishmentChange}
                        onKeyDown={handleAccomplishmentKeyDown}
                        className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 leading-relaxed"
                        rows="8"
                    />
                </div>
                 <div className="flex justify-end">
                    <button type="submit" className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-6 rounded-lg">
                        SAVE TO EXPERIENCE LIST
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Main Experience Page ---

const Experience = () => {
    const createNewExperience = () => ({
        id: Date.now(),
        role: '',
        company: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        location: '',
        bullets: '• ',
    });

    const [experiences, setExperiences] = useState([createNewExperience()]);

    const addExperience = () => {
        setExperiences([...experiences, createNewExperience()]);
    };

    const updateExperience = (id, updatedData) => {
        setExperiences(experiences.map(exp => exp.id === id ? updatedData : exp));
    };

    const deleteExperience = (id) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    const saveExperience = (id) => {
        const experienceToSave = experiences.find(exp => exp.id === id);
        console.log("Saving experience:", experienceToSave);
        alert(`${experienceToSave.role || 'Experience'} saved!`);
    };
    
    return (
        <EditorLayout>
            {experiences.map((exp, index) => (
                <ExperienceItem 
                    key={exp.id}
                    experience={exp}
                    index={index}
                    onUpdate={updateExperience}
                    onDelete={deleteExperience}
                    onSave={saveExperience}
                />
            ))}
            <div className="flex justify-center">
                 <button onClick={addExperience} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
                    ADD ANOTHER EXPERIENCE
                </button>
            </div>
        </EditorLayout>
    );
};

export default Experience;