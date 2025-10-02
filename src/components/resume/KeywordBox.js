import React, { useState } from 'react';

const KeywordBox = ({ keywordData, type }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { keyword, resume_mentions, jd_mentions } = keywordData;

    const isMatching = type === 'matching';

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-3 flex justify-between items-center hover:bg-gray-700 focus:outline-none"
            >
                <span className={`font-bold ${isMatching ? 'text-green-400' : 'text-red-400'}`}>{keyword}</span>
                <svg
                    className={`w-5 h-5 text-gray-300 transition-transform transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            {isExpanded && (
                <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
                    {isMatching && resume_mentions && resume_mentions.length > 0 && (
                        <div className="mb-3">
                            <p className="font-semibold text-gray-300">Found in your resume:</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {resume_mentions.map((mention, i) => <li key={i}>{mention}</li>)}
                            </ul>
                        </div>
                    )}
                    {jd_mentions && jd_mentions.length > 0 && (
                        <div>
                            <p className="font-semibold text-gray-300">Mentioned in the job description:</p>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                                {jd_mentions.map((mention, i) => <li key={i}>{mention}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default KeywordBox;