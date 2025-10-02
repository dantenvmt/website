import React, { useState, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';

const AIKeywordAnalysis = () => {
    const { jobDescription, setAiAnalysis, aiAnalysis } = useResume();
    const [selectedKeyword, setSelectedKeyword] = useState(null);

    useEffect(() => {
        if (jobDescription) {
            // This is a placeholder to simulate the AI results
            const analysisData = {
                score: 85,
                matchingKeywords: [
                    { keyword: 'Machine Learning', type: 'matching', resume_mentions: ['- Developed a recommendation engine using collaborative filtering...', 'Skills: Python, Scikit-learn, Machine Learning'], jd_mentions: ['- 5+ years of experience in Machine Learning', '- Strong understanding of ML algorithms'] },
                    { keyword: 'Python', type: 'matching', resume_mentions: ['Skills: Python, Django, Flask', '- Automated data processing scripts in Python'], jd_mentions: ['- Proficiency in Python is a must', '- Experience with Python libraries like Pandas and NumPy'] },
                ],
                missingKeywords: [
                    { keyword: 'Cloud (AWS/GCP)', type: 'missing', resume_mentions: [], jd_mentions: ['- Experience with cloud platforms like AWS or GCP', '- Deploying applications to the cloud'] },
                    { keyword: 'Docker', type: 'missing', resume_mentions: [], jd_mentions: ['- Familiarity with containerization technologies like Docker'] },
                ],
                gap: 'Experience with cloud platforms is missing but required.',
                recommendation: 'Add a project or skill demonstrating experience with AWS, GCP, or Azure.'
            };
            setAiAnalysis(analysisData);
            // Set the first keyword as selected by default
            setSelectedKeyword(analysisData.matchingKeywords[0] || analysisData.missingKeywords[0] || null);
        }
    }, [jobDescription, setAiAnalysis]);


    if (!jobDescription || !aiAnalysis) {
        return (
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-lg">AI Keyword Targeting</h3>
                <p className="text-sm text-gray-400 mt-2">No job description provided. Paste one in the AI builder to see keyword analysis.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-left">
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Overall Match Score</h3>
                <div className="text-center">
                    <p className="text-5xl font-bold text-green-400">{aiAnalysis.score}%</p>
                </div>
            </div>

            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 text-green-400">Matching Keywords</h3>
                <div className="flex flex-wrap gap-2">
                    {aiAnalysis.matchingKeywords.map(item => (
                        <button
                            key={item.keyword}
                            onClick={() => setSelectedKeyword(item)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${selectedKeyword?.keyword === item.keyword ? 'bg-green-500 text-black' : 'bg-gray-700 text-green-300 hover:bg-gray-600'}`}
                        >
                            {item.keyword}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 text-red-400">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                    {aiAnalysis.missingKeywords.map(item => (
                        <button
                            key={item.keyword}
                            onClick={() => setSelectedKeyword(item)}
                            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${selectedKeyword?.keyword === item.keyword ? 'bg-red-500 text-white' : 'bg-gray-700 text-red-300 hover:bg-gray-600'}`}
                        >
                            {item.keyword}
                        </button>
                    ))}
                </div>
            </div>

            {selectedKeyword && (
                <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6 min-h-[200px]">
                    <h3 className="font-bold text-lg mb-4 text-white">{selectedKeyword.keyword}</h3>
                    <div className="text-sm text-gray-400 space-y-4">
                        {selectedKeyword.resume_mentions && selectedKeyword.resume_mentions.length > 0 && (
                            <div>
                                <p className="font-semibold text-gray-300">Found in your resume:</p>
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {selectedKeyword.resume_mentions.map((mention, i) => <li key={i}>{mention}</li>)}
                                </ul>
                            </div>
                        )}
                        {selectedKeyword.jd_mentions && selectedKeyword.jd_mentions.length > 0 && (
                            <div>
                                <p className="font-semibold text-gray-300">Mentioned in the job description:</p>
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                    {selectedKeyword.jd_mentions.map((mention, i) => <li key={i}>{mention}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-2">Analysis & Recommendation</h3>
                <p className="text-sm text-gray-400"><strong className="text-gray-200">Gap:</strong> {aiAnalysis.gap}</p>
                <p className="text-sm text-gray-400"><strong className="text-gray-200">Recommendation:</strong> {aiAnalysis.recommendation}</p>
            </div>
        </div>
    );
};

export default AIKeywordAnalysis;