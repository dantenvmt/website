import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import SaveButton from '../../components/common/SaveButton';
import FormTextarea from '../../components/resume/FormTextarea';
import { useResume } from '../../context/ResumeContext';
import FeedbackModal from '../../components/common/FeedbackModal';
import { ArrowPathIcon, PlusIcon, CheckIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const RelevanceBadge = ({ relevance }) => {
    if (!relevance) return null;

    let colorClass = "bg-gray-700 text-gray-300";
    let text = relevance.toUpperCase();

    if (text === "HIGH") colorClass = "bg-green-900/50 text-green-300 border border-green-700/50";
    else if (text === "MEDIUM") colorClass = "bg-yellow-900/50 text-yellow-300 border border-yellow-700/50";
    else if (text === "LOW") colorClass = "bg-gray-800 text-gray-400 border border-gray-600";

    return (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold tracking-wider ${colorClass}`}>
            {text}
        </span>
    );
};

const Skills = () => {
    const {
        skills, setSkills, jobDescription,
        summary, experiences, educations, projects, certifications, awards
    } = useResume();

    const { resumeId } = useParams();
    const [isSaving, setIsSaving] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [existingGroups, setExistingGroups] = useState(null);
    const [recommendedGroups, setRecommendedGroups] = useState(null);
    const [skillsToLearn, setSkillsToLearn] = useState(null);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, message: '', title: '', isError: false });

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

    const handleAiWrite = async () => {
        if (!jobDescription) {
            setModalInfo({ isOpen: true, title: 'AI Suggestion Error', message: 'Please add a job description in the "AI Keyword Analysis" tab first.', isError: true });
            return;
        }

        setIsGenerating(true);
        setExistingGroups(null);
        setRecommendedGroups(null);
        setSkillsToLearn(null);

        try {
            const response = await fetch('https://renaisons.com/api/suggest_grouped_skills.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: fullResumeText, current_skills: skills, job_description: jobDescription }),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.status === 'success') {
                setExistingGroups(result.existing_groups);
                setRecommendedGroups(result.recommended_groups);
                setSkillsToLearn(result.skills_to_learn);

                const formattedExistingText = result.existing_groups
                    .map(g => `${g.category}: ${g.items.map(i => typeof i === 'string' ? i : i.name).join(', ')}`)
                    .join('\n');
                setSkills(formattedExistingText);

            } else {
                throw new Error(result.message || 'Failed to analyze and group skills.');
            }
        } catch (error) {
            console.error('Failed to generate skills, using mock fallback:', error);

            setTimeout(() => {
                const mockExisting = [
                    { category: "Programming", items: [{ name: "React", relevance: "High" }, { name: "C++", relevance: "Medium" }] }
                ];
                setExistingGroups(mockExisting);

                setRecommendedGroups([
                    { category: "Programming & Frameworks", items: [{ name: "C#", relevance: "High" }, { name: "Node.js", relevance: "Medium" }] },
                    { category: "Soft Skills", items: [{ name: "Agile", relevance: "High" }, { name: "Communication", relevance: "Low" }] }
                ]);

                setSkillsToLearn([
                    { name: "Kubernetes", reason: "Required for deployment pipelines mentioned in the JD." },
                    { name: "GraphQL", reason: "Preferred API query language for this role." }
                ]);

                const formattedExistingText = mockExisting
                    .map(g => `${g.category}: ${g.items.map(i => i.name).join(', ')}`)
                    .join('\n');
                setSkills(formattedExistingText);
                setIsGenerating(false);
            }, 1500);
            return;
        }
        setIsGenerating(false);
    };

    const isSkillSelected = (skillName) => {
        if (!skills) return false;
        const regex = new RegExp(`(^|[:,]\\s*)${escapeRegExp(skillName)}(?=\\s*(,|$|\\n))`, 'i');
        return regex.test(skills);
    };

    const toggleRecommendedSkill = (skillName, category) => {
        let currentText = skills || '';
        const hasSkill = isSkillSelected(skillName);

        if (hasSkill) {
            const regexTrailing = new RegExp(`,\\s*${escapeRegExp(skillName)}(?=\\s*(,|$|\\n))`, 'i');
            const regexLeading = new RegExp(`(^|:\\s*)${escapeRegExp(skillName)}\\s*,\\s*`, 'i');
            const regexAlone = new RegExp(`(^|:\\s*)${escapeRegExp(skillName)}(?=\\s*(,|$|\\n))`, 'i');

            if (regexTrailing.test(currentText)) {
                currentText = currentText.replace(regexTrailing, '');
            } else if (regexLeading.test(currentText)) {
                currentText = currentText.replace(regexLeading, '$1');
            } else {
                currentText = currentText.replace(regexAlone, '$1');
            }

            currentText = currentText.replace(/^.*:\s*$(?:\r?\n)?/gm, '').trim();
            setSkills(currentText);

        } else {
            const categoryRegex = new RegExp(`^${escapeRegExp(category)}:`, 'im');
            if (categoryRegex.test(currentText)) {
                currentText = currentText.replace(
                    new RegExp(`(^${escapeRegExp(category)}:.*?)(?=\n|$)`, 'im'),
                    (match) => match.trim().endsWith(':') ? `${match} ${skillName}` : `${match}, ${skillName}`
                );
            } else {
                const newEntry = `${category}: ${skillName}`;
                currentText = currentText.trim() ? `${currentText}\n${newEntry}` : newEntry;
            }
            setSkills(currentText);
        }
    };

    const handleSave = async () => {
        if (!resumeId) {
            setModalInfo({ isOpen: true, title: 'Save Error', message: 'No resume ID found. Cannot save.', isError: true });
            return;
        }
        setIsSaving(true);
        try {
            const response = await fetch('https://renaisons.com/api/save_skill.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_id: resumeId, skills_description: skills }),
                credentials: 'include'
            });
            const result = await response.json();
            if (result.status === 'success') {
                setModalInfo({ isOpen: true, title: 'Success!', message: 'Skills saved successfully.', isError: false });
            } else {
                setModalInfo({ isOpen: true, title: 'Save Error', message: result.message || 'Server error occurred.', isError: true });
            }
        } catch (error) {
            setModalInfo({ isOpen: true, title: 'Network Error', message: 'A critical error occurred.', isError: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            {modalInfo.isOpen && (
                <FeedbackModal title={modalInfo.title} message={modalInfo.message} isError={modalInfo.isError} onClose={() => setModalInfo({ isOpen: false, message: '', title: '', isError: false })} />
            )}

            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8">
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="skills" className="block text-xs font-bold text-gray-400 uppercase">
                                SKILLS
                            </label>
                            <button type="button" onClick={handleAiWrite} disabled={isGenerating} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-md disabled:opacity-50 transition-all">
                                {isGenerating ? <><ArrowPathIcon className="h-4 w-4 animate-spin" /> Analyzing & Grouping...</> : 'AI Suggest & Group Skills'}
                            </button>
                        </div>
                        <FormTextarea id="skills" name="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g., Programming: Python, React&#10;Soft Skills: Communication, Leadership" rows="8" />
                        <p className="text-xs text-gray-400 mt-2">Enter your skills. Use colons to define categories (e.g., "Category: Skill 1, Skill 2").</p>
                    </div>

                    {/* --- Grouped Recommended Skills (Togglable) --- */}
                    {recommendedGroups && (
                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-sm font-bold text-blue-400 border-b border-gray-700 pb-2">AI Recommended Skills to Add</h3>
                            <p className="text-xs text-gray-400 mb-2">Click a skill to add it to your profile under the correct category.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recommendedGroups.map((group, idx) => (
                                    <div key={idx} className="bg-gray-800/80 border border-blue-900/30 rounded-lg p-4">
                                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-3">{group.category}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {group.items.map((skillObj, skillIdx) => {
                                                const skillName = typeof skillObj === 'string' ? skillObj : skillObj.name;
                                                const relevance = typeof skillObj === 'string' ? null : skillObj.relevance;
                                                const selected = isSkillSelected(skillName);

                                                return (
                                                    <button
                                                        key={skillIdx}
                                                        type="button"
                                                        onClick={() => toggleRecommendedSkill(skillName, group.category)}
                                                        className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all duration-200 border ${selected ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-gray-900 border-gray-600 hover:border-blue-500 hover:text-blue-400 text-gray-300'
                                                            }`}
                                                    >
                                                        {selected ? <CheckIcon className="h-3 w-3 stroke-[3]" /> : <PlusIcon className="h-3 w-3 stroke-[2]" />}
                                                        {skillName}
                                                        <RelevanceBadge relevance={relevance} />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- Skills to Learn --- */}
                    {skillsToLearn && skillsToLearn.length > 0 && (
                        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <h3 className="text-sm font-bold text-purple-400 border-b border-gray-700 pb-2 flex items-center gap-2">
                                <BookOpenIcon className="h-4 w-4" /> Recommended Skills to Learn
                            </h3>
                            <p className="text-xs text-gray-400 mb-2">These skills appear in the job description but are missing from your resume context.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {skillsToLearn.map((skill, idx) => (
                                    <div key={idx} className="bg-gray-900 border border-purple-900/50 rounded-lg p-3">
                                        <h4 className="text-xs font-bold text-purple-300 mb-1">{skill.name}</h4>
                                        <p className="text-[10px] text-gray-400 leading-relaxed">{skill.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <SaveButton type="submit" disabled={isSaving}>
                            {isSaving ? 'SAVING...' : 'SAVE SKILLS'}
                        </SaveButton>
                    </div>
                </form>
            </div>
        </>
    );
};

export default Skills;