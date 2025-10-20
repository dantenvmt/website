import React, { useCallback } from 'react';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
const FeedbackModal = ({ title, message, onClose, isError }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-neutral-800 rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 className={`text-lg font-bold mb-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>{title}</h3>
            <p className="text-neutral-300 mb-6">{message}</p>
            <button
                onClick={onClose}
                className={`w-full text-white font-semibold py-2 px-4 rounded-md transition-colors ${isError ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                OK
            </button>
        </div>
    </div>
);
const EducationItem = ({ education, index, onUpdate, onDelete, onSave }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onUpdate(education.id, { ...education, [name]: value });
    };

    const handleDateSelect = (name, date) => {
        onUpdate(education.id, { ...education, [name]: date });
    };

    const schoolName = education.school || 'THE INSTITUTION';

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">
                    {education.degree || `Education ${index + 1}`}
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

                <FormTextarea label="OPEN FIELD FOR ADDITIONAL INFORMATION" name="bullets" value={education.bullets} onChange={handleInputChange} rows="6" />

                <div className="flex justify-end">
                    <SaveButton type="submit">SAVE TO EDUCATION</SaveButton>
                </div>
            </form>
        </div>
    );
};

const Education = () => {
    const { educations, setEducations, addEducation } = useResume();
    const { resumeId } = useParams();
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

    const showModal = (title, message, isError = true) => {
        setModalInfo({ isOpen: true, title, message, isError });
    };

    const updateEducation = useCallback((id, updatedData) => {
        setEducations(currentEducations =>
            currentEducations.map(edu => (edu.id === id ? updatedData : edu))
        );
    }, [setEducations]);

    const deleteEducation = (id) => {
        if (educations.length > 1) {
            setEducations(educations.filter(edu => edu.id !== id));
        } else {
            alert("You must have at least one education entry.");
        }
    };

    const saveEducation = async (id) => {
        if (!resumeId) {
            showModal('Save Error', "Cannot save education without a resume ID.");
            return;
        }

        const educationToSave = educations.find(edu => edu.id === id);

        // --- GPA Validation ---
        if (educationToSave.gpa) {
            const gpaValue = parseFloat(educationToSave.gpa);
            if (isNaN(gpaValue) || gpaValue < 0.0 || gpaValue > 5.0) {
                showModal('Invalid Input', 'Please enter a valid GPA between 0.0 and 5.0.');
                return;
            }
        }

        try {
            const response = await fetch('/api/save_education.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...educationToSave, resume_id: resumeId }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                if (result.education_id) {
                    updateEducation(id, { ...educationToSave, id: result.education_id });
                }
                showModal('Success', `${educationToSave.degree || 'Education'} saved!`, false);
            } else {
                showModal('Save Error', result.message || 'An unknown server error occurred.');
            }
        } catch (error) {
            console.error('Failed to save education:', error);
            showModal('Network Error', 'A critical error occurred. Please check the console.');
        }
    };

    return (
        <>
            {modalInfo.isOpen && <FeedbackModal title={modalInfo.title} message={modalInfo.message} isError={modalInfo.isError} onClose={() => setModalInfo({ isOpen: false, message: '', title: '', isError: false })} />}
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
            <AddItemButton onClick={addEducation}>
                ADD ANOTHER EDUCATION
            </AddItemButton>
        </>
    );
};

export default Education;

