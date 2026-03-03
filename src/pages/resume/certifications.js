// src/pages/resume/certifications.js
import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal';

const CertificationItem = ({ certification, index, onUpdate, onDelete }) => {
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
            <form className="space-y-6">
                <FormInput label="CERTIFICATION NAME *" name="name" value={certification.name} onChange={(e) => onUpdate(certification.id, { ...certification, name: e.target.value })} placeholder="e.g., Certified TensorFlow Developer" />
                <FormInput label="ISSUING ORGANIZATION *" name="organization" value={certification.organization} onChange={(e) => onUpdate(certification.id, { ...certification, organization: e.target.value })} placeholder="e.g., Google" />
                <FormInput label="DATE ISSUED" name="date" value={certification.date} onChange={(e) => onUpdate(certification.id, { ...certification, date: e.target.value })} placeholder="e.g., May 2024" />
            </form>
        </div>
    );
};

const Certifications = () => {
    const { certifications, setCertifications, addCertification } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);
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
            setModalInfo({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You must have at least one certification entry.',
                isError: true
            });
        }
    };

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

            {certifications.map((cert, index) => (
                <CertificationItem
                    key={cert.id}
                    certification={cert}
                    index={index}
                    onUpdate={updateCertification}
                    onDelete={deleteCertification}
                />
            ))}
            <AddItemButton onClick={addCertification}>
                ADD ANOTHER CERTIFICATION
            </AddItemButton>

            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllCertifications} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL CERTIFICATIONS'}
                </SaveButton>
            </div>
        </>
    );
};

export default Certifications;