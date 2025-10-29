import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import UpdateResumeModal from './UpdateResumeModal';
import { useResume } from '../../context/ResumeContext';
import ConfirmModal from '../common/ConfirmModal';

const EditorLayout = () => {

    const location = useLocation();
    const navigate = useNavigate();
    const { resumeId } = useParams();

    const {
        setContact, setSummary, setSkills, setExperiences,
        setEducations, setAwards, setCertifications, setProjects, resetResume
    } = useResume();

    // --- THIS IS THE FIX ---
    // We use useState to "latch" the isNewAiResume flag on the *first render*.
    // This component will now *remember* it's a new AI resume,
    // even if the location.state changes on subsequent tab clicks.
    const [isNewAi] = useState(location.state?.isNewAiResume || false);
    // ----------------------

    const [resumeName, setResumeName] = useState(location.state?.resumeName || 'Loading...');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirm'
    });

    // --- HOOK 1: DATA LOADING ---
    // This hook runs when the page loads. It decides if it needs to fetch.
    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const response = await fetch(`https://renaisons.com/api/get_resume_details.php?resume_id=${resumeId}`, {
                    credentials: 'include'
                });
                const result = await response.json();

                if (result.status === 'success' && result.data) {
                    const { data } = result;

                    const contactToSet = data.contact_info || {};
                    if (contactToSet.full_name) {
                        contactToSet.fullName = contactToSet.full_name;
                        delete contactToSet.full_name;
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
                }
            } catch (error) {
                console.error("Error fetching resume data:", error);
            }
        };

        // If it's a new AI resume (using our "latched" state), DO NOT fetch.
        // Otherwise, fetch the data from the database.
        if (resumeId && !isNewAi) {
            fetchResumeData();
        }

    }, [
        // This effect now only runs when resumeId or isNewAi changes.
        // Since isNewAi is latched, this should only run ONCE on load.
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

    // --- HOOK 2: CLEANUP ---
    // This separate hook runs only once to set up the cleanup.
    // It will *only* call resetResume() when you navigate *away* from EditorLayout.
    useEffect(() => {
        // The return function is the cleanup
        return () => {
            resetResume();
        };
    }, [resetResume]); // This dependency is stable


    const navItems = ['Contact', 'Experience', 'Education', 'Certifications', 'Awards', 'Skills', 'Projects', 'Summary'];

    const handleFinish = () => {
        navigate(`/resume/${resumeId}/final`, { state: { resumeName } });
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
        setModalState({ isOpen: false });
        try {
            const response = await fetch('https://renaisons.com/api/delete_resume.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_id: resumeId }),
                credentials: 'include',
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert(`Resume "${resumeName}" deleted.`);
                navigate('/resume');
            } else {
                console.error('API Error:', result.message || 'Unknown error');
                alert(`Error deleting resume: ${result.message || 'Please try again.'}`);
            }
        } catch (error) {
            console.error('Failed to delete resume:', error);
            alert('A network error occurred while deleting the resume.');
        }
    };

    const handleModalClose = () => {
        setModalState({ isOpen: false });
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
                                        // Pass the *original* location state to persist the flag
                                        state={location.state}
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
                                className="bg-blue-600 hover:bg-blue-700 border border-gray-600 text-white font-bold py-2 px-6 rounded-lg"
                            >
                                Finish Up & Preview
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
        </>
    );
};

export default EditorLayout;