import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import UpdateResumeModal from './UpdateResumeModal'; // Import the new modal

const EditorLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // State for the resume name, dropdown, and edit modal
    const [resumeName, setResumeName] = useState(location.state?.resumeName || 'Untitled Resume');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const navItems = ['Contact', 'Experience', 'Education', 'Certifications', 'Awards', 'Skills', 'Summary'];

    const handleFinish = () => {
        navigate('/resume/final', { state: { resumeName } });
    };

    const handleUpdateName = (newName) => {
        setResumeName(newName);
        setIsEditModalOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${resumeName}"?`)) {
            console.log(`Deleting ${resumeName}...`);
            alert(`Resume "${resumeName}" deleted.`);
            navigate('/resume');
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
                                            <li><button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600" disabled>Duplicate</button></li>
                                            <li><button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600" disabled>Review</button></li>
                                            <li><button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-blue-600" disabled>Download</button></li>
                                            <li><button onClick={handleDelete} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white">Delete</button></li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center bg-[#1e293b] border border-gray-700 rounded-md p-1 space-x-1 flex-wrap">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item}
                                        to={`/resume/${item.toLowerCase()}`}
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
                    <main>{children}</main>
                </div>
            </div>
        </>
    );
};

export default EditorLayout;