// src/pages/resume/awards.js
import React, { useState, useCallback } from 'react'; // Import useState & useCallback
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal'; // <-- Import reusable modal

// --- AwardItem Component ---
// No save logic, just displays data and calls update functions
const AwardItem = ({ award, index, onUpdate, onDelete, onAiWrite }) => {
    const remainingAiWrites = 3 - (award.aiClickCount || 0);

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">
                    {award.name || `Award ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(award.id)} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            {/* REMOVED: onSubmit from form tag */}
            <form className="space-y-6">
                <FormInput label="AWARD NAME *" name="name" value={award.name} onChange={(e) => onUpdate(award.id, { ...award, name: e.target.value })} placeholder="e.g., Dean's List" />
                <FormInput label="ISSUING ORGANIZATION *" name="organization" value={award.organization} onChange={(e) => onUpdate(award.id, { ...award, organization: e.target.value })} placeholder="e.g., University of Washington" />
                <FormInput label="DATE RECEIVED" name="date" value={award.date} onChange={(e) => onUpdate(award.id, { ...award, date: e.target.value })} placeholder="e.g., May 2024" />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">HOW IS THIS AWARD RELEVANT?</label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => onAiWrite(award.id)}
                                disabled={remainingAiWrites <= 0}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                AI Write
                            </button>
                            <span className="text-xs text-gray-400">({remainingAiWrites} left)</span>
                        </div>
                    </div>
                    <FormTextarea
                        name="relevance"
                        value={award.relevance}
                        onChange={(e) => onUpdate(award.id, { ...award, relevance: e.target.value })}
                        rows="4"
                    />
                </div>

                {/* --- REMOVED: Individual Save Button --- */}
            </form>
        </div>
    );
};

// --- Awards Component (Main) ---
const Awards = () => {
    const { awards, setAwards, addAward } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);

    // --- ADDED: Modal state ---
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

    const updateAward = useCallback((id, updatedData) => {
        setAwards(currentAwards =>
            currentAwards.map(award => (award.id === id ? updatedData : award))
        );
    }, [setAwards]);

    const deleteAward = (id) => {
        if (awards.length > 1) {
            setAwards(awards.filter(award => award.id !== id));
        } else {
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You must have at least one award entry.',
                isError: true
            });
        }
    };

    // --- ADDED: saveAllAwards function ---
    const saveAllAwards = async () => {
        if (!resumeId) {
            setModalInfo({
                isOpen: true,
                title: 'Save Error',
                message: 'Cannot save awards without a resume ID.',
                isError: true
            });
            return;
        }
        if (isSaving) return;
        setIsSaving(true);

        let saveErrors = 0;
        const savePromises = awards.map(award => {
            // Only save if it has a name
            if (award.name) {
                return fetch('https://renaisons.com/api/save_award.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...award, resume_id: resumeId }),
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 'success' && result.award_id) {
                            return { oldId: award.id, newId: result.award_id };
                        } else if (result.status !== 'success') {
                            saveErrors++;
                            console.error(`Error saving award "${award.name || 'New'}": ${result.message}`);
                        }
                        return null;
                    })
                    .catch(error => {
                        saveErrors++;
                        console.error(`Network error saving award "${award.name || 'New'}":`, error);
                        return null;
                    });
            }
            return Promise.resolve(null);
        });

        try {
            const results = await Promise.all(savePromises);

            const updates = results.filter(Boolean);
            if (updates.length > 0) {
                setAwards(currentAwards =>
                    currentAwards.map(award => {
                        const update = updates.find(u => u.oldId === award.id);
                        return update ? { ...award, id: update.newId } : award;
                    })
                );
            }

            if (saveErrors > 0) {
                setModalInfo({
                    isOpen: true,
                    title: 'Save Complete (with errors)',
                    message: `Successfully saved ${awards.length - saveErrors} entries. ${saveErrors} entries failed to save. Please check console for details.`,
                    isError: true
                });
            } else {
                setModalInfo({
                    isOpen: true,
                    title: 'Success!',
                    message: 'All award entries saved successfully.',
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
        const awardToUpdate = awards.find(award => award.id === id);
        const currentClickCount = awardToUpdate.aiClickCount || 0;

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
            '• Recognized for outstanding academic achievement by maintaining a 4.0 GPA.',
            '• Awarded first place in a university-wide hackathon for developing an innovative AI solution.',
            '• Selected as "Employee of the Month" for exceptional performance and team collaboration.'
        ];

        const aiGeneratedText = aiSuggestions[currentClickCount];
        const currentRelevance = awardToUpdate.relevance.trim();
        const newRelevance = (currentRelevance === '•' || currentRelevance === '')
            ? aiGeneratedText
            : `${currentRelevance}\n${aiGeneratedText}`;

        updateAward(id, { ...awardToUpdate, relevance: newRelevance, aiClickCount: currentClickCount + 1 });
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

            {awards.map((award, index) => (
                <AwardItem
                    key={award.id}
                    award={award}
                    index={index}
                    onUpdate={updateAward}
                    onDelete={deleteAward}
                    onAiWrite={handleAiWrite}
                />
            ))}
            <AddItemButton onClick={addAward}>
                ADD ANOTHER AWARD
            </AddItemButton>

            {/* --- ADDED: Main Save Button --- */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllAwards} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL AWARDS'}
                </SaveButton>
            </div>
        </>
    );
};

export default Awards;