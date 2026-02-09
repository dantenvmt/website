// src/components/resume/CreateResumeModal.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import { getGuestId } from '../../utils/guestSession';
import { useAuth } from '../../context/AuthContext';

const CreateResumeModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Get all functions and initial state objects from context
    const {
        resetResume, setJobDescription, setContact, setSummary, setSkills,
        setExperiences, setEducations, setProjects, setAwards, setCertifications,
        initialContact, initialExperiences, initialEducations,
        initialProjects, initialAwards, initialCertifications
    } = useResume();

    const [step, setStep] = useState(1);
    const [resumeName, setResumeName] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Entry level');
    const [targetMarket, setTargetMarket] = useState('');

    const [uploadedFile, setUploadedFile] = useState(null);
    const [jobInput, setJobInput] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    if (!isOpen) return null;

    // --- MANUAL BUILD HANDLER ---
    const handleManualBuild = async (e) => {
        e.preventDefault();
        const trimmedName = resumeName.trim();
        if (!trimmedName) {
            alert('Please enter a resume name.');
            return;
        }

        const guestId = !user ? getGuestId() : null;

        try {
            const response = await fetch('https://renaisons.com/api/create_resume.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeName: trimmedName,
                    guestId: guestId
                }),
                credentials: 'include'
            });
            const result = await response.json();
            if (result.status === 'success' && result.resume_id) {
                resetResume();
                const targetUrl = `/resume/${result.resume_id}/contact`;
                navigate(targetUrl, { state: { resumeName: trimmedName } });
                handleClose();
            } else {
                alert('Error from server: ' + (result.message || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Failed to create resume:', error);
            alert('A critical error occurred. Please check the console.');
        }
    };

    // --- AI BUILD HANDLER (FIXED & ROBUST) ---
    const handleAiBuild = async (e) => {
        e.preventDefault();
        const trimmedName = resumeName.trim();

        if (!trimmedName) {
            alert('Please enter a resume name.');
            return;
        }
        if (!uploadedFile) {
            alert('Please upload your resume file.');
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: 'Parsing resume...' });

        const formData = new FormData();
        formData.append('resumeFile', uploadedFile);
        formData.append('resumeName', trimmedName);

        try {
            // 1. CALL GROQ BACKEND TO PARSE FILE
            const parseResponse = await fetch('https://renaisons.com/api/parse_resume_groq.php', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });

            if (!parseResponse.ok) {
                const errData = await parseResponse.json();
                throw new Error(errData.error || `Parsing failed: ${parseResponse.statusText}`);
            }

            const parsedResult = await parseResponse.json();
            console.log("AI Parse Success:", parsedResult);

            // 2. MAP & CLEAN DATA

            // A. Location Splitter
            let parsedCity = '';
            let parsedState = '';
            const rawLocation = parsedResult.contact?.location || parsedResult.contact?.address || '';
            if (rawLocation && rawLocation.includes(',')) {
                const parts = rawLocation.split(',');
                parsedCity = parts[0].trim();
                parsedState = parts[1] ? parts[1].trim() : '';
            } else {
                parsedCity = rawLocation;
            }

            // B. Contact Mapping
            const contactData = {
                ...initialContact,
                fullName: parsedResult.contact?.name || parsedResult.contact?.full_name || trimmedName,
                email: parsedResult.contact?.email || parsedResult.contact?.email_address || parsedResult.contact?.mail || '',
                phone: parsedResult.contact?.phone || parsedResult.contact?.phone_number || '',
                linkedin: parsedResult.contact?.linkedin || parsedResult.contact?.linkedIn || '',
                website: parsedResult.contact?.website || parsedResult.contact?.portfolio || '',
                city: parsedResult.contact?.city || parsedCity,
                state: parsedResult.contact?.state || parsedState,
                country: parsedResult.contact?.country || ''
            };

            // C. Skills
            let skillsData = '';
            if (Array.isArray(parsedResult.skills)) {
                skillsData = parsedResult.skills.join('\n');
            } else {
                skillsData = parsedResult.skills || '';
            }

            // D. Experiences
            const experiencesData = (parsedResult.experiences || []).map(exp => ({
                ...initialExperiences()[0],
                id: Date.now() + Math.random(),
                role: exp.title || exp.role || '',
                company: exp.company || '',
                startDate: exp.startDate || exp.start_date || '',
                endDate: exp.endDate || exp.end_date || '',
                isCurrent: exp.is_current || exp.isCurrent || (String(exp.endDate || '').toLowerCase() === 'present'),
                location: exp.location || '',
                bullets: exp.bullets || exp.description || '',
                aiUsesLeft: 3
            }));

            // E. Educations
            const educationsData = (parsedResult.educations || []).map(edu => ({
                ...initialEducations()[0],
                id: Date.now() + Math.random(),
                degree: edu.degree || '',
                school: edu.school || '',
                startDate: edu.startDate || edu.start_date || '',
                endDate: edu.endDate || edu.end_date || '',
                location: edu.location || '',
                bullets: edu.bullets || edu.description || '',
                minor: edu.minor || '',
                gpa: edu.gpa || ''
            }));

            // F. Projects (Added organization mapping!)
            const projectsData = (parsedResult.projects || []).map(proj => ({
                ...initialProjects()[0],
                id: Date.now() + Math.random(),
                name: proj.name || '',
                organization: proj.organization || '', // Ensure this exists
                date: proj.date || '',
                relevance: proj.relevance || proj.description || ''
            }));

            // G. Certifications
            const certificationsData = (parsedResult.certifications || []).map(cert => ({
                ...initialCertifications()[0],
                id: Date.now() + Math.random(),
                name: cert.name || '',
                organization: cert.organization || cert.orginization || '',
                date: cert.date || '',
                relevance: cert.relevance || cert.description || ''
            }));

            // H. Awards
            const awardsData = (parsedResult.awards || []).map(award => ({
                ...initialAwards()[0],
                id: Date.now() + Math.random(),
                name: award.name || '',
                organization: award.organization || award.orginization || '',
                date: award.date || '',
                relevance: award.relevance || award.description || ''
            }));

            // 3. CREATE RESUME ENTRY IN DB
            const guestId = !user ? getGuestId() : null;

            const createResponse = await fetch('https://renaisons.com/api/create_resume.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeName: trimmedName,
                    guestId: guestId
                }),
                credentials: 'include'
            });
            const createResult = await createResponse.json();

            if (createResult.status === 'success' && createResult.resume_id) {
                setMessage({ type: '', text: 'Saving data to database...' });

                // 4. SAVE PARSED DATA TO DATABASE
                const savePayload = {
                    resume_id: createResult.resume_id,
                    contact: contactData,
                    skills: skillsData,
                    summary: parsedResult.summary || '',
                    experiences: experiencesData,
                    educations: educationsData,
                    projects: projectsData,
                    awards: awardsData,
                    certifications: certificationsData
                };

                console.log("Sending Payload to DB:", savePayload);

                // --- CRITICAL FIX: Check response before proceeding ---
                const saveResponse = await fetch('https://renaisons.com/api/save_resume_data.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(savePayload),
                    credentials: 'include'
                });

                const saveResult = await saveResponse.json();

                if (!saveResponse.ok || saveResult.status === 'error') {
                    console.error("DB Save Failed:", saveResult);
                    throw new Error(saveResult.message || "Failed to save data to the database.");
                }

                // 5. UPDATE FRONTEND CONTEXT (Only if DB save worked!)
                setContact(contactData);
                setSummary(parsedResult.summary || '');
                setSkills(skillsData);
                setExperiences(experiencesData.length > 0 ? experiencesData : initialExperiences());
                setEducations(educationsData.length > 0 ? educationsData : initialEducations());
                setProjects(projectsData.length > 0 ? projectsData : initialProjects());
                setAwards(awardsData.length > 0 ? awardsData : initialAwards());
                setCertifications(certificationsData.length > 0 ? certificationsData : initialCertifications());
                setJobDescription(jobInput);

                // 6. NAVIGATE
                const targetUrl = `/resume/${createResult.resume_id}/final`;
                navigate(targetUrl, { state: { resumeName: trimmedName, isNewAiResume: true } });

                handleClose();

            } else {
                throw new Error(createResult.message || 'Failed to create resume ID.');
            }

        } catch (error) {
            console.error('AI Build Error:', error);
            setMessage({ type: 'error', text: `Error: ${error.message}` });
            // Do NOT navigate if error occurs
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setResumeName('');
        setExperienceLevel('Entry level');
        setTargetMarket('');
        setUploadedFile(null);
        setJobInput('');
        setIsLoading(false);
        setMessage({ type: '', text: '' });
        onClose();
    };

    // --- JSX RENDER ---
    const renderStepOne = () => (
        <>
            <h2 className="text-2xl font-bold text-center mb-6">Create a new resume</h2>
            <div className="space-y-4">
                <button
                    onClick={() => setStep(3)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors"
                >
                    Let AI build (Upload resume)
                </button>
                <button
                    onClick={() => setStep(2)}
                    className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-3 px-4 rounded-md transition-colors"
                >
                    Write your resume by yourself
                </button>
            </div>
        </>
    );

    const renderStepTwo = () => (
        <>
            <h1 className="text-2xl font-bold text-center mb-8">Create your resume</h1>
            <form onSubmit={handleManualBuild} className="space-y-6">
                <div>
                    <label htmlFor="resumeName" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        RESUME NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="resumeName"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        placeholder="Data Scientist"
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="experienceLevel" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        EXPERIENCE LEVEL
                    </label>
                    <select
                        id="experienceLevel"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 appearance-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option>Entry level</option>
                        <option>Mid Level</option>
                        <option>Senior Level</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="targetMarket" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        TARGETED INDUSTRY
                    </label>
                    <input
                        type="text"
                        id="targetMarket"
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                        placeholder="e.g., Fintech, Technology Sector"
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-white font-semibold py-2 px-6">CANCEL</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">SAVE</button>
                </div>
            </form>
        </>
    );

    const renderStepThree = () => (
        <>
            <h1 className="text-2xl font-bold text-center mb-8">AI Resume Builder</h1>
            <form onSubmit={handleAiBuild} className="space-y-6">
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-800 bg-opacity-70 flex items-center justify-center z-10 rounded-lg">
                        <div className="text-white text-lg font-semibold">Parsing Your Resume...</div>
                    </div>
                )}

                {message.text && (
                    <div className={`p-3 rounded-md text-center ${message.type === 'error' ? 'bg-red-900 text-red-100' : 'bg-green-900 text-green-100'}`}>
                        {message.text}
                    </div>
                )}

                <div>
                    <label htmlFor="resumeName" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        RESUME NAME <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="resumeName"
                        value={resumeName}
                        onChange={(e) => setResumeName(e.target.value)}
                        placeholder="AI Data Scientist"
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="experienceLevelAi" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        EXPERIENCE LEVEL
                    </label>
                    <select
                        id="experienceLevelAi"
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 appearance-none focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    >
                        <option>Entry level</option>
                        <option>Mid Level</option>
                        <option>Senior Level</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="targetMarketAi" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        TARGETED INDUSTRY
                    </label>
                    <input
                        type="text"
                        id="targetMarketAi"
                        value={targetMarket}
                        onChange={(e) => setTargetMarket(e.target.value)}
                        placeholder="e.g., Fintech, Technology Sector"
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">UPLOAD YOUR EXISTING RESUME <span className="text-red-500">*</span></label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center text-gray-500">
                            <input type="file" accept=".pdf" onChange={(e) => setUploadedFile(e.target.files[0])} className="text-sm" disabled={isLoading} />
                            {uploadedFile && <p className="text-xs pt-2 text-white">{uploadedFile.name}</p>}
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="jobInput" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        PASTE JOB DESCRIPTION OR ENTER JOB TITLE
                    </label>
                    <textarea
                        id="jobInput"
                        value={jobInput}
                        onChange={(e) => setJobInput(e.target.value)}
                        rows="4"
                        placeholder="Paste the full job description here for best results..."
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-white font-semibold py-2 px-6" disabled={isLoading}>CANCEL</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md" disabled={isLoading}>
                        {isLoading ? 'BUILDING...' : 'FINISH'}
                    </button>
                </div>
            </form>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 w-full max-w-lg text-white relative">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold" disabled={isLoading}>&times;</button>
                {step === 1 && renderStepOne()}
                {step === 2 && renderStepTwo()}
                {step === 3 && renderStepThree()}
            </div>
        </div>
    );
};

export default CreateResumeModal;