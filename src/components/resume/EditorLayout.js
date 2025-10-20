import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import UpdateResumeModal from './UpdateResumeModal';
import { useResume } from '../../context/ResumeContext'; // Import the useResume hook

const EditorLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { resumeId } = useParams();

    // Get the setter functions from your context
    const { setContact, setSummary, setSkills, setExperiences, setEducations, setAwards, setCertifications, setProjects, resetResume } = useResume();

    const [resumeName, setResumeName] = useState(location.state?.resumeName || 'Loading...');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                const response = await fetch(`/api/get_resume_details.php?resume_id=${resumeId}`);
                const result = await response.json();

                if (result.status === 'success' && result.data) {
                    const { data } = result;
                    const contactInfo = data.contact_info || {};
                    if (contactInfo.full_name) {
                        contactInfo.fullName = contactInfo.full_name;
                        delete contactInfo.full_name;
                    }
                    setContact(contactInfo);
                    setSummary(data.summary?.summaries_description || '');
                    setSkills(data.skills?.skills_description || '');
                    setExperiences(data.experiences || []);
                    setEducations(data.educations || []);
                    setAwards(data.awards || []);
                    setCertifications(data.certifications || []);
                    setProjects(data.projects || []);
                } else {
                    console.error("Failed to fetch resume details:", result.message);
                    navigate('/resume');
                }
            } catch (error) {
                console.error("Error fetching resume data:", error);
            }
        };

        if (resumeId) {
            fetchResumeData();
        }

        return () => {
            resetResume();
        };
    }, [
        resumeId,
        navigate,
        setContact,
        setSummary,
        setSkills,
        setExperiences,
        setEducations,
        setAwards,
        setCertifications,
        setProjects,
        resetResume
    ]); // <-- CORRECTED: All dependencies are now included


    const navItems = ['Contact', 'Experience', 'Education', 'Certifications', 'Awards', 'Skills', 'Projects', 'Summary'];

    const handleFinish = () => {
        navigate(`/resume/${resumeId}/final`, { state: { resumeName } });
    };

    const handleUpdateName = (newName) => {
        setResumeName(newName);
        setIsEditModalOpen(false);
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${resumeName}"?`)) {
            try {
                await fetch('https://renaisons.com/api/delete_resume.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resume_id: resumeId }),
                });
                alert(`Resume "${resumeName}" deleted.`);
                navigate('/resume');
            } catch (error) {
                console.error('Failed to delete resume:', error);
            }
        }
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
                                            <li><button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white">Delete</button></li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center bg-[#1e293b] border border-gray-700 rounded-md p-1 space-x-1 flex-wrap">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item}
                                        to={`/resume/${resumeId}/${item.toLowerCase()}`}
                                        state={{ resumeName }}
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
        </>
    );
};

export default EditorLayout;