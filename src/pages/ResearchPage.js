import React from 'react';
import { researchArticles } from '../data/researchData'; // Import the new data

const ResearchPage = () => {
    return (
        <div className="p-8 md:p-12">
            <h1 className="text-4xl font-bold mb-8">Research</h1>

            {/* Filter and Sort Controls */}
            <div className="flex items-center justify-between mb-12 border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-4 text-neutral-400">
                    <button className="text-white font-semibold">All</button>
                    <button className="hover:text-white">Publication</button>
                    <button className="hover:text-white">Conclusion</button>
                    <button className="hover:text-white">Milestone</button>
                    <button className="hover:text-white">Release</button>
                </div>
                <div className="flex items-center gap-4 text-neutral-400">
                    <button className="hover:text-white flex items-center gap-2">
                        Filter
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6H12M2 10H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                    <button className="hover:text-white flex items-center gap-2">
                        Sort
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8L6 5M3 8L6 11M3 8H13M10 3L13 6M10 13L13 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                </div>
            </div>

            {/* Articles List */}
            <div className="space-y-10">
                {researchArticles.map((article, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="md:col-span-1 text-neutral-400">
                            <p>{article.category}</p>
                            <p className="text-sm">{article.date}</p>
                        </div>
                        <div className="md:col-span-3">
                            <h3 className="text-xl font-semibold mb-2">{article.title}</h3>
                            <p className="text-neutral-400">{article.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResearchPage;
