import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const STEPS = {
    ANALYZING: 'analyzing',
    ANSWER: 'answer',
    GENERATING: 'generating',
    RESULTS: 'results',
    ERROR: 'error',
};

const AIWriteExperienceModal = ({ jobDescription, experiences, aiAnalysis, onInsert, onClose }) => {
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
            const existingBullets = experiences.map(e => e.bullets).filter(Boolean).join('\n');
            const res = await fetch('https://renaisons.com/api/analyze_problems.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_description: jobDescription,
                    existing_bullets: existingBullets,
                }),
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Server error. Please try again.');
            const data = await res.json();
            if (data.status !== 'success') throw new Error(data.message || 'Failed to analyze job description.');
            setProblems(data.problems);
            setAnswers(data.problems.map(() => ({ experiences: [{ story: '', metrics: '' }] })));
            setExperienceConfirmed(data.problems.map(() => null));
            setWantsAiRewrite(data.problems.map(() => null));
            setStep(STEPS.ANSWER);
        } catch (err) {
            setErrorMessage(err.message);
            setRetryStep('analyze');
            setStep(STEPS.ERROR);
        }
    }, [jobDescription, experiences]);

    const generateBullets = useCallback(async () => {
        setStep(STEPS.GENERATING);
        setErrorMessage('');
        try {
            const allExistingBullets = experiences.map(e => e.bullets).filter(Boolean).join('\n');
            const suggestedKeywords = [
                ...(aiAnalysis?.missingKeywords?.map(k => k.keyword || k) || []),
                ...(aiAnalysis?.predictedKeywords?.map(k => k.keyword || k) || []),
            ];

            const payload = problems
                .map((p, idx) => ({ p, idx }))
                .filter(({ p, idx }) => {
                    if (!p.ai_has_experience) return false;
                    const confirmed = experienceConfirmed[idx];
                    const rewrite = wantsAiRewrite[idx];
                    return confirmed === 'no' || (confirmed === 'yes' && rewrite === 'yes');
                })
                .map(({ p, idx }) => {
                    const isRewrite = experienceConfirmed[idx] === 'yes' && wantsAiRewrite[idx] === 'yes';
                    const combinedStory = answers[idx].experiences.map(e => e.story).filter(Boolean).join('\n\n');
                    const combinedMetrics = answers[idx].experiences.map(e => e.metrics).filter(Boolean).join(', ');
                    return {
                        title: p.title,
                        description: p.description,
                        story: combinedStory,
                        ...(combinedMetrics && { metrics: combinedMetrics }),
                        mode: isRewrite ? 'rewrite' : 'write',
                        ...(isRewrite && {
                            existing_bullets: allExistingBullets,
                            suggested_keywords: suggestedKeywords,
                        }),
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
            setStep(STEPS.RESULTS);
        } catch (err) {
            setErrorMessage(err.message);
            setRetryStep('generate');
            setStep(STEPS.ERROR);
        }
    }, [problems, answers, experienceConfirmed, wantsAiRewrite, experiences, aiAnalysis]);

    useEffect(() => {
        analyzeProblems();
    }, [analyzeProblems]);

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const allResolved = answers.length > 0 && problems.every((problem, i) => {
        if (!problem.ai_has_experience) return true;
        const confirmed = experienceConfirmed[i];
        const rewrite = wantsAiRewrite[i];
        if (confirmed === null) return false;
        if (confirmed === 'no') return answers[i]?.experiences.some(e => e.story.trim().length > 0) ?? false;
        if (confirmed === 'yes' && rewrite === null) return false;
        if (confirmed === 'yes' && rewrite === 'yes') return answers[i]?.experiences.some(e => e.story.trim().length > 0) ?? false;
        if (confirmed === 'yes' && rewrite === 'no') return true;
        return false;
    });

    const hasAtLeastOneToGenerate = problems.some((problem, i) => {
        if (!problem.ai_has_experience) return false;
        const confirmed = experienceConfirmed[i];
        const rewrite = wantsAiRewrite[i];
        if (confirmed === 'no') return answers[i]?.experiences.some(e => e.story.trim().length > 0) ?? false;
        if (confirmed === 'yes' && rewrite === 'yes') return answers[i]?.experiences.some(e => e.story.trim().length > 0) ?? false;
        return false;
    });

    const allAnswersFilled = allResolved && hasAtLeastOneToGenerate;

    const canInsert = selected.some(Boolean) &&
        selected.every((sel, i) => !sel || assignments[i] !== '');

    const updateAnswer = (problemIndex, expIndex, field, value) => {
        setAnswers(prev => {
            const updated = [...prev];
            const exps = [...updated[problemIndex].experiences];
            exps[expIndex] = { ...exps[expIndex], [field]: value };
            updated[problemIndex] = { ...updated[problemIndex], experiences: exps };
            return updated;
        });
    };

    const addExperienceEntry = (problemIndex) => {
        setAnswers(prev => {
            const updated = [...prev];
            updated[problemIndex] = {
                ...updated[problemIndex],
                experiences: [...updated[problemIndex].experiences, { story: '', metrics: '' }],
            };
            return updated;
        });
    };

    const updateConfirmed = (index, value) => {
        setExperienceConfirmed(prev => {
            const updated = [...prev];
            updated[index] = value || null;
            return updated;
        });
        // Reset rewrite choice when confirmation changes
        setWantsAiRewrite(prev => {
            const updated = [...prev];
            updated[index] = null;
            return updated;
        });
    };

    const updateWantsRewrite = (index, value) => {
        setWantsAiRewrite(prev => {
            const updated = [...prev];
            updated[index] = value || null;
            return updated;
        });
    };

    const appendKeyword = (index, keyword) => {
        setAnswers(prev => {
            const updated = [...prev];
            const exps = [...updated[index].experiences];
            const lastIdx = exps.length - 1;
            const current = exps[lastIdx].story;
            exps[lastIdx] = { ...exps[lastIdx], story: current ? `${current} ${keyword}` : keyword };
            updated[index] = { ...updated[index], experiences: exps };
            return updated;
        });
    };

    const keywordChips = useMemo(() => {
        const seen = new Set();
        return [
            ...(aiAnalysis?.missingKeywords?.map(k => ({ text: k.keyword || k, type: 'missing' })) || []),
            ...(aiAnalysis?.predictedKeywords?.map(k => ({ text: k.keyword || k, type: 'predicted' })) || []),
        ].filter(({ text }) => {
            if (seen.has(text)) return false;
            seen.add(text);
            return true;
        });
    }, [aiAnalysis]);

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
                                {problems.map((problem, i) => {
                                    const confirmed = experienceConfirmed[i];
                                    const rewrite = wantsAiRewrite[i];
                                    const hasAiExp = problem.ai_has_experience;
                                    const showWriteBox = hasAiExp && (
                                        confirmed === 'no' || (confirmed === 'yes' && rewrite === 'yes')
                                    );
                                    const showMetrics = confirmed === 'no';

                                    return (
                                        <div key={problem.id} className="bg-[#0f172a] border border-gray-700 rounded-lg p-4 space-y-3">
                                            <div>
                                                <p className="text-sm font-bold text-blue-400">{i + 1}. {problem.title}</p>
                                                <p className="text-xs text-gray-400 mt-1">{problem.description}</p>
                                            </div>

                                            {!hasAiExp && (
                                                <p className="text-xs text-gray-500 italic">No relevant experience detected — skipped.</p>
                                            )}

                                            {hasAiExp && (
                                                <div className="space-y-3">
                                                    <select
                                                        value={confirmed || ''}
                                                        onChange={(e) => updateConfirmed(i, e.target.value)}
                                                        className="w-full bg-[#1e293b] border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                    >
                                                        <option value="">Do you have experience solving this?</option>
                                                        <option value="yes">Yes</option>
                                                        <option value="no">No</option>
                                                    </select>

                                                    {confirmed === 'yes' && (
                                                        <select
                                                            value={rewrite || ''}
                                                            onChange={(e) => updateWantsRewrite(i, e.target.value)}
                                                            className="w-full bg-[#1e293b] border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                        >
                                                            <option value="">Want AI to rewrite your bullets with relevant keywords?</option>
                                                            <option value="yes">Yes, rewrite with keywords</option>
                                                            <option value="no">No, I'll keep my bullets as-is</option>
                                                        </select>
                                                    )}

                                                    {confirmed === 'yes' && rewrite === 'no' && (
                                                        <p className="text-xs text-gray-500 italic">Skipped — keeping your existing bullets.</p>
                                                    )}

                                                    {showWriteBox && (
                                                        <div className="space-y-4">
                                                            {keywordChips.length > 0 && (
                                                                <div>
                                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
                                                                        Try to mention these keywords:
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {keywordChips.map(({ text, type }) => (
                                                                            <button
                                                                                key={text}
                                                                                type="button"
                                                                                onClick={() => appendKeyword(i, text)}
                                                                                className={`px-2 py-0.5 text-xs font-semibold rounded-full border cursor-pointer transition-all hover:brightness-110 ${
                                                                                    type === 'missing'
                                                                                        ? 'bg-red-950/30 text-red-300 border-red-900/50 hover:border-red-500'
                                                                                        : 'bg-purple-950/30 text-purple-300 border-purple-900/50 hover:border-purple-500'
                                                                                }`}
                                                                            >
                                                                                + {text}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {answers[i]?.experiences.map((exp, expIdx) => (
                                                                <div key={expIdx} className="space-y-2">
                                                                    {expIdx > 0 && (
                                                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                                                                            Experience {expIdx + 1}
                                                                        </p>
                                                                    )}
                                                                    <textarea
                                                                        className="w-full bg-[#1e293b] border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                                                                        rows={3}
                                                                        value={exp.story}
                                                                        onChange={(e) => updateAnswer(i, expIdx, 'story', e.target.value)}
                                                                        placeholder="Briefly describe the situation and what you did..."
                                                                    />
                                                                    {showMetrics && (
                                                                        <input
                                                                            type="text"
                                                                            className="w-full bg-[#1e293b] border border-gray-600 rounded-md p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                                            value={exp.metrics}
                                                                            onChange={(e) => updateAnswer(i, expIdx, 'metrics', e.target.value)}
                                                                            placeholder="e.g. reduced churn by 30%, saved $200K/year"
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}

                                                            <button
                                                                type="button"
                                                                onClick={() => addExperienceEntry(i)}
                                                                className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                                                            >
                                                                + Add another experience
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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
                            {(() => {
                                const allKeywords = [...new Set([
                                    ...(aiAnalysis?.missingKeywords?.map(k => k.keyword || k) || []),
                                    ...(aiAnalysis?.predictedKeywords?.map(k => k.keyword || k) || []),
                                ])];
                                const allBulletText = bullets.map(b => b.bullet).join(' ');
                                const makeWordBoundaryRegex = (kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
                                const covered = allKeywords.filter(kw => makeWordBoundaryRegex(kw).test(allBulletText));
                                const stillMissing = allKeywords.filter(kw => !makeWordBoundaryRegex(kw).test(allBulletText));

                                return allKeywords.length > 0 ? (
                                    <div className="mb-4 bg-[#0f172a] border border-gray-700 rounded-lg p-4">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">
                                            Keyword Coverage
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {covered.map(kw => (
                                                <span key={kw} className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-950/30 text-green-300 border border-green-900/50">
                                                    ✓ {kw}
                                                </span>
                                            ))}
                                            {stillMissing.map(kw => (
                                                <span key={kw} className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-950/30 text-red-300 border border-red-900/50">
                                                    ✗ {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;
                            })()}
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
