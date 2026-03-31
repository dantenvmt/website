import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal';
import AIWriteExperienceModal from '../../components/resume/AIWriteExperienceModal';

const ExperienceItem = ({ experience, index, onUpdate, onDelete, onAiWrite, noJd, aiWriteUsed }) => {
    const companyName = experience.company || 'THE COMPANY';

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
            <form className="space-y-6">
                <FormInput label={`WHAT WAS YOUR ROLE AT ${companyName}? *`} name="role" value={experience.role} onChange={(e) => onUpdate(experience.id, { ...experience, role: e.target.value })} placeholder={'Data Scientist'} />
                <FormInput label="FOR WHICH COMPANY DID YOU WORK? *" name="company" value={experience.company} onChange={(e) => onUpdate(experience.id, { ...experience, company: e.target.value })} placeholder={'Google'} />

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

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">{`WHAT DID YOU DO AT ${companyName}?`}</label>
                        <div className="flex flex-col items-end gap-1">
                            <button
                                type="button"
                                onClick={() => !aiWriteUsed && onAiWrite(experience.id)}
                                disabled={aiWriteUsed}
                                className={`text-xs font-bold py-1 px-3 rounded-md ${aiWriteUsed ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                title={aiWriteUsed ? 'Already used for this job description' : ''}
                            >
                                {aiWriteUsed ? 'AI Write Used' : 'AI Write'}
                            </button>
                            {noJd && (
                                <span className="text-xs text-red-400">Add a job description on the Final Resume page first.</span>
                            )}
                        </div>
                    </div>
                    <FormTextarea
                        name="bullets"
                        value={experience.bullets}
                        onChange={(e) => onUpdate(experience.id, { ...experience, bullets: e.target.value })}
                        rows="8"
                    />
                </div>
            </form>
        </div>
    );
};

const Experience = () => {
    const { experiences, setExperiences, addExperience, jobDescription } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });
    const [aiWriteModalOpen, setAiWriteModalOpen] = useState(false);
    const [aiWriteUsed, setAiWriteUsed] = useState(false);
    const [noJdWarningExpId, setNoJdWarningExpId] = useState(null);

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
                isError: true,
            });
        }
    };

    const saveAllExperiences = async () => {
        if (!resumeId) {
            setModalInfo({
                isOpen: true,
                title: 'Save Error',
                message: 'Cannot save experience without a resume ID.',
                isError: true,
            });
            return;
        }
        if (isSaving) return;
        setIsSaving(true);
        let saveErrors = 0;

        const savePromises = experiences.map(exp => {
            if (exp.role || exp.company) {
                return fetch('https://renaisons.com/api/save_experience.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...exp, resume_id: resumeId }),
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 'success' && result.experience_id && exp.id !== result.experience_id) {
                            return { oldId: exp.id, newId: result.experience_id };
                        } else if (result.status !== 'success') {
                            console.error(`Error saving experience "${exp.role || 'New'}": ${result.message}`);
                            saveErrors++;
                        }
                        return null;
                    })
                    .catch(error => {
                        console.error(`Network error saving experience "${exp.role || 'New'}":`, error);
                        saveErrors++;
                        return null;
                    });
            }
            return Promise.resolve(null);
        });

        try {
            const results = await Promise.all(savePromises);
            const updates = results.filter(Boolean);
            if (updates.length > 0) {
                setExperiences(currentExperiences =>
                    currentExperiences.map(exp => {
                        const update = updates.find(u => u.oldId === exp.id);
                        return update ? { ...exp, id: update.newId } : exp;
                    })
                );
            }

            if (saveErrors > 0) {
                setModalInfo({
                    isOpen: true,
                    title: 'Save Complete (with errors)',
                    message: `Successfully saved ${experiences.length - saveErrors} entries. ${saveErrors} entries failed to save.`,
                    isError: true,
                });
            } else {
                setModalInfo({
                    isOpen: true,
                    title: 'Success!',
                    message: 'All experience entries saved successfully.',
                    isError: false,
                });
            }
        } catch (error) {
            setModalInfo({
                isOpen: true,
                title: 'Critical Error',
                message: 'A network error occurred while saving. Please check your connection and try again.',
                isError: true,
            });
            console.error('Failed to save experiences:', error);
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (!resumeId || !jobDescription) { setAiWriteUsed(false); return; }
        let hash = 0;
        for (let i = 0; i < jobDescription.length; i++) {
            hash = ((hash << 5) - hash) + jobDescription.charCodeAt(i);
            hash |= 0;
        }
        setAiWriteUsed(!!localStorage.getItem(`aiwrite_${resumeId}_${hash}`));
    }, [resumeId, jobDescription]);

    const getAiWriteKey = () => {
        if (!resumeId || !jobDescription) return null;
        let hash = 0;
        for (let i = 0; i < jobDescription.length; i++) {
            hash = ((hash << 5) - hash) + jobDescription.charCodeAt(i);
            hash |= 0;
        }
        return `aiwrite_${resumeId}_${hash}`;
    };

    const handleAiWrite = (id) => {
        if (!jobDescription || !jobDescription.trim()) {
            setNoJdWarningExpId(id);
            return;
        }
        const key = getAiWriteKey();
        if (key && localStorage.getItem(key)) {
            setModalInfo({
                isOpen: true,
                title: 'AI Write Already Used',
                message: "You've already used AI Write for this job description.",
                isError: true,
            });
            return;
        }
        setNoJdWarningExpId(null);
        setAiWriteModalOpen(true);
    };

    const handleAiGenerated = () => {
        const key = getAiWriteKey();
        if (key) {
            localStorage.setItem(key, '1');
            setAiWriteUsed(true);
        }
    };

    const handleAiInsert = (items) => {
        items.forEach(({ bullet, experienceId }) => {
            const exp = experiences.find(e => String(e.id) === String(experienceId));
            if (!exp) return;
            const currentBullets = exp.bullets ? exp.bullets.trim() : '';
            const merged = (!currentBullets || currentBullets === '•')
                ? bullet
                : `${currentBullets}\n${bullet}`;
            updateExperience(exp.id, { ...exp, bullets: merged });
        });
        setAiWriteModalOpen(false);
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
            {aiWriteModalOpen && (
                <AIWriteExperienceModal
                    jobDescription={jobDescription}
                    experiences={experiences}
                    onInsert={handleAiInsert}
                    onGenerated={handleAiGenerated}
                    onClose={() => setAiWriteModalOpen(false)}
                />
            )}
            {experiences.map((exp, index) => (
                <ExperienceItem
                    key={exp.id}
                    experience={exp}
                    index={index}
                    onUpdate={updateExperience}
                    onDelete={deleteExperience}
                    onAiWrite={handleAiWrite}
                    noJd={noJdWarningExpId === exp.id}
                    aiWriteUsed={aiWriteUsed}
                />
            ))}
            <AddItemButton onClick={addExperience}>
                ADD ANOTHER EXPERIENCE
            </AddItemButton>
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllExperiences} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL EXPERIENCES'}
                </SaveButton>
            </div>
        </>
    );
};

export default Experience;
