import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import UpdateResumeModal from './UpdateResumeModal';
import { useResume } from '../../context/ResumeContext';
import ConfirmModal from '../common/ConfirmModal';
import FeedbackModal from '../common/FeedbackModal'; // <-- 1. IMPORT FeedbackModal

const EditorLayout = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { resumeId } = useParams();

    // --- 1. Destructure Data AND Setters from Context ---
    const {
        contact, summary, skills, experiences, educations, projects, awards, certifications,
        setContact, setSummary, setSkills, setExperiences,
        setEducations, setAwards, setCertifications, setProjects
    } = useResume();

    const [isNewAi] = useState(location.state?.isNewAiResume || false);
    // ----------------------
    const [resumeName, setResumeName] = useState(location.state?.resumeName || 'Loading...');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // --- 2. Add Saving State ---

    // State for the "Are you sure?" confirmation modal
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirm'
    });

    // State for the Feedback Modal
    const [feedbackModalState, setFeedbackModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        isError: false
    });

    // --- HOOK 1: DATA LOADING ---
    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const response = await fetch(`https://renaisons.com/api/get_resume_details.php?resume_id=${resumeId}`, {
                    credentials: 'include'
                });
                const result = await response.json();

                if (result.status === 'success' && result.data) {
                    const { data } = result;
                    setResumeName(data.resume_name || 'Untitled Resume');
                    const contactToSet = data.contact_info || {};
                    if (contactToSet.full_name) {
                        contactToSet.fullName = contactToSet.full_name;
                        delete contactToSet.full_name;
                    }

                    // Make sure the API-fetched name gets into the contact object
                    if (!contactToSet.fullName) {
                        contactToSet.fullName = data.resume_name || '';
                    }

                    setContact(contactToSet);
                    setSummary(data.summary?.summaries_description || '');
                    setSkills(data.skills?.skills_description || '');
                    setExperiences(data.experiences || []);
                    setEducations(data.educations || []);
                    setAwards(data.awards || []);
                    setCertifications(data.certifications || []);
                    setProjects(data.projects || []);
                } else {
                    console.error("Failed to fetch resume details:", result.message);
                    setResumeName('Error Loading Name');
                }
            } catch (error) {
                console.error("Error fetching resume data:", error);
            }
        };
        if (resumeId && !isNewAi) {
            fetchResumeData();
        }
    }, [
        resumeId,
        isNewAi,
        navigate,
        setContact,
        setSummary,
        setSkills,
        setExperiences,
        setEducations,
        setAwards,
        setCertifications,
        setProjects
    ]);

    const navItems = ['Contact', 'Experience', 'Education', 'Certifications', 'Awards', 'Skills', 'Projects', 'Summary'];

    // --- 3. UPDATED: Handle Finish (Save All & Navigate) ---
    const handleFinish = async () => {
        if (isSaving) return;
        setIsSaving(true);

        // Helper function to batch save list items (experience, education, etc.)
        const saveList = async (list, endpoint, idField, setter) => {
            const promises = list.map(item => {
                // Basic validation to ensure we don't save empty rows
                let isValid = false;
                if (endpoint.includes('experience')) isValid = !!(item.role || item.company);
                else if (endpoint.includes('education')) isValid = !!(item.degree || item.school);
                else if (endpoint.includes('project')) isValid = !!item.name;
                else if (endpoint.includes('award')) isValid = !!item.name;
                else if (endpoint.includes('certification')) isValid = !!item.name;

                if (isValid) {
                    return fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...item, resume_id: resumeId })
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.status === 'success' && data[idField]) {
                                return { oldId: item.id, newId: data[idField] };
                            }
                            return null;
                        })
                        .catch(() => null);
                }
                return Promise.resolve(null);
            });

            const results = await Promise.all(promises);
            const updates = results.filter(Boolean);

            // Update context with new IDs if successful
            if (updates.length > 0 && setter) {
                setter(prev => prev.map(item => {
                    const update = updates.find(u => u.oldId === item.id);
                    return update ? { ...item, id: update.newId } : item;
                }));
            }
        };

        try {
            // Execute all saves concurrently
            await Promise.all([
                // Single Record Saves
                fetch('https://renaisons.com/api/save_contact.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resume_id: resumeId, ...contact })
                }),
                fetch('https://renaisons.com/api/save_summary.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resume_id: resumeId, summaries_description: summary })
                }),
                fetch('https://renaisons.com/api/save_skill.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resume_id: resumeId, skills_description: skills })
                }),
                // Batch List Saves
                saveList(experiences, 'https://renaisons.com/api/save_experience.php', 'experience_id', setExperiences),
                saveList(educations, 'https://renaisons.com/api/save_education.php', 'education_id', setEducations),
                saveList(projects, 'https://renaisons.com/api/save_project.php', 'project_id', setProjects),
                saveList(awards, 'https://renaisons.com/api/save_award.php', 'award_id', setAwards),
                saveList(certifications, 'https://renaisons.com/api/save_certification.php', 'certification_id', setCertifications),
            ]);

            // Navigate to final preview page after saving
            navigate(`/resume/${resumeId}/final`, { state: { resumeName } });

        } catch (error) {
            console.error("Auto-save error:", error);
            setFeedbackModalState({
                isOpen: true,
                title: 'Save Warning',
                message: 'Some data might not have saved correctly, but we are proceeding to preview.',
                isError: true
            });
            // Proceed after a short delay so user sees the error if they want
            setTimeout(() => {
                navigate(`/resume/${resumeId}/final`, { state: { resumeName } });
            }, 2000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateName = (newName) => {
        setResumeName(newName);
        setIsEditModalOpen(false);
    };

    const handleDeleteClick = () => {
        setModalState({
            isOpen: true,
            title: 'Delete Resume',
            message: `Are you sure you want to permanently delete "${resumeName || 'this resume'}"? This action cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: performDelete
        });
    };

    const performDelete = async () => {
        setModalState({ isOpen: false }); // Close the "are you sure" modal
        try {
            const response = await fetch('https://renaisons.com/api/delete_resume.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_id: resumeId }),
                credentials: 'include',
            });
            const result = await response.json();

            if (result.status === 'success') {
                setFeedbackModalState({
                    isOpen: true,
                    title: 'Success',
                    message: `Resume "${resumeName}" has been deleted.`,
                    isError: false
                });
            } else {
                console.error('API Error:', result.message || 'Unknown error');
                setFeedbackModalState({
                    isOpen: true,
                    title: 'Delete Error',
                    message: result.message || 'Please try again.',
                    isError: true
                });
            }
        } catch (error) {
            console.error('Failed to delete resume:', error);
            setFeedbackModalState({
                isOpen: true,
                title: 'Network Error',
                message: 'A network error occurred while deleting the resume.',
                isError: true
            });
        }
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false });
    };

    const handleFeedbackModalClose = () => {
        if (!feedbackModalState.isError && feedbackModalState.title === 'Success') {
            navigate('/resume');
        }
        setFeedbackModalState({ isOpen: false, title: '', message: '', isError: false });
    };


    return (
        <>
            <UpdateResumeModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateName}
                currentName={resumeName}
            />
            <div className="text-white min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <nav className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div className="flex items-center space-x-4 flex-wrap">
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-2 bg-[#1e293b] border border-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-700"
                                >
                                    <span>{resumeName}</span>
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute top-full mt-2 w-48 bg-[#1e293b] border border-gray-700 rounded-md shadow-lg z-20">
                                        <ul>
                                            <li><button onClick={() => { setIsEditModalOpen(true); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600">Edit</button></li>
                                            <li><button onClick={handleDeleteClick} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white">Delete</button></li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center bg-[#1e293b] border border-gray-700 rounded-md p-1 space-x-1 flex-wrap">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item}
                                        to={`/resume/${resumeId}/${item.toLowerCase()}`}
                                        state={{ ...location.state, resumeName: resumeName }}
                                        className={({ isActive }) =>
                                            `px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                            }`
                                        }
                                    >
                                        {item.toUpperCase()}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleFinish}
                                disabled={isSaving} // Disable button while saving
                                className="bg-blue-600 hover:bg-blue-700 border border-gray-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? 'Saving...' : 'Finish Up & Preview'}
                            </button>
                        </div>
                    </nav>
                    <main>
                        <Outlet />
                    </main>
                </div>
            </div>
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
            />

            {/* Render the feedback modal */}
            {feedbackModalState.isOpen && (
                <FeedbackModal
                    title={feedbackModalState.title}
                    message={feedbackModalState.message}
                    isError={feedbackModalState.isError}
                    onClose={handleFeedbackModalClose}
                />
            )}
        </>
    );
};

export default EditorLayout;