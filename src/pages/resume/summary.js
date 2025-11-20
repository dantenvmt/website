// src/pages/resume/summary.js
import React, { useState } from 'react'; // Import useState
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal'; // <-- Import reusable modal

const Summary = () => {
    const { summary, setSummary, jobDescription } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);

    // --- ADDED: Modal state ---
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

    const handleAiWrite = () => {
        if (!jobDescription) {
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'AI Write Error',
                message: 'Please add a job description in the "AI Keyword Analysis" tab first to get an AI-powered summary.',
                isError: true
            });
            return;
        }

        // Placeholder for your actual AI logic
        const aiSummary = "Driven and analytical Data Scientist with 5 years of experience in machine learning and statistical modeling. Proven track record of developing data-driven solutions that drive business growth and efficiency. Proficient in Python, SQL, and AWS.";
        setSummary(aiSummary);
    };

    const handleSave = async () => {
        if (!resumeId) {
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'Save Error',
                message: 'No resume ID found. Cannot save.',
                isError: true
            });
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('https://renaisons.com/api/save_summary.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume_id: resumeId,
                    summaries_description: summary
                }),
            });

            const result = await response.json();

            if (result.status === 'success') {
                // --- REPLACED: alert with modal ---
                setModalInfo({
                    isOpen: true,
                    title: 'Success!',
                    message: 'Summary saved successfully.',
                    isError: false // 'false' for success style
                });
            } else {
                // --- REPLACED: alert with modal ---
                setModalInfo({
                    isOpen: true,
                    title: 'Save Error',
                    message: result.message || 'An unknown server error occurred.',
                    isError: true
                });
            }
        } catch (error) {
            console.error('Failed to save summary:', error);
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'Network Error',
                message: 'A critical error occurred. Please check the console.',
                isError: true
            });
        } finally {
            setIsSaving(false);
        }
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

            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="summary" className="block text-xs font-bold text-gray-400 uppercase">
                                PROFESSIONAL SUMMARY
                            </label>
                            <button
                                type="button"
                                onClick={handleAiWrite}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded-md"
                            >
                                AI Write Summary
                            </button>
                        </div>
                        <FormTextarea
                            id="summary"
                            name="summary"
                            value={summary}
                            onChange={(e) => setSummary(e.targe.value)}
                            placeholder="e.g., Driven Data Scientist with 5 years of experience..."
                            rows="10"
                        />
                        <p className="text-xs text-gray-400 mt-2">Write a brief summary of your career, skills, and goals.</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <SaveButton type="submit" disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE SUMMARY'}
                        </SaveButton>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Summary;