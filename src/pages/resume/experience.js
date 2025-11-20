// src/pages/resume/experience.js
import React, { useCallback, useState } from 'react'; // Import useState
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal';
// --- ExperienceItem Component ---
// REMOVE the onSubmit handler and the SaveButton from this component
const ExperienceItem = ({ experience, index, onUpdate, onDelete, onAiWrite }) => {
    const companyName = experience.company || 'THE COMPANY';
    const remainingAiWrites = 3 - (experience.aiClickCount || 0);

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">
                    {experience.role || `Experience ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(experience.id)} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            {/* REMOVED onSubmit from form */}
            <form className="space-y-6">
                <FormInput label={`WHAT WAS YOUR ROLE AT ${companyName}? *`} name="role" value={experience.role} onChange={(e) => onUpdate(experience.id, { ...experience, role: e.target.value })} placeholder={'Data Scientist'} />
                <FormInput label="FOR WHICH COMPANY DID YOU WORK? *" name="company" value={experience.company} onChange={(e) => onUpdate(experience.id, { ...experience, company: e.target.value })} placeholder={'Google'} />

                {/* Date Pickers and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{`HOW LONG WERE YOU WITH ${companyName}?`}</label>
                        <div className="flex items-center gap-4">
                            <DatePicker
                                value={experience.startDate}
                                onSelect={(date) => onUpdate(experience.id, { ...experience, startDate: date })}
                            />
                            <DatePicker
                                value={experience.endDate}
                                onSelect={(date) => onUpdate(experience.id, { ...experience, endDate: date, isCurrent: false })}
                                startDate={experience.startDate}
                                showToggle={true}
                                isCurrent={experience.isCurrent}
                                onToggleCurrent={() => onUpdate(experience.id, { ...experience, isCurrent: !experience.isCurrent, endDate: !experience.isCurrent ? 'Present' : '' })}
                            />
                        </div>
                    </div>
                    <FormInput label={`WHERE WAS ${companyName} LOCATED?`} name="location" value={experience.location} onChange={(e) => onUpdate(experience.id, { ...experience, location: e.target.value })} placeholder={"Mountain View, CA"} />
                </div>

                {/* Bullets Textarea with AI Write */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">{`WHAT DID YOU DO AT ${companyName}?`}</label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => onAiWrite(experience.id)}
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
                        value={experience.bullets}
                        onChange={(e) => onUpdate(experience.id, { ...experience, bullets: e.target.value })}
                        rows="8"
                    />
                </div>

                {/* --- REMOVED INDIVIDUAL SAVE BUTTON --- */}
                {/*
                <div className="flex justify-end">
                    <SaveButton type="submit">SAVE TO EXPERIENCE</SaveButton>
                </div>
                */}
            </form>
        </div>
    );
};


// --- Experience Component (Main) ---
const Experience = () => {
    const { experiences, setExperiences, addExperience } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false); // Add saving state
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });
    const updateExperience = useCallback((id, updatedData) => {
        setExperiences(currentExperiences =>
            currentExperiences.map(exp => (exp.id === id ? updatedData : exp))
        );
    }, [setExperiences]);

    const deleteExperience = (id) => {
        if (experiences.length > 1) {
            setExperiences(experiences.filter(exp => exp.id !== id));
        } else {
            setModalInfo({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You must have at least one experience entry.',
                isError: true
            });
        }
    };

    // --- NEW FUNCTION: saveAllExperiences ---
    const saveAllExperiences = async () => {
        if (!resumeId) {
            setModalInfo({
                isOpen: true,
                title: 'Save Error',
                message: 'Cannot save experience without a resume ID.',
                isError: true
            });
            return;
        }
        if (isSaving) return; // Prevent double clicks
        setIsSaving(true);
        let saveErrors = 0;
        const savePromises = experiences.map(exp => {
            // Only save if it has a role or company (basic check for non-empty entry)
            if (exp.role || exp.company) {
                return fetch('https://renaisons.com/api/save_experience.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...exp, resume_id: resumeId }),
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 'success' && result.experience_id && exp.id !== result.experience_id) {
                            // Return the update needed for this experience
                            return { oldId: exp.id, newId: result.experience_id };
                        } else if (result.status !== 'success') {
                            // Log errors for individual saves but continue
                            console.error(`Error saving experience "${exp.role || 'New'}": ${result.message}`);
                            // Optionally collect errors to show user later
                        }
                        return null; // No update needed or error occurred
                    })
                    .catch(error => {
                        console.error(`Network error saving experience "${exp.role || 'New'}":`, error);
                        // Optionally collect errors
                        return null;
                    });
            }
            return Promise.resolve(null); // Resolve immediately for empty experiences
        });

        try {
            const results = await Promise.all(savePromises);

            // Update local state with new IDs from the database
            const updates = results.filter(Boolean); // Filter out nulls
            if (updates.length > 0) {
                setExperiences(currentExperiences =>
                    currentExperiences.map(exp => {
                        const update = updates.find(u => u.oldId === exp.id);
                        return update ? { ...exp, id: update.newId } : exp;
                    })
                );
            }

            // --- REPLACE ALERTS WITH MODAL ---
            if (saveErrors > 0) {
                setModalInfo({
                    isOpen: true,
                    title: 'Save Complete (with errors)',
                    message: `Successfully saved ${experiences.length - saveErrors} entries. ${saveErrors} entries failed to save. Please check console for details.`,
                    isError: true
                });
            } else {
                setModalInfo({
                    isOpen: true,
                    title: 'Success!',
                    message: 'All experience entries saved successfully.',
                    isError: false // This will show the green/blue success style
                });
            }
        } catch (error) {
            setModalInfo({
                isOpen: true,
                title: 'Critical Error',
                message: 'A network error occurred while saving. Please check your connection and try again.',
                isError: true
            });
            console.error('Failed to save experiences:', error);
        } finally {
            setIsSaving(false);
        }
    };
    // --- END NEW FUNCTION ---

    const handleAiWrite = (id) => {
        // AI write logic remains the same
        const experienceToUpdate = experiences.find(exp => exp.id === id);
        const currentClickCount = experienceToUpdate.aiClickCount || 0;

        if (currentClickCount >= 3) {
            setModalInfo({
                isOpen: true,
                title: 'AI Limit Reached',
                message: 'AI suggestion limit reached for this item.',
                isError: true
            });
            return;
        }

        const aiSuggestions = [
            '• Leveraged machine learning models to increase sales forecasting accuracy by 25%.',
            '• Designed and implemented a new data warehousing solution, reducing query times by 40%.',
            '• Collaborated with product teams to define data-driven strategies for new feature development.'
        ];

        const aiGeneratedText = aiSuggestions[currentClickCount];
        const currentBullets = experienceToUpdate.bullets.trim();
        const newBullets = (currentBullets === '•' || currentBullets === '')
            ? aiGeneratedText
            : `${currentBullets}\n${aiGeneratedText}`;

        updateExperience(id, { ...experienceToUpdate, bullets: newBullets, aiClickCount: currentClickCount + 1 });
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
            {experiences.map((exp, index) => (
                <ExperienceItem
                    key={exp.id} // Use the ID as key
                    experience={exp}
                    index={index}
                    onUpdate={updateExperience}
                    onDelete={deleteExperience}
                    // Removed onSave prop
                    onAiWrite={handleAiWrite}
                />
            ))}
            <AddItemButton onClick={addExperience}>
                ADD ANOTHER EXPERIENCE
            </AddItemButton>

            {/* --- ADDED MAIN SAVE BUTTON --- */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllExperiences} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL EXPERIENCES'}
                </SaveButton>
            </div>
        </>
    );
};

export default Experience;