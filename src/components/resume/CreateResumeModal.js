import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';

const CreateResumeModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { setJobDescription, setContact, setSummary, setExperiences, resetResume } = useResume();
    const [step, setStep] = useState(1);
    const [resumeName, setResumeName] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('Entry level');
    const [targetMarket, setTargetMarket] = useState('');

    const [uploadedFile, setUploadedFile] = useState(null);
    const [jobInput, setJobInput] = useState('');

    if (!isOpen) return null;

    const handleManualBuild = async (e) => {
        e.preventDefault();
        if (!resumeName) {
            alert('Please enter a resume name.');
            return;
        }

        try {
            const response = await fetch('https://renaisons.com/api/create_resume.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeName: resumeName }),
            });

            const result = await response.json();

            if (result.status === 'success' && result.resume_id) {
                resetResume();
                const targetUrl = `/resume/${result.resume_id}/contact`;
                navigate(targetUrl, { state: { resumeName: resumeName } });
                handleClose();
            } else {
                alert('Error from server: ' + (result.message || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Failed to create resume:', error);
            alert('A critical error occurred. Please check the console.');
        }
    };

    const handleAiBuild = async (e) => {
        e.preventDefault();
        if (!resumeName) {
            alert('Please enter a resume name.');
            return;
        }
        // Even for AI build, we first create the resume to get an ID
        try {
            const response = await fetch('https://renaisons.com/api/create_resume.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeName: resumeName }),
            });

            const result = await response.json();

            if (result.status === 'success' && result.resume_id) {
                resetResume();
                setJobDescription(jobInput);

                // Now, set the AI-parsed data locally
                alert("Simulating AI analysis... Your resume will be pre-filled with placeholder data.");
                setContact({ fullName: 'Thuan Nguyen (AI Parsed)', email: 'thuannguyen.vm@gmail.com', phone: '9032599470', linkedin: 'thuan-nguyen-dev', city: 'Richardson', state: 'Texas', country: 'United States' });
                setSummary('AI-parsed summary: Results-oriented Data Scientist with expertise in machine learning and data warehousing.');
                setExperiences([{ id: Date.now(), role: 'Data Scientist (AI Parsed)', company: 'A.I. Tech Inc.', startDate: 'Jan 2025', endDate: 'Sep 2025', isCurrent: false, location: 'Dallas, TX', bullets: '• Leveraged machine learning models to increase sales forecasting accuracy by 25%.\n• Designed and implemented a new data warehousing solution, reducing query times by 40%.', aiUsesLeft: 3 }]);

                // Navigate to the correct dynamic URL
                const targetUrl = `/resume/${result.resume_id}/contact`;
                navigate(targetUrl, { state: { resumeName: `${resumeName} (AI)` } });
                handleClose();
            } else {
                alert('Error from server: ' + (result.message || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Failed to create AI resume:', error);
            alert('A critical error occurred. Please check the console.');
        }
    };

    const handleClose = () => {
        setStep(1);
        setResumeName('');
        setExperienceLevel('Entry level');
        setTargetMarket('');
        setUploadedFile(null);
        setJobInput('');
        onClose();
    };

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
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">UPLOAD YOUR EXISTING RESUME <span className="text-red-500">*</span></label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center text-gray-500">
                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setUploadedFile(e.target.files[0])} className="text-sm" />
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
                    />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-white font-semibold py-2 px-6">CANCEL</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">FINISH</button>
                </div>
            </form>
        </>
    );


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 w-full max-w-lg text-white relative">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                {step === 1 && renderStepOne()}
                {step === 2 && renderStepTwo()}
                {step === 3 && renderStepThree()}
            </div>
        </div>
    );
};

export default CreateResumeModal;