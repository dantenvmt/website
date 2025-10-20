import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ResumeCard from '../../components/resume/ResumeCard';
import { PlusIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import CreateResumeModal from '../../components/resume/CreateResumeModal';

const ResumeDashboardPage = () => {
    const [resumes, setResumes] = useState([]); // State to hold resumes from the database
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState('date');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate(); // Hook for navigation

    const sortOptions = {
        date: 'Edited',
        alphabetical: 'Name',
    };

    // --- Fetch resumes from the server when the component loads ---
    useEffect(() => {
        const fetchResumes = async () => {
            try {
                const response = await fetch('https://renaisons.com/api/get_resumes.php');
                const data = await response.json();

                if (data.status === 'success') {
                    // Sort the fetched resumes by date initially
                    const sorted = data.resumes.sort((a, b) => new Date(b.last_edited) - new Date(a.last_edited));
                    setResumes(sorted);
                } else {
                    console.error("Failed to fetch resumes:", data.message);
                }
            } catch (error) {
                console.error("Error fetching resumes:", error);
            }
        };

        fetchResumes();
    }, []); // The empty array ensures this runs only once on mount

    const handleSort = (sortType) => {
        setCurrentSort(sortType);
        const dataToSort = [...resumes];
        if (sortType === 'date') {
            dataToSort.sort((a, b) => new Date(b.last_edited) - new Date(a.last_edited));
        } else if (sortType === 'alphabetical') {
            dataToSort.sort((a, b) => a.resume_name.localeCompare(b.resume_name));
        }
        setResumes(dataToSort);
        setIsSortMenuOpen(false);
    };

    // --- Function to handle clicking on a resume card ---
    const handleResumeClick = (resume) => {
        navigate(`/resume/${resume.resume_id}/contact`, { state: { resumeName: resume.resume_name } });
    };

    return (
        <div className="text-white min-h-screen p-8">
            <CreateResumeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            {/* Header Section */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Resumes</h1>
                    <p className="text-gray-400">Manage your resumes and cover letters.</p>
                </div>
                <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">
                    Upgrade
                </button>
            </header>

            <div className="flex justify-end items-center mb-6">
                <div className="relative">
                    <button
                        onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                        className="flex items-center text-neutral-300 hover:text-white px-3 py-1 rounded-md"
                    >
                        <span>{sortOptions[currentSort]}</span>
                        <ChevronDownIcon className="h-4 w-4 ml-2" />
                    </button>
                    {isSortMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg z-10">
                            <ul className="py-1">
                                <li
                                    onClick={() => handleSort('date')}
                                    className="flex justify-between items-center px-4 py-2 text-sm text-white hover:bg-neutral-700 cursor-pointer"
                                >
                                    Edited
                                    {currentSort === 'date' && <CheckIcon className="h-4 w-4 text-cyan-400" />}
                                </li>
                                <li
                                    onClick={() => handleSort('alphabetical')}
                                    className="flex justify-between items-center px-4 py-2 text-sm text-white hover:bg-neutral-700 cursor-pointer"
                                >
                                    Name
                                    {currentSort === 'alphabetical' && <CheckIcon className="h-4 w-4 text-cyan-400" />}
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                    <div className="text-center">
                        <PlusIcon className="h-12 w-12 mx-auto text-gray-500" />
                        <p className="mt-2 text-lg font-semibold text-gray-400">Create new resume</p>
                    </div>
                </button>

                {/* --- Map over the fetched resumes and render a card for each --- */}
                {resumes.map((resume) => (
                    <div key={resume.resume_id} onClick={() => handleResumeClick(resume)}>
                        <ResumeCard resume={resume} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResumeDashboardPage;