// src/pages/resume/skills.js
import React, { useState } from 'react'; // Import useState
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal'; // <-- Import reusable modal

const Skills = () => {
    const { skills, setSkills, jobDescription } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);

    // --- ADDED: Modal state ---
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

    // AI write/suggestion logic
    const handleAiWrite = () => {
        if (!jobDescription) {
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'AI Suggestion Error',
                message: 'Please add a job description in the "AI Keyword Analysis" tab first to get AI-powered skill suggestions.',
                isError: true
            });
            return;
        }

        // This is a placeholder for your actual AI suggestion logic
        const aiSkills = "JavaScript, React, Node.js, Python, SQL, AWS, Communication";
        const currentSkills = skills.trim();
        const newSkills = currentSkills ? `${currentSkills}, ${aiSkills}` : aiSkills;

        setSkills(newSkills);
    };

    // Save logic
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
            const response = await fetch('https://renaisons.com/api/save_skill.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume_id: resumeId,
                    skills_description: skills
                }),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.status === 'success') {
                // --- REPLACED: alert with modal ---
                setModalInfo({
                    isOpen: true,
                    title: 'Success!',
                    message: 'Skills saved successfully.',
                    isError: false
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
            console.error('Failed to save skills:', error);
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
                            <label htmlFor="skills" className="block text-xs font-bold text-gray-400 uppercase">
                                SKILLS
                            </label>
                            <button
                                type="button"
                                onClick={handleAiWrite}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1 px-3 rounded-md"
                            >
                                AI Suggest Skills
                            </button>
                        </div>
                        <FormTextarea
                            id="skills"
                            name="skills"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g., Python, React, Data Analysis, Project Management..."
                            rows="10"
                        />
                        <p className="text-xs text-gray-400 mt-2">Enter your skills, separated by commas.</p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <SaveButton type="submit" disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE SKILLS'}
                        </SaveButton>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Skills;