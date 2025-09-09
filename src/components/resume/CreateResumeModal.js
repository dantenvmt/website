import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateResumeModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [resumeName, setResumeName] = useState('');

    if (!isOpen) return null;

    const handleNext = (e) => {
        e.preventDefault();
        if (!resumeName) {
            alert('Please enter a resume name.');
            return;
        }
        // Navigate to the contact page and pass the resume name
        navigate('/resume/contact', { state: { resumeName: resumeName } });
        handleClose();
    };

    const handleClose = () => {
        setStep(1)
        setResumeName('');
        onClose();
    };

    const renderStepOne = () => (
        <>
            <h2 className="text-2xl font-bold text-center mb-6">Create a new resume</h2>
            <div className="space-y-4">
                <button
                    onClick={() => setStep(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition-colors"
                >
                    Write your resume by yourself
                </button>
                <button
                    onClick={() => alert('AI Build feature is coming soon!')}
                    className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-3 px-4 rounded-md transition-colors"
                >
                    Let AI build (Upload resume)
                </button>
            </div>
        </>
    );

    const renderStepTwo = () => (
        <>
            <h1 className="text-2xl font-bold text-center mb-8">Create your resume</h1>
            <form onSubmit={handleNext} className="space-y-6">
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
                    <label htmlFor="experience" className="block text-xs font-bold text-gray-400 uppercase mb-2">EXPERIENCE</label>
                    <select id="experience" className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 appearance-none focus:ring-blue-500 focus:border-blue-500">
                        <option>Entry level</option>
                        <option>Mid Level</option>
                        <option>Senior Level</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">IMPORT YOUR EXISTING RESUME</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center text-gray-500">
                            <p>Upload PDF, DOCx resume file</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={handleClose} className="text-gray-400 hover:text-white font-semibold py-2 px-6">
                        CANCEL
                    </button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">
                        SAVE
                    </button>
                </div>
            </form>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 w-full max-w-lg text-white relative">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                {step === 1 ? renderStepOne() : renderStepTwo()}
            </div>
        </div>
    );
};

export default CreateResumeModal;