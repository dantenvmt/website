import React, { useCallback } from 'react';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import DatePicker from '../../components/resume/DatePicker';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import { useParams } from 'react-router-dom';
const CertificateItem = ({ certificate, index, onUpdate, onDelete, onSave }) => {
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onUpdate(certificate.id, { ...certificate, [name]: value });
    };

    const handleDateSelect = (date) => {
        onUpdate(certificate.id, { ...certificate, date: date });
    };

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                    {certificate.name || `Certificate ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(certificate.id)} className="text-gray-500 hover:text-red-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSave(certificate.id); }}>
                <FormInput
                    label="What was the certificate name?*"
                    name="name"
                    value={certificate.name}
                    onChange={handleInputChange}
                    placeholder="Tableau Desktop Specialist"
                />
                <FormInput
                    label={`Where did you get the ${certificate.name || 'Certificate'}?`}
                    name="organization"
                    value={certificate.organization}
                    onChange={handleInputChange}
                    placeholder="Oracle"
                />
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">When did you get the Certificate?</label>
                    <DatePicker
                        value={certificate.date}
                        onSelect={handleDateSelect}
                    />
                </div>
                <FormTextarea
                    label="How is the Certificate relevant?"
                    name="relevance"
                    value={certificate.relevance}
                    onChange={handleInputChange}
                    placeholder="Additional information about the Certificate."
                />

                <div className="flex justify-end pt-4">
                    <SaveButton type="submit">SAVE TO CERTIFICATIONS</SaveButton>
                </div>
            </form>
        </div>
    );
};

const Certifications = () => {
    const { certifications, setCertifications, addCertificate } = useResume();
    const { resumeId } = useParams(); // Get resumeId from URL

    const updateCertificate = useCallback((id, updatedData) => {
        setCertifications(currentCerts =>
            currentCerts.map(cert => (cert.id === id ? updatedData : cert))
        );
    }, [setCertifications]);

    const deleteCertificate = (id) => {
        // If the section is not blank, allow deletion.
        const certToDelete = certifications.find(cert => cert.id === id);
        if (certifications.length > 1 || certToDelete.name) {
            // Future: Add a fetch call to a delete_certification.php script here
            setCertifications(certifications.filter(cert => cert.id !== id));
        } else {
            alert("You must have at least one certification entry, even if it's blank.");
        }
    };

    const saveCertificate = async (id) => {
        if (!resumeId) {
            alert("Error: Cannot save without a resume ID.");
            return;
        }

        const certToSave = certifications.find(cert => cert.id === id);

        // If the entry is completely empty, don't save it.
        if (!certToSave.name && !certToSave.organization && !certToSave.date && !certToSave.relevance) {
            alert("Cannot save an empty certification.");
            return;
        }

        try {
            const response = await fetch('https://renaisons.com/api/save_certification.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...certToSave,
                    resume_id: resumeId // Add the resume_id
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                if (result.certification_id) {
                    updateCertificate(id, { ...certToSave, id: result.certification_id });
                }
                alert(`${certToSave.name || 'Certification'} saved!`);
            } else {
                alert('Error saving certification: ' + result.message);
            }
        } catch (error) {
            console.error('Failed to save certification:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <>
            {certifications.map((cert, index) => (
                <CertificateItem
                    key={cert.id}
                    certificate={cert}
                    index={index}
                    onUpdate={updateCertificate}
                    onDelete={deleteCertificate}
                    onSave={saveCertificate}
                />
            ))}
            <AddItemButton onClick={addCertificate}>
                ADD ANOTHER CERTIFICATE
            </AddItemButton>
        </>
    );
};

export default Certifications;

