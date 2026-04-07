import React, { useState, useEffect, useCallback } from 'react';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const STEPS = {
    ANALYZING: 'analyzing',
    ANSWER: 'answer',
    GENERATING: 'generating',
    RESULTS: 'results',
    ERROR: 'error',
};

const AIWriteExperienceModal = ({ jobDescription, experiences, aiAnalysis, onInsert, onGenerated, onClose }) => {
    const [step, setStep] = useState(STEPS.ANALYZING);
    const [problems, setProblems] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [experienceConfirmed, setExperienceConfirmed] = useState([]); // null | 'yes' | 'no' per problem
    const [wantsAiRewrite, setWantsAiRewrite] = useState([]);           // null | 'yes' | 'no' per problem
    const [bullets, setBullets] = useState([]);
    const [selected, setSelected] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [retryStep, setRetryStep] = useState(null);

    const analyzeProblems = useCallback(async () => {
        setStep(STEPS.ANALYZING);
        setErrorMessage('');
        try {
            const res = await fetch('https://renaisons.com/api/analyze_problems.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_description: jobDescription }),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Server error. Please try again.');
            const data = await res.json();
            if (data.status !== 'success') throw new Error(data.message || 'Failed to analyze job description.');
            setProblems(data.problems);
            setAnswers(data.problems.map(() => ({ story: '', metrics: '' })));
            setExperienceConfirmed(data.problems.map(() => null));
            setWantsAiRewrite(data.problems.map(() => null));
            setStep(STEPS.ANSWER);
        } catch (err) {
            setErrorMessage(err.message);
            setRetryStep('analyze');
            setStep(STEPS.ERROR);
        }
    }, [jobDescription]);

    const generateBullets = useCallback(async () => {
        setStep(STEPS.GENERATING);
        setErrorMessage('');
        try {
            const payload = problems
                .filter((_, i) => !skipped[i])
                .map((p) => {
                    const originalIndex = problems.indexOf(p);
                    return {
                        title: p.title,
                        description: p.description,
                        story: answers[originalIndex].story,
                        metrics: answers[originalIndex].metrics,
                    };
                });
            const res = await fetch('https://renaisons.com/api/write_experience_bullets.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problems: payload }),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Server error. Please try again.');
            const data = await res.json();
            if (data.status !== 'success') throw new Error(data.message || 'Failed to generate bullets.');
            setBullets(data.bullets);
            setSelected(data.bullets.map(() => true));
            setAssignments(data.bullets.map(() => ''));
            onGenerated();
            setStep(STEPS.RESULTS);
        } catch (err) {
            setErrorMessage(err.message);
            setRetryStep('generate');
            setStep(STEPS.ERROR);
        }
    }, [problems, answers]);

    useEffect(() => {
        analyzeProblems();
    }, [analyzeProblems]);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const allAnswersFilled = answers.length > 0
        && skipped.some(s => !s)
        && answers.every((a, i) => skipped[i] || (a.story.trim() && a.metrics.trim()));

    const canInsert = selected.some(Boolean) &&
        selected.every((sel, i) => !sel || assignments[i] !== '');

    const updateAnswer = (index, field, value) => {
        setAnswers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const toggleSelected = (index) => {
        setSelected(prev => {
            const updated = [...prev];
            updated[index] = !updated[index];
            return updated;
        });
    };

    const updateAssignment = (index, experienceId) => {
        setAssignments(prev => {
            const updated = [...prev];
            updated[index] = experienceId;
            return updated;
        });
    };

    const getExperienceLabel = (exp, i) => {
        if (exp.role && exp.company) return `${exp.role} @ ${exp.company}`;
        if (exp.role) return exp.role;
        if (exp.company) return exp.company;
        return `Experience ${i + 1}`;
    };

    const handleInsert = () => {
        const toInsert = [];
        bullets.forEach((b, i) => {
            if (selected[i]) {
                toInsert.push({ bullet: `• ${b.bullet}`, experienceId: assignments[i] });
            }
        });
        onInsert(toInsert);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[#1e293b] border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-[#1e293b] z-10">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-white">AI Write</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {step === STEPS.ANALYZING && (
                        <div className="flex flex-col items-center py-12 gap-4">
                            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400">Identifying key business problems...</p>
                        </div>
                    )}

                    {step === STEPS.ANSWER && (
                        <div>
                            <p className="text-sm text-gray-400 mb-6">Here's what this role actually needs to solve:</p>
                            <div className="space-y-6">
                                {problems.map((problem, i) => (
                                    <div key={problem.id} className={`bg-[#0f172a] border rounded-lg p-4 space-y-3 ${skipped[i] ? 'border-gray-800 opacity-50' : 'border-gray-700'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-blue-400">{i + 1}. {problem.title}</p>
                                                <p className="text-xs text-gray-400 mt-1">{problem.description}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => toggleSkipped(i)}
                                                className={`text-xs font-semibold ml-4 flex-shrink-0 px-2 py-1 rounded ${skipped[i] ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {skipped[i] ? 'Undo skip' : "I don't have this"}
                                            </button>
                                        </div>
                                        {!skipped[i] && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                                        Tell me about a time you solved this
                                                    </label>
                                                    <textarea
                                                        className="w-full bg-[#1e293b] border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                                                        rows={3}
                                                        value={answers[i].story}
                                                        onChange={(e) => updateAnswer(i, 'story', e.target.value)}
                                                        placeholder="Briefly describe the situation and what you did..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                                                        What were your specific numbers/metrics?
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-[#1e293b] border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                        value={answers[i].metrics}
                                                        onChange={(e) => updateAnswer(i, 'metrics', e.target.value)}
                                                        placeholder="e.g. reduced churn by 30%, saved $200K/year"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={generateBullets}
                                    disabled={!allAnswersFilled}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md text-sm"
                                >
                                    Generate Bullets
                                </button>
                            </div>
                        </div>
                    )}

                    {step === STEPS.GENERATING && (
                        <div className="flex flex-col items-center py-12 gap-4">
                            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400">Writing your bullets...</p>
                        </div>
                    )}

                    {step === STEPS.RESULTS && (
                        <div>
                            <p className="text-sm text-gray-400 mb-4">Select the bullets you want to add and assign each to an experience:</p>
                            <div className="space-y-3">
                                {bullets.map((b, i) => (
                                    <div
                                        key={i}
                                        className="bg-[#0f172a] border border-gray-700 rounded-lg p-4 cursor-pointer"
                                        onClick={() => toggleSelected(i)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selected[i]}
                                                onChange={() => toggleSelected(i)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="mt-1 flex-shrink-0 accent-blue-500 cursor-pointer"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-blue-400 font-semibold mb-1">Re: {b.problem_title}</p>
                                                <p className="text-sm text-white mb-3">• {b.bullet}</p>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={assignments[i]}
                                                        onChange={(e) => updateAssignment(i, e.target.value)}
                                                        disabled={!selected[i]}
                                                        className="w-full bg-[#1e293b] border border-gray-600 rounded-md px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="">— Assign to experience —</option>
                                                        {experiences.map((exp, ei) => (
                                                            <option key={exp.id} value={exp.id}>
                                                                {getExperienceLabel(exp, ei)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {selected[i] && assignments[i] === '' && (
                                                        <p className="text-xs text-yellow-400 mt-1">Select an experience to enable insert</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={handleInsert}
                                    disabled={!canInsert}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-md text-sm"
                                >
                                    Insert Selected Bullets
                                </button>
                            </div>
                        </div>
                    )}

                    {step === STEPS.ERROR && (
                        <div className="flex flex-col items-center py-12 gap-4 text-center">
                            <p className="text-red-400 font-semibold">{errorMessage}</p>
                            <button
                                onClick={() => retryStep === 'analyze' ? analyzeProblems() : generateBullets()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIWriteExperienceModal;
