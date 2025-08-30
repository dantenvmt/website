import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const DatePicker = ({ value, onSelect, startDate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const wrapperRef = useRef(null);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 text-left focus:ring-cyan-500 focus:border-cyan-500">
                {value || <span className="text-gray-500">Select date</span>}
            </button>
            {isOpen && (
                <div className="absolute z-10 top-full mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-lg">
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
                        <button type="button" onClick={() => setYear(year + 1)} className="text-white font-bold text-lg px-2">
                            ›
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {months.map((month, index) => {
                            const isBeforeStartDate = startYear !== null && (year < startYear || (year === startYear && index < startMonthIndex));
                            return (
                                <button
                                    key={month}
                                    type="button"
                                    onClick={() => handleSelect(month.substring(0, 3))}
                                    className={`p-2 rounded-md text-sm ${isBeforeStartDate ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-500'}`}
                                    disabled={isBeforeStartDate}
                                >
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

const EducationItem = ({ education, index, onUpdate, onDelete, onSave }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onUpdate(education.id, { ...education, [name]: value });
    };

    const handleDateSelect = (name, date) => {
        const newEducation = { ...education, [name]: date };
        if (name === 'startDate') {
            const startDateObj = new Date(date);
            const endDateObj = new Date(newEducation.endDate);
            if (newEducation.endDate && startDateObj > endDateObj) {
                newEducation.endDate = '';
            }
        }
        onUpdate(education.id, newEducation);
    };

    const handleAccomplishmentChange = (e) => {
        let { value } = e.target;
        if (value.length > 0 && !value.startsWith('• ')) {
            value = '• ' + value;
        }
        onUpdate(education.id, { ...education, bullets: value });
    };

    const handleAccomplishmentKeyDown = (e) => {
        const { selectionStart, value } = e.target;
        if (e.key === 'Enter') {
            e.preventDefault();
            const newValue = `${value.slice(0, selectionStart)}\n• ${value.slice(selectionStart)}`;
            onUpdate(education.id, { ...education, bullets: newValue });
        }
        if (e.key === 'Backspace') {
            const lines = value.split('\n');
            const currentLineIndex = value.substring(0, selectionStart).split('\n').length - 1;
            const currentLine = lines[currentLineIndex];
            if (selectionStart > 0 && value[selectionStart - 1] === '\n' && (currentLine.trim() === '•' || currentLine.trim() === '')) {
                e.preventDefault();
                const newLines = lines.filter((_, index) => index !== currentLineIndex);
                const newValue = newLines.length === 0 ? '• ' : newLines.join('\n');
                onUpdate(education.id, { ...education, bullets: newValue });
            }
        }
    };

    const schoolName = education.school || 'THE INSTITUTION';

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl">
                    <span className="font-bold">{education.degree || `Education ${index + 1}`}</span>
                    <span className="text-base font-normal text-gray-400 ml-2">{education.school}</span>
                    {(education.startDate || education.endDate) && <span className="text-base font-normal text-gray-400 ml-2">{`${education.startDate || '...'} - ${education.endDate || '...'}`}</span>}
                </h2>
                <button onClick={() => onDelete(education.id)} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(education.id); }}>
                <FormInput label={`What is your degree or other qualification and major at ${schoolName}? *`} name="degree" value={education.degree} onChange={handleInputChange} placeholder={'Bachelor of science in Data Science'} />
                <FormInput label="WHERE DID YOU EARN YOUR DEGREE/QUALIFICATION? *" name="school" value={education.school} onChange={handleInputChange} placeholder={'Texas A&M University'} />
                <FormInput label={`Where is ${schoolName} located? *`} name="location" value={education.location} onChange={handleInputChange} placeholder={'Dallas, TX'} />
                <FormInput label={`Did you minor in anything?`} name="minor" value={education.minor} onChange={handleInputChange} placeholder={'Business'} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{`HOW LONG WERE YOU AT ${schoolName}?`}</label>
                        <div className="flex items-center gap-4">
                            <DatePicker
                                value={education.startDate}
                                onSelect={(date) => handleDateSelect('startDate', date)}
                            />
                            <DatePicker
                                value={education.endDate}
                                onSelect={(date) => handleDateSelect('endDate', date)}
                                startDate={education.startDate}
                            />
                        </div>
                    </div>
                    <FormInput label={`GPA (if applicable)`} name="gpa" value={education.gpa} onChange={handleInputChange} placeholder={'4.0 GPA'} />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{`OPEN FIELD FOR ADDITIONAL INFORMATION`}</label>
                    <textarea name="bullets" value={education.bullets} onChange={handleAccomplishmentChange} onKeyDown={handleAccomplishmentKeyDown} className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 leading-relaxed" rows="8" />
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-6 rounded-lg">
                        SAVE TO EDUCATION LIST
                    </button>
                </div>
            </form>
        </div>
    );
};


// --- Main Education Page ---
const Education = () => {
    const createNewEducation = () => ({
        id: Date.now(),
        degree: '',
        school: '',
        startDate: '',
        endDate: '',
        location: '',
        bullets: '• ',
        minor: '',
        gpa: '',
    });

    const [educations, setEducations] = useState([createNewEducation()]);

    const addEducation = () => {
        setEducations([...educations, createNewEducation()]);
    };

    const updateEducation = useCallback((id, updatedData) => {
        setEducations(educations => educations.map(edu => (edu.id === id ? updatedData : edu)));
    }, []);

    const deleteEducation = (id) => {
        if (educations.length > 1) {
            setEducations(educations.filter(edu => edu.id !== id));
        }
    };

    const saveEducation = (id) => {
        const educationToSave = educations.find(edu => edu.id === id);
        console.log("Saving Education:", educationToSave);
        alert(`${educationToSave.degree || 'Education'} saved!`);
    };

    return (
        <EditorLayout>
            {educations.map((edu, index) => (
                <EducationItem
                    key={edu.id}
                    education={edu}
                    index={index}
                    onUpdate={updateEducation}
                    onDelete={deleteEducation}
                    onSave={saveEducation}
                />
            ))}
            <div className="flex justify-center">
                <button onClick={addEducation} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg">
                    ADD ANOTHER EDUCATION
                </button>
            </div>
        </EditorLayout>
    );
};

export default Education;