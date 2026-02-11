import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Mock Data based on your screenshot
const rolesData = [
    {
        id: 1,
        title: "Technical Professionals for Paid Research...",
        rate: "$150",
        hiredCount: 51,
        avatars: ['bg-blue-500', 'bg-red-500', 'bg-indigo-500'],
        initials: ['J', 'S', 'B']
    },
    {
        id: 2,
        title: "Lawyers",
        rate: "$90-$150/hr",
        hiredCount: 43,
        avatars: ['bg-orange-500', 'bg-teal-500', 'bg-purple-500'],
        initials: ['C', 'A', 'T']
    },
    {
        id: 3,
        title: "Sales Representatives, Wholesale and...",
        rate: "$90-$150/hr",
        hiredCount: 27,
        avatars: ['bg-purple-500', 'bg-yellow-600', 'bg-green-500'],
        initials: ['A', 'M', 'R']
    },
    {
        id: 4,
        title: "General and Operations Managers",
        rate: "$90-$150/hr",
        hiredCount: 4,
        avatars: ['bg-gray-500', 'bg-blue-400', 'bg-indigo-600'],
        initials: ['D', 'C', 'R']
    },
    {
        id: 5,
        title: "Personal Financial Advisors",
        rate: "$90-$150/hr",
        hiredCount: 47,
        avatars: ['bg-red-600', 'bg-gray-600', 'bg-blue-900'],
        initials: ['E', 'L', 'M']
    },
    {
        id: 6,
        title: "Securities, Commodities, and Financial...",
        rate: "$90-$150/hr",
        hiredCount: 40,
        avatars: ['bg-pink-500', 'bg-green-600', 'bg-gray-700'],
        initials: ['K', 'T', 'S']
    },
    {
        id: 7,
        title: "Project Management Specialists",
        rate: "$90-$150/hr",
        hiredCount: 26,
        avatars: ['bg-orange-400', 'bg-pink-600', 'bg-purple-600'],
        initials: ['P', 'Y', 'J']
    },
    {
        id: 8,
        title: "Software Engineer (Code QA)",
        rate: "$70-$120/hr",
        hiredCount: 54,
        avatars: ['bg-purple-400', 'bg-blue-600', 'bg-orange-500'],
        initials: ['B', 'N', 'D']
    }
];

const LatestRoles = () => {
    // Pagination states (ready for when you add more than 8 items)
    const [currentPage, setCurrentPage] = useState(0);

    return (
        <section className="py-12 bg-black px-6 md:px-12">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-white">Latest roles</h2>

                    {/* Navigation Arrows */}
                    <div className="flex space-x-2">
                        <button className="p-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                            <ChevronLeftIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                            <ChevronRightIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rolesData.map((role) => (
                        <div
                            key={role.id}
                            className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors group cursor-pointer"
                        >
                            {/* Top Content */}
                            <div>
                                <h3 className="text-sm font-medium text-white truncate" title={role.title}>
                                    {role.title}
                                </h3>
                                <p className="text-sm text-neutral-400 mt-1">
                                    {role.rate}
                                </p>
                            </div>

                            {/* Bottom Content */}
                            <div className="mt-8 flex items-center justify-between">

                                {/* Avatar Group & Hire Count */}
                                <div className="flex items-center">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {role.avatars.map((colorClass, idx) => (
                                            <div
                                                key={idx}
                                                className={`inline-block h-6 w-6 rounded-full ring-2 ring-neutral-900 flex items-center justify-center text-[10px] font-bold text-white ${colorClass}`}
                                            >
                                                {role.initials[idx]}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-neutral-500 ml-3">
                                        {role.hiredCount} hired recently
                                    </span>
                                </div>

                                {/* Apply Action */}
                                <button className="text-sm font-medium text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-300">
                                    Apply
                                </button>
                                {/* Fallback visible text for mobile (doesn't rely on hover) */}
                                <span className="text-sm font-medium text-neutral-500 group-hover:hidden md:hidden">
                                    Apply
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default LatestRoles;