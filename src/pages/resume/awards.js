// src/pages/resume/awards.js
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal';

const AwardItem = ({ award, index, onUpdate, onDelete }) => {
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
            <form className="space-y-6">
                <FormInput label="AWARD NAME *" name="name" value={award.name} onChange={(e) => onUpdate(award.id, { ...award, name: e.target.value })} placeholder="e.g., Dean's List" />
                <FormInput label="ISSUING ORGANIZATION *" name="organization" value={award.organization} onChange={(e) => onUpdate(award.id, { ...award, organization: e.target.value })} placeholder="e.g., University of Washington" />
                <FormInput label="DATE RECEIVED" name="date" value={award.date} onChange={(e) => onUpdate(award.id, { ...award, date: e.target.value })} placeholder="e.g., May 2024" />
            </form>
        </div>
    );
};

const Awards = () => {
    const { awards, setAwards, addAward } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);
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
            setModalInfo({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You must have at least one award entry.',
                isError: true
            });
        }
    };

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

            {awards.map((award, index) => (
                <AwardItem
                    key={award.id}
                    award={award}
                    index={index}
                    onUpdate={updateAward}
                    onDelete={deleteAward}
                />
            ))}
            <AddItemButton onClick={addAward}>
                ADD ANOTHER AWARD
            </AddItemButton>

            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllAwards} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL AWARDS'}
                </SaveButton>
            </div>
        </>
    );
};

export default Awards;