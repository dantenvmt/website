// src/pages/company/career/CareerSearchPage.js

import React from 'react';
import { jobListings } from '../../../data/careerData'; // Note the updated import path

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DropdownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CareerSearchPage = () => {
    return (
        <div className="bg-black text-white min-h-full p-8 md:p-16">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold">Careers at Renaisons</h1>
                </header>

                {/* Search and Filter Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-neutral-800">
                    <div className="flex items-center text-neutral-400">
                        <SearchIcon />
                        <span className="ml-3 font-semibold">{jobListings.length} jobs</span>
                    </div>
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <button className="flex items-center gap-2 text-white font-semibold">
                            All teams <DropdownIcon />
                        </button>
                        <button className="flex items-center gap-2 text-white font-semibold">
                            All locations <DropdownIcon />
                        </button>
                    </div>
                </div>

                {/* Job Listings */}
                <div className="space-y-6">
                    {jobListings.map((job, index) => (
                        <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-neutral-800">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                                <p className="text-neutral-400">{job.department}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-2 md:mt-0">
                                <span className="text-neutral-300">{job.location}</span>
                                <a href={job.applyLink} className="text-white font-semibold hover:underline whitespace-nowrap">
                                    Apply now »
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareerSearchPage;