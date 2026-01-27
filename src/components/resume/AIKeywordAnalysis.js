import React, { useState, useMemo, useEffect } from 'react';
import { useResume } from '../../context/ResumeContext';
import { ArrowPathIcon, PencilSquareIcon, ExclamationCircleIcon, SparklesIcon, ChevronUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// --- Sub-Component: Animated Score Gauge ---
const ScoreGauge = ({ score }) => {
    // Determine color based on score
    let colorClass = "text-red-500";
    if (score >= 80) colorClass = "text-green-500";
    else if (score >= 60) colorClass = "text-yellow-500";

    // SVG Geometry
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="transform -rotate-90 w-24 h-24">
                {/* Track Circle (Gray) */}
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-700/50"
                />
                {/* Progress Circle (Colored) */}
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                />
            </svg>

            {/* Centered Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-xl font-bold ${colorClass}`}>{score}%</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Match</span>
            </div>
        </div>
    );
};

// --- Sub-Component: Keyword Accordion ---
const KeywordAccordion = ({ item, type, isOpen, onToggle }) => {
    const keywordText = item.keyword || item;
    const count = item.count || 0;
    const jdContext = item.jdContext || [];
    const resumeContext = item.resumeContext || [];

    const isMissing = type === 'missing';
    const isMatching = type === 'matching';
    const isPredicted = type === 'predicted';

    let badgeColor = "bg-gray-700 text-gray-300 border-gray-600";
    if (isMatching) badgeColor = "bg-green-950/30 text-green-300 border-green-900/50 hover:border-green-500";
    if (isMissing) badgeColor = "bg-red-950/30 text-red-300 border-red-900/50 hover:border-red-500";
    if (isPredicted) badgeColor = "bg-purple-950/30 text-purple-300 border-purple-900/50 hover:border-purple-500";

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer select-none flex items-center gap-2 hover:brightness-110 ${badgeColor}`}
            >
                {keywordText}
                {count > 0 && <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">x{count}</span>}
            </button>
        );
    }

    return (
        <div className="w-full bg-gray-800/90 border border-gray-600 rounded-lg p-4 my-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
            <div
                className="flex justify-between items-center cursor-pointer mb-4 border-b border-gray-700 pb-2"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    <h4 className={`font-bold text-lg ${isMissing ? 'text-red-400' : isMatching ? 'text-green-400' : 'text-purple-400'}`}>
                        {keywordText}
                    </h4>
                    {count > 0 && <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded-md border border-gray-600">Found {count} times</span>}
                </div>
                <button className="text-gray-400 hover:text-white p-1">
                    <ChevronUpIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        Job Requirement
                    </p>
                    {jdContext.length > 0 ? (
                        <ul className="space-y-2">
                            {jdContext.map((ctx, idx) => (
                                <li key={idx} className="text-xs text-gray-300 italic bg-black/30 p-2 rounded border-l-2 border-blue-500/50">
                                    "{ctx}"
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-gray-500 italic p-2">Context implied or general requirement.</p>
                    )}
                </div>

                {isMatching && (
                    <div className="space-y-2">
                        <p className="text-[10px] uppercase tracking-wider text-green-400 font-bold flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Found in Your Resume
                        </p>
                        {resumeContext.length > 0 ? (
                            <ul className="space-y-2">
                                {resumeContext.map((ctx, idx) => (
                                    <li key={idx} className="text-xs text-green-100 italic bg-green-900/20 p-2 rounded border-l-2 border-green-500/50">
                                        "{ctx}"
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-500 italic p-2">Keyword matched, but exact sentence context not retrieved.</p>
                        )}
                    </div>
                )}

                {isMissing && (
                    <div className="md:col-span-2 pt-2 mt-1 border-t border-gray-700/50">
                        <p className="text-xs text-red-300 flex items-start gap-2 bg-red-900/10 p-2 rounded">
                            <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span><strong>Tip:</strong> Add a bullet point to your experience containing "{keywordText}" to satisfy the requirements on the left.</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AIKeywordAnalysis = () => {
    const {
        jobDescription, setJobDescription,
        summary, skills, experiences, educations, projects, certifications, awards,
        aiAnalysis, setAiAnalysis
    } = useResume();

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isEditingJD, setIsEditingJD] = useState(!jobDescription);
    const [localJdInput, setLocalJdInput] = useState(jobDescription || '');
    const [error, setError] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const handleToggle = (id) => {
        setExpandedId(prevId => (prevId === id ? null : id));
    };

    const fullResumeText = useMemo(() => {
        const parts = [
            `Summary: ${summary}`,
            `Skills: ${skills}`,
            ...experiences.map(e => `Role: ${e.role} at ${e.company}. Details: ${e.bullets}`),
            ...educations.map(e => `Education: ${e.degree} at ${e.school}. Details: ${e.bullets}`),
            ...projects.map(p => `Project: ${p.name}. Details: ${p.relevance}`),
            ...certifications.map(c => `Certification: ${c.name}. Details: ${c.relevance}`),
            ...awards.map(a => `Award: ${a.name}. Details: ${a.relevance}`)
        ];
        return parts.join('\n\n');
    }, [summary, skills, experiences, educations, projects, certifications, awards]);

    const handleAnalyze = async () => {
        if (!localJdInput.trim()) return;
        setIsAnalyzing(true);
        setError(null);
        setJobDescription(localJdInput);

        try {
            const response = await fetch('https://renaisons.com/api/analyze_resume.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume_text: fullResumeText,
                    job_description: localJdInput
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.status === 'success' && data.analysis) {
                const parsedAnalysis = typeof data.analysis === 'string'
                    ? JSON.parse(data.analysis)
                    : data.analysis;
                setAiAnalysis(parsedAnalysis);
                setIsEditingJD(false);
                setExpandedId(null);
            } else {
                setError(data.message || 'Failed to analyze resume.');
            }
        } catch (err) {
            console.error("AI Analysis Error:", err);
            setError('Network error or invalid response from AI.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isEditingJD || !jobDescription) {
        return (
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6 shadow-lg">
                <h3 className="font-bold text-lg text-white mb-2">Target Job Description</h3>
                <p className="text-xs text-gray-400 mb-4">Paste the JD. We'll find matching keywords and context.</p>
                <textarea
                    className="w-full h-48 bg-gray-900 border border-gray-700 rounded-md p-3 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                    placeholder="Paste Job Description..."
                    value={localJdInput}
                    onChange={(e) => setLocalJdInput(e.target.value)}
                />
                {error && <div className="mt-3 flex items-center text-red-400 text-sm"><ExclamationCircleIcon className="h-5 w-5 mr-2" />{error}</div>}
                <div className="mt-4 flex justify-end gap-2">
                    {jobDescription && <button onClick={() => setIsEditingJD(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>}
                    <button onClick={handleAnalyze} disabled={isAnalyzing || !localJdInput.trim()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 transition-all">
                        {isAnalyzing ? <><ArrowPathIcon className="h-4 w-4 animate-spin" /> Scanning...</> : 'Analyze Resume'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-left animate-fade-in pb-12">

            {/* --- UPDATED HEADER WITH SCORE GAUGE --- */}
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6 relative overflow-hidden shadow-lg flex justify-between items-center">
                <div className="pr-4">
                    <h3 className="font-bold text-lg text-white">Analysis Results</h3>
                    <p className="text-xs text-gray-400 mb-4">Click keywords below to see where they appear.</p>

                    {/* Re-Scan Button moved here for better layout */}
                    <button
                        onClick={() => setIsEditingJD(true)}
                        className="flex items-center gap-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md transition-colors"
                    >
                        <PencilSquareIcon className="h-4 w-4" />
                        New Scan
                    </button>
                </div>

                {/* The New Circular Gauge */}
                <ScoreGauge score={aiAnalysis.score || 0} />
            </div>

            {/* 1. Missing Keywords */}
            {aiAnalysis.missingKeywords && aiAnalysis.missingKeywords.length > 0 && (
                <div className="bg-[#1e293b] border border-red-900/40 rounded-lg p-6 shadow-lg relative z-20">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-red-400 flex items-center gap-2">
                        <ExclamationCircleIcon className="h-5 w-5" />
                        Missing Keywords
                    </h3>
                    <div className="flex flex-wrap gap-2 transition-all">
                        {aiAnalysis.missingKeywords.map((item, idx) => {
                            const uniqueKey = `missing-${idx}`;
                            return (
                                <KeywordAccordion
                                    key={uniqueKey}
                                    item={item}
                                    type="missing"
                                    isOpen={expandedId === uniqueKey}
                                    onToggle={() => handleToggle(uniqueKey)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Predicted Keywords */}
            {aiAnalysis.predictedKeywords && aiAnalysis.predictedKeywords.length > 0 && (
                <div className="bg-[#1e293b] border border-purple-900/40 rounded-lg p-6 shadow-lg relative z-10">
                    <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-purple-400 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5" />
                        Predicted / Implicit Skills
                    </h3>
                    <div className="flex flex-wrap gap-2 transition-all">
                        {aiAnalysis.predictedKeywords.map((item, idx) => {
                            const uniqueKey = `predicted-${idx}`;
                            return (
                                <KeywordAccordion
                                    key={uniqueKey}
                                    item={item}
                                    type="predicted"
                                    isOpen={expandedId === uniqueKey}
                                    onToggle={() => handleToggle(uniqueKey)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3. Matching Keywords */}
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6 shadow-lg relative z-0">
                <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-green-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Matching Keywords
                </h3>
                <div className="flex flex-wrap gap-2 transition-all">
                    {aiAnalysis.matchingKeywords?.map((item, idx) => {
                        const uniqueKey = `matching-${idx}`;
                        return (
                            <KeywordAccordion
                                key={uniqueKey}
                                item={item}
                                type="matching"
                                isOpen={expandedId === uniqueKey}
                                onToggle={() => handleToggle(uniqueKey)}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Recommendation Footer */}
            <div className="bg-gray-800 border-t border-gray-700 p-4 rounded-b-lg -mt-2">
                <p className="text-sm text-gray-400">
                    <strong className="text-white block mb-1">Overall Recommendation:</strong>
                    {aiAnalysis.recommendation}
                </p>
            </div>
        </div>
    );
};

export default AIKeywordAnalysis;