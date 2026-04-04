// src/pages/resume/education.js
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal';

const EducationItem = ({ education, index, onUpdate, onDelete }) => {
    const schoolName = education.school || 'YOUR SCHOOL';

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
            <form className="space-y-6">
                <FormInput label="WHAT WAS YOUR DEGREE OR FIELD OF STUDY? *" name="degree" value={education.degree} onChange={(e) => onUpdate(education.id, { ...education, degree: e.target.value })} placeholder="B.S. in Computer Science" />
                <FormInput label="WHERE DID YOU GO TO SCHOOL? *" name="school" value={education.school} onChange={(e) => onUpdate(education.id, { ...education, school: e.target.value })} placeholder="University of Washington" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{`WHEN DID YOU ATTEND ${schoolName}?`}</label>
                        <div className="flex items-center gap-4">
                            <DatePicker
                                value={education.startDate}
                                onSelect={(date) => onUpdate(education.id, { ...education, startDate: date })}
                            />
                            <DatePicker
                                value={education.endDate}
                                onSelect={(date) => onUpdate(education.id, { ...education, endDate: date, isCurrent: false })}
                                startDate={education.startDate}
                                showToggle={true}
                                isCurrent={education.isCurrent}
                                onToggleCurrent={() => onUpdate(education.id, { ...education, isCurrent: !education.isCurrent, endDate: !education.isCurrent ? 'Present' : '' })}
                                toggleLabel="Currently studying here"
                            />
                        </div>
                    </div>
                    <FormInput label="WHERE WAS THE SCHOOL LOCATED?" name="location" value={education.location} onChange={(e) => onUpdate(education.id, { ...education, location: e.target.value })} placeholder="Seattle, WA" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Minor" name="minor" value={education.minor} onChange={(e) => onUpdate(education.id, { ...education, minor: e.target.value })} placeholder="e.g., Mathematics" />
                    <FormInput label="GPA" name="gpa" value={education.gpa} onChange={(e) => onUpdate(education.id, { ...education, gpa: e.target.value })} placeholder="e.g., 3.8/4.0" />
                </div>
            </form>
        </div>
    );
};

const Education = () => {
    const { educations, setEducations, addEducation } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

    const updateEducation = useCallback((id, updatedData) => {
        setEducations(currentEducations =>
            currentEducations.map(edu => (edu.id === id ? updatedData : edu))
        );
    }, [setEducations]);

    const deleteEducation = (id) => {
        if (educations.length > 1) {
            setEducations(educations.filter(edu => edu.id !== id));
        } else {
            setModalInfo({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You must have at least one education entry.',
                isError: true
            });
        }
    };

    const saveAllEducations = async () => {
        if (!resumeId) {
            setModalInfo({
                isOpen: true,
                title: 'Save Error',
                message: 'Cannot save education without a resume ID.',
                isError: true
            });
            return;
        }
        if (isSaving) return;
        setIsSaving(true);

        let saveErrors = 0;
        const savePromises = educations.map(edu => {
            if (edu.degree || edu.school) {
                return fetch('https://renaisons.com/api/save_education.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...edu, resume_id: resumeId }),
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 'success' && result.education_id) {
                            return { oldId: edu.id, newId: result.education_id };
                        } else if (result.status !== 'success') {
                            saveErrors++;
                            console.error(`Error saving education "${edu.school || 'New'}": ${result.message}`);
                        }
                        return null;
                    })
                    .catch(error => {
                        saveErrors++;
                        console.error(`Network error saving education "${edu.school || 'New'}":`, error);
                        return null;
                    });
            }
            return Promise.resolve(null);
        });

        try {
            const results = await Promise.all(savePromises);

            const updates = results.filter(Boolean);
            if (updates.length > 0) {
                setEducations(currentEducations =>
                    currentEducations.map(edu => {
                        const update = updates.find(u => u.oldId === edu.id);
                        return update ? { ...edu, id: update.newId } : edu;
                    })
                );
            }

            if (saveErrors > 0) {
                setModalInfo({
                    isOpen: true,
                    title: 'Save Complete (with errors)',
                    message: `Successfully saved ${educations.length - saveErrors} entries. ${saveErrors} entries failed to save. Please check console for details.`,
                    isError: true
                });
            } else {
                setModalInfo({
                    isOpen: true,
                    title: 'Success!',
                    message: 'All education entries saved successfully.',
                    isError: false
                });
            }

        } catch (error) {
            console.error('Error during batch save:', error);
            setModalInfo({
                isOpen: true,
                title: 'Critical Error',
                message: 'A network error occurred while saving. Please check your connection and try again.',
                isError: true
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {modalInfo.isOpen && (
                <FeedbackModal
                    title={modalInfo.title}
                    message={modalInfo.message}
                    isError={modalInfo.isError}
                    onClose={() => setModalInfo({ isOpen: false, message: '', title: '', isError: false })}
                />
            )}

            {educations.map((edu, index) => (
                <EducationItem
                    key={edu.id}
                    education={edu}
                    index={index}
                    onUpdate={updateEducation}
                    onDelete={deleteEducation}
                />
            ))}
            <AddItemButton onClick={addEducation}>
                ADD ANOTHER EDUCATION
            </AddItemButton>

            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllEducations} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL EDUCATION'}
                </SaveButton>
            </div>
        </>
    );
};

export default Education;