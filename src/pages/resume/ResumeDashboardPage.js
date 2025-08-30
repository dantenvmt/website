import React, { useState, useEffect } from 'react';
import { resumeData } from '../../data/resumeData';
import ResumeCard from '../../components/resume/ResumeCard';
import { PlusIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
const ResumeDashboardPage = () => {
    const [sortedResumes, setSortedResumes] = useState([]);
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
    const [currentSort, setCurrentSort] = useState('date');

    const sortOptions = {
        date: 'Edited',
        alphabetical: 'Name',
    };

    useEffect(() => {
        handleSort('date');
    }, []);

    const handleSort = (sortType) => {
        setCurrentSort(sortType);
        const dataToSort = [...resumeData];
        //sort by
        if (sortType === 'date') {
            dataToSort.sort((a, b) => b.date - a.date);
        } else if (sortType === 'alphabetical') {
            dataToSort.sort((a, b) => a.title.localeCompare(b.title));
        }

        setSortedResumes(dataToSort);
        setIsSortMenuOpen(false);
    };

    return (
        <div className="text-white min-h-screen p-8">
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

                <Link to="/resume/contact" className="flex items-center justify-center bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg hover:border-cyan-500 transition-colors duration-300 cursor-pointer" style={{ minHeight: '220px' }}>
                    <div className="text-center">
                        <PlusIcon className="h-12 w-12 mx-auto text-gray-500" />
                        <p className="mt-2 text-lg font-semibold text-gray-400">Create new resume</p>
                    </div>
                </Link>

                {sortedResumes.map((resume) => (
                    <ResumeCard key={resume.id} resume={resume} />
                ))}
            </div>
        </div>
    );
};

export default ResumeDashboardPage;