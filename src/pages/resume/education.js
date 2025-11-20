// src/pages/resume/education.js
import React, { useState, useCallback } from 'react'; // Import useState & useCallback
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal'; // <-- Import reusable modal

// --- EducationItem Component ---
// No save logic, just displays data and calls update functions
const EducationItem = ({ education, index, onUpdate, onDelete, onAiWrite }) => {
    const schoolName = education.school || 'YOUR SCHOOL';
    const remainingAiWrites = 3 - (education.aiClickCount || 0);

    // --- REMOVED: onSubmit and onSave function ---

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
            {/* REMOVED: onSubmit from form tag */}
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
                                onSelect={(date) => onUpdate(education.id, { ...education, endDate: date })}
                                startDate={education.startDate}
                            />
                        </div>
                    </div>
                    <FormInput label="WHERE WAS THE SCHOOL LOCATED?" name="location" value={education.location} onChange={(e) => onUpdate(education.id, { ...education, location: e.target.value })} placeholder="Seattle, WA" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Minor" name="minor" value={education.minor} onChange={(e) => onUpdate(education.id, { ...education, minor: e.g.target.value })} placeholder="e.g., Mathematics" />
                    <FormInput label="GPA" name="gpa" value={education.gpa} onChange={(e) => onUpdate(education.id, { ...education, gpa: e.target.value })} placeholder="e.g., 3.8/4.0" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">RELEVANT COURSEWORK OR ACHIEVEMENTS</label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => onAiWrite(education.id)}
                                disabled={remainingAiWrites <= 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                AI Write
                            </button>
                            <span className="text-xs text-gray-400">({remainingAiWrites} left)</span>
                        </div>
                    </div>
                    <FormTextarea
                        name="bullets"
                        value={education.bullets}
                        onChange={(e) => onUpdate(education.id, { ...education, bullets: e.target.value })}
                        rows="6"
                    />
                </div>

                {/* --- REMOVED: Individual Save Button --- */}
            </form>
        </div>
    );
};

// --- Education Component (Main) ---
const Education = () => {
    const { educations, setEducations, addEducation } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);

    // --- ADDED: Modal state ---
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
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You must have at least one education entry.',
                isError: true
            });
        }
    };

    // --- ADDED: saveAllEducations function ---
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
            // Only save if it has a degree or school
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

    const handleAiWrite = (id) => {
        const educationToUpdate = educations.find(edu => edu.id === id);
        const currentClickCount = educationToUpdate.aiClickCount || 0;

        if (currentClickCount >= 3) {
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'AI Limit Reached',
                message: 'AI suggestion limit reached for this item.',
                isError: true
            });
            return;
        }

        const aiSuggestions = [
            '• Relevant Coursework: Data Structures, Algorithms, Machine Learning, Database Systems.',
            '• Dean\'s List (2020-2024)',
            '• Capstone Project: Developed a predictive model for stock market trends with 85% accuracy.'
        ];

        const aiGeneratedText = aiSuggestions[currentClickCount];
        const currentBullets = educationToUpdate.bullets.trim();
        const newBullets = (currentBullets === '•' || currentBullets === '')
            ? aiGeneratedText
            : `${currentBullets}\n${aiGeneratedText}`;

        updateEducation(id, { ...educationToUpdate, bullets: newBullets, aiClickCount: currentClickCount + 1 });
    };

    return (
        <>
            {/* --- ADDED: Render the modal --- */}
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
                    // REMOVED: onSave prop
                    onAiWrite={handleAiWrite}
                />
            ))}
            <AddItemButton onClick={addEducation}>
                ADD ANOTHER EDUCATION
            </AddItemButton>

            {/* --- ADDED: Main Save Button --- */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllEducations} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL EDUCATION'}
                </SaveButton>
            </div>
        </>
    );
};

export default Education;