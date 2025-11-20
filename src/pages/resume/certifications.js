// src/pages/resume/certifications.js
import React, { useState, useCallback } from 'react'; // Import useState & useCallback
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal'; // <-- Import reusable modal

// --- CertificationItem Component ---
// No save logic, just displays data and calls update functions
const CertificationItem = ({ certification, index, onUpdate, onDelete, onAiWrite }) => {
    const remainingAiWrites = 3 - (certification.aiClickCount || 0);

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">
                    {certification.name || `Certification ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(certification.id)} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            {/* REMOVED: onSubmit from form tag */}
            <form className="space-y-6">
                <FormInput label="CERTIFICATION NAME *" name="name" value={certification.name} onChange={(e) => onUpdate(certification.id, { ...certification, name: e.target.value })} placeholder="e.g., Certified TensorFlow Developer" />
                <FormInput label="ISSUING ORGANIZATION *" name="organization" value={certification.organization} onChange={(e) => onUpdate(certification.id, { ...certification, organization: e.target.value })} placeholder="e.g., Google" />
                <FormInput label="DATE ISSUED" name="date" value={certification.date} onChange={(e) => onUpdate(certification.id, { ...certification, date: e.target.value })} placeholder="e.g., May 2024" />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">HOW IS THIS CERTIFICATION RELEVANT?</label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => onAiWrite(certification.id)}
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
                        value={certification.relevance}
                        onChange={(e) => onUpdate(certification.id, { ...certification, relevance: e.target.value })}
                        rows="4"
                    />
                </div>

                {/* --- REMOVED: Individual Save Button --- */}
            </form>
        </div>
    );
};

// --- Certifications Component (Main) ---
const Certifications = () => {
    const { certifications, setCertifications, addCertification } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);

    // --- ADDED: Modal state ---
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

    const updateCertification = useCallback((id, updatedData) => {
        setCertifications(currentCerts =>
            currentCerts.map(cert => (cert.id === id ? updatedData : cert))
        );
    }, [setCertifications]);

    const deleteCertification = (id) => {
        if (certifications.length > 1) {
            setCertifications(certifications.filter(cert => cert.id !== id));
        } else {
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You must have at least one certification entry.',
                isError: true
            });
        }
    };

    // --- ADDED: saveAllCertifications function ---
    const saveAllCertifications = async () => {
        if (!resumeId) {
            setModalInfo({
                isOpen: true,
                title: 'Save Error',
                message: 'Cannot save certifications without a resume ID.',
                isError: true
            });
            return;
        }
        if (isSaving) return;
        setIsSaving(true);

        let saveErrors = 0;
        const savePromises = certifications.map(cert => {
            // Only save if it has a name
            if (cert.name) {
                return fetch('https://renaisons.com/api/save_certification.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...cert, resume_id: resumeId }),
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 'success' && result.certification_id) {
                            return { oldId: cert.id, newId: result.certification_id };
                        } else if (result.status !== 'success') {
                            saveErrors++;
                            console.error(`Error saving certification "${cert.name || 'New'}": ${result.message}`);
                        }
                        return null;
                    })
                    .catch(error => {
                        saveErrors++;
                        console.error(`Network error saving certification "${cert.name || 'New'}":`, error);
                        return null;
                    });
            }
            return Promise.resolve(null);
        });

        try {
            const results = await Promise.all(savePromises);

            const updates = results.filter(Boolean);
            if (updates.length > 0) {
                setCertifications(currentCerts =>
                    currentCerts.map(cert => {
                        const update = updates.find(u => u.oldId === cert.id);
                        return update ? { ...cert, id: update.newId } : cert;
                    })
                );
            }

            if (saveErrors > 0) {
                setModalInfo({
                    isOpen: true,
                    title: 'Save Complete (with errors)',
                    message: `Successfully saved ${certifications.length - saveErrors} entries. ${saveErrors} entries failed to save. Please check console for details.`,
                    isError: true
                });
            } else {
                setModalInfo({
                    isOpen: true,
                    title: 'Success!',
                    message: 'All certification entries saved successfully.',
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
        const certToUpdate = certifications.find(cert => cert.id === id);
        const currentClickCount = certToUpdate.aiClickCount || 0;

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
            '• Validated expertise in building and training neural networks using TensorFlow.',
            '• Demonstrated proficiency in data analysis, visualization, and dashboard creation with Tableau.',
            '• Certified in core AWS services, architecture, and cloud concepts.'
        ];

        const aiGeneratedText = aiSuggestions[currentClickCount];
        const currentRelevance = certToUpdate.relevance.trim();
        const newRelevance = (currentRelevance === '•' || currentRelevance === '')
            ? aiGeneratedText
            : `${currentRelevance}\n${aiGeneratedText}`;

        updateCertification(id, { ...certToUpdate, relevance: newRelevance, aiClickCount: currentClickCount + 1 });
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

            {certifications.map((cert, index) => (
                <CertificationItem
                    key={cert.id}
                    certification={cert}
                    index={index}
                    onUpdate={updateCertification}
                    onDelete={deleteCertification}
                    onAiWrite={handleAiWrite}
                />
            ))}
            <AddItemButton onClick={addCertification}>
                ADD ANOTHER CERTIFICATION
            </AddItemButton>

            {/* --- ADDED: Main Save Button --- */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllCertifications} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL CERTIFICATIONS'}
                </SaveButton>
            </div>
        </>
    );
};

export default Certifications;