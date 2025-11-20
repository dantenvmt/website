// src/pages/resume/projects.js
import React, { useState, useCallback } from 'react'; // Import useState & useCallback
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import AddItemButton from '../../components/common/AddItemButton';
import FormInput from '../../components/resume/FormInput';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal'; // <-- Import reusable modal

// --- ProjectItem Component ---
// No save logic, just displays data and calls update functions
const ProjectItem = ({ project, index, onUpdate, onDelete, onAiWrite }) => {
    const remainingAiWrites = 3 - (project.aiClickCount || 0);

    return (
        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold">
                    {project.name || `Project ${index + 1}`}
                </h2>
                <button onClick={() => onDelete(project.id)} className="text-gray-500 hover:text-red-500 flex-shrink-0 ml-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            {/* REMOVED: onSubmit from form tag */}
            <form className="space-y-6">
                <FormInput label="PROJECT NAME *" name="name" value={project.name} onChange={(e) => onUpdate(project.id, { ...project, name: e.target.value })} placeholder="e.g., AI Resume Optimizer" />
                <FormInput label="DATE" name="date" value={project.date} onChange={(e) => onUpdate(project.id, { ...project, date: e.target.value })} placeholder="e.g., May 2024" />

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase">PROJECT DESCRIPTION & RELEVANCE</label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => onAiWrite(project.id)}
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
                        value={project.relevance}
                        onChange={(e) => onUpdate(project.id, { ...project, relevance: e.target.value })}
                        rows="6"
                    />
                </div>

                {/* --- REMOVED: Individual Save Button --- */}
            </form>
        </div>
    );
};

// --- Projects Component (Main) ---
const Projects = () => {
    const { projects, setProjects, addProject } = useResume();
    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);

    // --- ADDED: Modal state ---
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

    const updateProject = useCallback((id, updatedData) => {
        setProjects(currentProjects =>
            currentProjects.map(proj => (proj.id === id ? updatedData : proj))
        );
    }, [setProjects]);

    const deleteProject = (id) => {
        if (projects.length > 1) {
            setProjects(projects.filter(proj => proj.id !== id));
        } else {
            // --- REPLACED: alert with modal ---
            setModalInfo({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You must have at least one project entry.',
                isError: true
            });
        }
    };

    // --- ADDED: saveAllProjects function ---
    const saveAllProjects = async () => {
        if (!resumeId) {
            setModalInfo({
                isOpen: true,
                title: 'Save Error',
                message: 'Cannot save projects without a resume ID.',
                isError: true
            });
            return;
        }
        if (isSaving) return;
        setIsSaving(true);

        let saveErrors = 0;
        const savePromises = projects.map(proj => {
            // Only save if it has a name
            if (proj.name) {
                return fetch('https://renaisons.com/api/save_project.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...proj, resume_id: resumeId }),
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 'success' && result.project_id) {
                            return { oldId: proj.id, newId: result.project_id };
                        } else if (result.status !== 'success') {
                            saveErrors++;
                            console.error(`Error saving project "${proj.name || 'New'}": ${result.message}`);
                        }
                        return null;
                    })
                    .catch(error => {
                        saveErrors++;
                        console.error(`Network error saving project "${proj.name || 'New'}":`, error);
                        return null;
                    });
            }
            return Promise.resolve(null);
        });

        try {
            const results = await Promise.all(savePromises);

            const updates = results.filter(Boolean);
            if (updates.length > 0) {
                setProjects(currentProjects =>
                    currentProjects.map(proj => {
                        const update = updates.find(u => u.oldId === proj.id);
                        return update ? { ...proj, id: update.newId } : proj;
                    })
                );
            }

            if (saveErrors > 0) {
                setModalInfo({
                    isOpen: true,
                    title: 'Save Complete (with errors)',
                    message: `Successfully saved ${projects.length - saveErrors} entries. ${saveErrors} entries failed to save. Please check console for details.`,
                    isError: true
                });
            } else {
                setModalInfo({
                    isOpen: true,
                    title: 'Success!',
                    message: 'All project entries saved successfully.',
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
        const projectToUpdate = projects.find(proj => proj.id === id);
        const currentClickCount = projectToUpdate.aiClickCount || 0;

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
            '• Developed a full-stack web application using React, Node.js, and PostgreSQL to track user analytics.',
            '• Deployed a machine learning model on AWS SageMaker with a CI/CD pipeline, reducing inference time by 30%.',
            '• Led a team of 3 to build a mobile app, resulting in 10,000+ downloads in the first month.'
        ];

        const aiGeneratedText = aiSuggestions[currentClickCount];
        const currentRelevance = projectToUpdate.relevance.trim();
        const newRelevance = (currentRelevance === '•' || currentRelevance === '')
            ? aiGeneratedText
            : `${currentRelevance}\n${aiGeneratedText}`;

        updateProject(id, { ...projectToUpdate, relevance: newRelevance, aiClickCount: currentClickCount + 1 });
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

            {projects.map((proj, index) => (
                <ProjectItem
                    key={proj.id}
                    project={proj}
                    index={index}
                    onUpdate={updateProject}
                    onDelete={deleteProject}
                    onAiWrite={handleAiWrite}
                />
            ))}
            <AddItemButton onClick={addProject}>
                ADD ANOTHER PROJECT
            </AddItemButton>

            {/* --- ADDED: Main Save Button --- */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-700">
                <SaveButton onClick={saveAllProjects} disabled={isSaving}>
                    {isSaving ? 'SAVING ALL...' : 'SAVE ALL PROJECTS'}
                </SaveButton>
            </div>
        </>
    );
};

export default Projects;