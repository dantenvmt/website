import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

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

// Custom hook to detect clicks outside a component
function useOutsideAlerter(ref, callback) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback]);
}

const CareerSearchPage = () => {
    // State to hold data from the API
    const [allJobs, setAllJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);

    // State for UI visibility
    const [showSearch, setShowSearch] = useState(false);
    const [showTeams, setShowTeams] = useState(false);
    const [showLocations, setShowLocations] = useState(false);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);

    // Refs for detecting outside clicks
    const searchRef = useRef(null);
    const teamsRef = useRef(null);
    const locationsRef = useRef(null);
    useOutsideAlerter(searchRef, () => setShowSearch(false));
    useOutsideAlerter(teamsRef, () => setShowTeams(false));
    useOutsideAlerter(locationsRef, () => setShowLocations(false));

    // ✅ Step 1: Fetch jobs from the server when the component loads
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Fetch data from your backend API
                const response = await fetch('https://renaisons-api.onrender.com/api/jobs');
                const data = await response.json();
                setAllJobs(data); // Store the original list of jobs
            } catch (error) {
                console.error("Failed to fetch jobs:", error);
            }
        };
        fetchJobs();
    }, []); // Empty array ensures this runs only once on mount

    // ✅ Step 2: Apply filters whenever the source data or filter criteria change
    useEffect(() => {
        let currentJobs = [...allJobs]; // Start with the full list of jobs

        if (searchTerm) {
            currentJobs = currentJobs.filter(job => job.title.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedTeams.length > 0) {
            currentJobs = currentJobs.filter(job => selectedTeams.includes(job.department));
        }
        if (selectedLocations.length > 0) {
            currentJobs = currentJobs.filter(job => selectedLocations.includes(job.location));
        }

        setFilteredJobs(currentJobs);
    }, [searchTerm, selectedTeams, selectedLocations, allJobs]); // Re-run when filters or source data change

    // ✅ Step 3: Derive filter options dynamically from the fetched data
    const allTeams = [...new Set(allJobs.map(job => job.department))];
    const allLocations = [...new Set(allJobs.map(job => job.location))];

    // Handlers for checkbox changes
    const handleTeamChange = (team) => {
        setSelectedTeams(prev => prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]);
    };
    const handleLocationChange = (location) => {
        setSelectedLocations(prev => prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]);
    };

    return (
        <div className="bg-black text-white min-h-full p-8 md:p-16">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold">Careers at Renaisons</h1>
                </header>

                <div className="flex flex-col md:flex-row justify-between items-center mb-10 pb-6 border-b border-neutral-800">
                    <div className="flex items-center text-neutral-400">
                        <button onClick={() => setShowSearch(true)} className="p-2 -ml-2 hover:bg-neutral-800 rounded-full">
                            <SearchIcon />
                        </button>
                        <span className="ml-3 font-semibold">{filteredJobs.length} jobs</span>
                    </div>
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        {/* Teams Dropdown */}
                        <div className="relative" ref={teamsRef}>
                            <button onClick={() => setShowTeams(!showTeams)} className="flex items-center gap-2 text-white font-semibold">
                                All teams <DropdownIcon />
                            </button>
                            {showTeams && (
                                <div className="absolute right-0 top-full mt-2 w-60 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg p-4 z-10">
                                    <ul className="space-y-2">
                                        {allTeams.map(team => (
                                            <li key={team}><label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" className="form-checkbox bg-neutral-900 border-neutral-600 text-blue-500 rounded focus:ring-blue-500" checked={selectedTeams.includes(team)} onChange={() => handleTeamChange(team)} /><span>{team}</span></label></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {/* Location Dropdown */}
                        <div className="relative" ref={locationsRef}>
                            <button onClick={() => setShowLocations(!showLocations)} className="flex items-center gap-2 text-white font-semibold">
                                All locations <DropdownIcon />
                            </button>
                            {showLocations && (
                                <div className="absolute right-0 top-full mt-2 w-60 bg-neutral-800 border border-neutral-700 rounded-md shadow-lg p-4 z-10">
                                    <ul className="space-y-2">
                                        {allLocations.map(location => (
                                            <li key={location}><label className="flex items-center space-x-3 cursor-pointer"><input type="checkbox" className="form-checkbox bg-neutral-900 border-neutral-600 text-blue-500 rounded focus:ring-blue-500" checked={selectedLocations.includes(location)} onChange={() => handleLocationChange(location)} /><span>{location}</span></label></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {showSearch && (
                    <div ref={searchRef} className="mb-10 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                        <div className="relative"><input type="text" placeholder="Filter jobs by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded-md py-2 px-4 text-white placeholder-neutral-500 focus:outline-none" autoFocus /></div>
                    </div>
                )}

                <div className="space-y-6">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <div key={job._id} className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-neutral-800">
                                <div>
                                    <Link to={`/company/careers/jobs/${job._id}`}>
                                        <h3 className="text-lg font-semibold text-white hover:underline">{job.title}</h3>
                                    </Link>
                                    <p className="text-neutral-400">{job.department}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                    <span className="text-neutral-300">{job.location}</span>
                                    <Link to={`/company/careers/jobs/${job._id}`}>
                                        <a href={job.applyLink} className="text-white font-semibold hover:underline whitespace-nowrap">
                                            Apply now »
                                        </a>
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-neutral-500 py-10">No jobs found matching your criteria.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CareerSearchPage;