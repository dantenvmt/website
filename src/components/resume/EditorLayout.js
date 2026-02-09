// src/components/resume/EditorLayout.js
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import UpdateResumeModal from './UpdateResumeModal';
import { useResume } from '../../context/ResumeContext';
import ConfirmModal from '../common/ConfirmModal';
import FeedbackModal from '../common/FeedbackModal';

const EditorLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resumeId } = useParams();

    // --- 1. Get Setters and Data from Context ---
    const {
        contact, summary, skills, experiences, educations, projects, awards, certifications,
        setContact, setSummary, setSkills, setExperiences,
        setEducations, setAwards, setCertifications, setProjects
    } = useResume();

    // State
    const [resumeName, setResumeName] = useState(location.state?.resumeName || 'Loading...');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isNewAi] = useState(location.state?.isNewAiResume || false); // Flag to skip fetch if just created

    // Modals
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, confirmText: 'Confirm' });
    const [feedbackModalState, setFeedbackModalState] = useState({ isOpen: false, title: '', message: '', isError: false });

    // --- 2. DATA LOADING (THE FIX) ---
    useEffect(() => {
        const fetchResumeData = async () => {
            // If we just used AI to create this, the Context is already full. Don't overwrite it with empty DB data yet.
            if (isNewAi) {
                console.log("Skipping fetch: New AI Resume detected.");
                return;
            }

            try {
                // Fetch the structured data from the PHP file you just created
                const response = await fetch(`https://renaisons.com/api/get_resume_details.php?resume_id=${resumeId}`, {
                    credentials: 'include'
                });
                const result = await response.json();

                if (result.status === 'success' && result.data) {
                    const dbData = result.data;

                    // A. Set Resume Name (Title)
                    setResumeName(dbData.resume_name || 'Untitled Resume');

                    // B. Map Contact Info (DB snake_case -> Context camelCase)
                    // We explicitly map columns because Context expects 'fullName', DB has 'full_name'
                    const rawContact = dbData.contact_info || {};
                    const mappedContact = {
                        fullName: rawContact.full_name || rawContact.fullName || '',
                        email: rawContact.email || '',
                        phone: rawContact.phone || '',
                        linkedin: rawContact.linkedin || '',
                        website: rawContact.website || '',
                        city: rawContact.city || '',
                        state: rawContact.state || '',
                        country: rawContact.country || ''
                    };
                    // If DB contact is empty, fallback to resume name (but prefer empty so placeholder shows)
                    if (!mappedContact.fullName && dbData.resume_name) {
                        // Only force filename if absolutely nothing else exists
                        // mappedContact.fullName = dbData.resume_name; 
                    }
                    setContact(mappedContact);

                    // C. Map Simple Strings (Summary & Skills)
                    // DB returns an object { summaries_description: "..." }, Context wants a STRING.
                    setSummary(dbData.summary?.summaries_description || '');
                    setSkills(dbData.skills?.skills_description || '');

                    // D. Map Arrays (Context 'mapAndSetData' handles the camelCase conversion for these)
                    setExperiences(dbData.experiences || []);
                    setEducations(dbData.educations || []);
                    setProjects(dbData.projects || []);
                    setAwards(dbData.awards || []);
                    setCertifications(dbData.certifications || []);

                } else {
                    console.error("Failed to load resume data:", result.message);
                }
            } catch (error) {
                console.error("Network error fetching resume:", error);
            }
        };

        if (resumeId) {
            fetchResumeData();
        }
    }, [resumeId, isNewAi, setContact, setSummary, setSkills, setExperiences, setEducations, setProjects, setAwards, setCertifications]);


    // --- 3. SAVE FUNCTIONALITY ---
    const handleFinish = async () => {
        if (isSaving) return;
        setIsSaving(true);

        // Helper for array saving
        const saveList = async (list, endpoint, idField, setter) => {
            const promises = list.map(item => {
                // Validate item has at least some data
                let isValid = false;
                if (endpoint.includes('experience')) isValid = !!(item.role || item.company);
                else if (endpoint.includes('education')) isValid = !!(item.degree || item.school);
                else if (endpoint.includes('project')) isValid = !!item.name;
                else if (endpoint.includes('award')) isValid = !!item.name;
                else if (endpoint.includes('certification')) isValid = !!item.name;

                if (isValid) {
                    // Ensure we send snake_case to DB if needed, or rely on PHP to handle it
                    // Sending the whole item is usually safe if PHP maps it.
                    return fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...item, resume_id: resumeId })
                    }).then(res => res.json()).then(d => d.status === 'success' ? { oldId: item.id, newId: d[idField] } : null).catch(() => null);
                }
                return Promise.resolve(null);
            });

            const results = await Promise.all(promises);
            // Update IDs in context so we don't create duplicates next save
            const updates = results.filter(Boolean);
            if (updates.length > 0 && setter) {
                setter(prev => prev.map(p => {
                    const u = updates.find(up => up.oldId === p.id);
                    return u ? { ...p, id: u.newId } : p;
                }));
            }
        };

        try {
            await Promise.all([
                // Save Single Objects
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
                // Save Arrays
                saveList(experiences, 'https://renaisons.com/api/save_experience.php', 'experience_id', setExperiences),
                saveList(educations, 'https://renaisons.com/api/save_education.php', 'education_id', setEducations),
                saveList(projects, 'https://renaisons.com/api/save_project.php', 'project_id', setProjects),
                saveList(awards, 'https://renaisons.com/api/save_award.php', 'award_id', setAwards),
                saveList(certifications, 'https://renaisons.com/api/save_certification.php', 'certification_id', setCertifications),
            ]);

            navigate(`/resume/${resumeId}/final`, { state: { resumeName } });

        } catch (error) {
            console.error("Save error:", error);
            setFeedbackModalState({
                isOpen: true,
                title: 'Save Warning',
                message: 'Data saved, but a network check failed. Proceeding to preview.',
                isError: true
            });
            setTimeout(() => navigate(`/resume/${resumeId}/final`, { state: { resumeName } }), 2000);
        } finally {
            setIsSaving(false);
        }
    };

    // --- 4. RENAME & DELETE HANDLERS ---
    const handleUpdateName = (newName) => {
        setResumeName(newName);
        setIsEditModalOpen(false);
    };

    const handleDeleteClick = () => {
        setModalState({
            isOpen: true,
            title: 'Delete Resume',
            message: `Are you sure you want to delete "${resumeName}"? This cannot be undone.`,
            confirmText: 'Delete',
            onConfirm: performDelete
        });
    };

    const performDelete = async () => {
        setModalState({ isOpen: false });
        try {
            const res = await fetch('https://renaisons.com/api/delete_resume.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_id: resumeId }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status === 'success') {
                navigate('/resume');
            } else {
                setFeedbackModalState({ isOpen: true, title: 'Error', message: data.message || 'Delete failed', isError: true });
            }
        } catch (e) {
            setFeedbackModalState({ isOpen: true, title: 'Error', message: 'Network error', isError: true });
        }
    };

    const navItems = ['Contact', 'Experience', 'Education', 'Certifications', 'Awards', 'Skills', 'Projects', 'Summary'];

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
                    {/* NAV BAR */}
                    <nav className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div className="flex items-center space-x-4 flex-wrap">
                            {/* Dropdown Title */}
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
                                            <li><button onClick={() => { setIsEditModalOpen(true); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600">Rename</button></li>
                                            <li><button onClick={handleDeleteClick} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white">Delete</button></li>
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Section Tabs */}
                            <div className="flex items-center bg-[#1e293b] border border-gray-700 rounded-md p-1 space-x-1 flex-wrap">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item}
                                        to={`/resume/${resumeId}/${item.toLowerCase()}`}
                                        state={{ ...location.state, resumeName }}
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

                        {/* Finish Button */}
                        <div>
                            <button
                                onClick={handleFinish}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 border border-gray-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {isSaving ? 'Saving...' : 'Finish Up & Preview'}
                            </button>
                        </div>
                    </nav>

                    {/* MAIN CONTENT AREA */}
                    <main>
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
            />
            {feedbackModalState.isOpen && (
                <FeedbackModal
                    title={feedbackModalState.title}
                    message={feedbackModalState.message}
                    isError={feedbackModalState.isError}
                    onClose={() => setFeedbackModalState({ ...feedbackModalState, isOpen: false })}
                />
            )}
        </>
    );
};

export default EditorLayout;