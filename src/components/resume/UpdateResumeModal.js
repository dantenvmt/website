import React, { useState, useEffect } from 'react';

const UpdateResumeModal = ({ isOpen, onClose, onSave, currentName }) => {
    const [resumeName, setResumeName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setResumeName(currentName);
        }
    }, [isOpen, currentName]);

    if (!isOpen) return null;

    const handleSave = (e) => {
        e.preventDefault();
        if (!resumeName) {
            alert('Resume name cannot be empty.');
            return;
        }
        onSave(resumeName);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8 w-full max-w-lg text-white relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
                <h1 className="text-2xl font-bold text-center mb-8">Update your resume</h1>
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label htmlFor="resumeNameUpdate" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                            RESUME NAME <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="resumeNameUpdate"
                            value={resumeName}
                            onChange={(e) => setResumeName(e.target.value)}
                            className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="experienceUpdate" className="block text-xs font-bold text-gray-400 uppercase mb-2">EXPERIENCE</label>
                        <select id="experienceUpdate" defaultValue="Entry level" className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 appearance-none focus:ring-blue-500 focus:border-blue-500">
                            <option>Entry level</option>
                            <option>Mid Level</option>
                            <option>Senior Level</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white font-semibold py-2 px-6">
                            CANCEL
                        </button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md">
                            SAVE
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateResumeModal;