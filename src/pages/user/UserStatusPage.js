// src/pages/user/UserStatusPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

// --- Define Updated Onboarding Steps ---
const STEP_DEFINITIONS = {
    1: 'Step 1: Contract Upload',       // Updated
    2: 'Step 2: Gathering Documents',   // Updated
    3: 'Step 3: Documents Under Review', // Updated
    4: 'Step 4: Change name later',
    5: 'Step 5: Change name later',
    // Add more steps as needed
};
const TOTAL_STEPS = Object.keys(STEP_DEFINITIONS).length; // Calculate total steps

// --- Main User Status Page Component ---
const UserStatusPage = () => {
    const { user, loading: authLoading } = useAuth();
    // Include contract status/info if backend provides it
    const [statusInfo, setStatusInfo] = useState({ step: 1, requirements: [], contractPath: null, contractStatus: 'pending' });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [fileInputs, setFileInputs] = useState({});
    const fileInputRefs = useRef({});

    // --- Function to fetch user's status and requirements ---
    const fetchUserStatus = useCallback(async () => {
        if (authLoading || !user || !user.userId) {
            if (!authLoading && !user) setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const response = await fetch(`https://renaisons.com/api/get_my_status.php`, {
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setStatusInfo({
                    step: result.onboarding_step || 1,
                    requirements: result.requirements || [],
                    // --- NEW: Expect contract info from backend ---
                    contractPath: result.contract?.file_path || null,
                    contractStatus: result.contract?.status || 'pending' // e.g., 'pending', 'uploaded', 'approved'
                });
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to load status.' });
            }
        } catch (error) {
            console.error("Error fetching user status:", error);
            setMessage({ type: 'error', text: 'An error occurred while fetching your status.' });
        } finally {
            setIsLoading(false);
        }
    }, [user, authLoading]); // Added authLoading dependency

    useEffect(() => {
        if (!authLoading && user) {
            fetchUserStatus();
        } else if (!authLoading && !user) {
            setIsLoading(false);
            setStatusInfo({ step: 1, requirements: [], contractPath: null, contractStatus: 'pending' });
        }
    }, [authLoading, user, fetchUserStatus]);

    // --- File Input Handling (Keep as is) ---
    const handleFileChange = (requirementId, event) => { /* ... unchanged ... */
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const allowedExtensions = ['.pdf', '.doc', '.docx'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
                setMessage({ type: 'error', text: 'Invalid file type. Please upload PDF, DOC, or DOCX.' });
                if (fileInputRefs.current[requirementId]) fileInputRefs.current[requirementId].value = '';
                setFileInputs(prev => ({ ...prev, [requirementId]: null }));
                return;
            }
            setFileInputs(prev => ({ ...prev, [requirementId]: file }));
            setMessage({ type: '', text: '' }); // Clear error on valid selection
        } else {
            setFileInputs(prev => {
                const newState = { ...prev };
                delete newState[requirementId];
                return newState;
            });
        }
    };

    // --- File Upload Submission (Keep as is) ---
    const handleFileUpload = async (userDocumentId) => { /* ... unchanged ... */
        const file = fileInputs[userDocumentId];
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first.' });
            return;
        }
        setMessage({ type: 'info', text: 'Uploading...' });
        const formData = new FormData();
        formData.append('user_document_id', userDocumentId);
        formData.append('documentFile', file);
        try {
            // Fetch call to your upload script
            const response = await fetch('https://renaisons.com/api/upload_user_document.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: `Document submitted successfully!` });
                fetchUserStatus(); // Refresh status
                setFileInputs(prev => {
                    const newState = { ...prev };
                    delete newState[userDocumentId];
                    return newState;
                });
                if (fileInputRefs.current[userDocumentId]) fileInputRefs.current[userDocumentId].value = '';
            } else {
                setMessage({ type: 'error', text: `Upload failed: ${result.message || 'Server error'}` });
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            setMessage({ type: 'error', text: 'An error occurred during upload.' });
        }
    };

    // --- Helper function for status badge color (Keep as is) ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-800 text-green-100';
            case 'submitted': return 'bg-yellow-800 text-yellow-100';
            case 'rejected': return 'bg-red-800 text-red-100';
            case 'pending':
            default: return 'bg-gray-700 text-gray-100';
        }
    };

    // --- Render Logic ---
    if (authLoading || isLoading) {
        return <div className="p-8 md:p-12 text-center text-neutral-400">Loading your status...</div>;
    }
    if (!user) {
        return <div className="p-8 md:p-12 text-center text-neutral-400">Please log in to view your status.</div>;
    }

    // --- Step Indicator Component (Keep as is) ---
    const StepIndicator = ({ currentStep }) => { /* ... unchanged ... */
         return (
            <nav className="flex items-center justify-center space-x-2 md:space-x-4 mb-10 overflow-x-auto pb-2" aria-label="Progress">
                {Object.entries(STEP_DEFINITIONS).map(([stepNumStr, stepName]) => {
                    const stepNum = parseInt(stepNumStr, 10);
                    const isCompleted = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;
                    const isUpcoming = stepNum > currentStep;

                    return (
                        <React.Fragment key={stepNum}>
                            {/* The Step Box */}
                            <div className={`
                                flex flex-col items-center p-3 md:p-4 rounded-lg border-2 min-w-[120px] md:min-w-[150px] text-center transition-colors duration-300
                                ${isCurrent ? 'border-blue-500 bg-blue-900/50 shadow-lg' : 'border-neutral-700 bg-neutral-800'}
                                ${isCompleted ? 'opacity-60' : ''}
                            `}>
                                <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isCurrent ? 'text-blue-300' : 'text-neutral-400'}`}>
                                    Step {stepNum}
                                </span>
                                <span className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-neutral-300'}`}>
                                    {stepName.split(': ')[1]} {/* Get name part only */}
                                </span>
                            </div>

                            {/* The Pointer (don't show after the last step) */}
                            {stepNum < TOTAL_STEPS && (
                                <svg className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 ${isCompleted || isCurrent ? 'text-blue-500' : 'text-neutral-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>
        );
    };

    return (
        <div className="p-8 md:p-12 text-white">
            <h1 className="text-4xl font-bold mb-6 text-center">My Onboarding Status</h1>

            <StepIndicator currentStep={statusInfo.step} />

            {/* --- Display overall messages (Keep as is) --- */}
            {message.text && (
                 <p className={`text-sm mb-4 p-3 rounded max-w-4xl mx-auto ${message.type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-300' :
                        message.type === 'success' ? 'bg-green-900/50 border border-green-700 text-green-300' :
                            'bg-blue-900/50 border border-blue-700 text-blue-300'
                        }`}>
                    {message.text}
                </p>
            )}

            {/* --- Conditional Content Based on Step --- */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 max-w-4xl mx-auto">

                {/* --- Step 1: Contract --- */}
                {statusInfo.step === 1 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Contract Agreement</h2>
                        {statusInfo.contractPath ? (
                            <div className="p-4 border border-neutral-700 rounded-md bg-neutral-900/50">
                                <p className="text-neutral-300 mb-3">Your contract has been uploaded by the administrator.</p>
                                <a
                                    // Assuming backend provides a way to download admin uploads,
                                    // similar to user uploads but maybe a different script or parameter.
                                    // Adjust the href as needed.
                                    href={`https://renaisons.com/api/download_contract.php?user_id=${user.userId}`} // EXAMPLE URL
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                                >
                                    Download Contract
                                </a>
                                {/* You could also show contractStatus here if backend provides it */}
                                {/* <p className="text-sm mt-2">Status: <span className={getStatusColor(statusInfo.contractStatus)}>{statusInfo.contractStatus}</span></p> */}
                            </div>
                        ) : (
                            <p className="text-neutral-400">Please wait for the administrator to upload your contract.</p>
                        )}
                    </>
                )}

                {/* --- Step 2: Gathering Documents --- */}
                {statusInfo.step === 2 && (
                     <>
                        <h2 className="text-2xl font-semibold mb-4">Required Documents</h2>
                        {statusInfo.requirements.length === 0 ? (
                            <p className="text-neutral-400">No documents are currently required for this step.</p>
                        ) : (
                            <div className="space-y-6">
                                {statusInfo.requirements.map(req => (
                                    <div key={req.user_document_id} className="p-4 border border-neutral-700 rounded-md bg-neutral-900/50">
                                        {/* Requirement Info */}
                                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-2">
                                            <h3 className="text-lg font-medium text-white">{req.document_name}</h3>
                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)} flex-shrink-0`}>
                                                {req.status}
                                            </span>
                                        </div>
                                        {req.document_notes && (
                                            <p className="text-sm text-neutral-400 mb-3">Notes: {req.document_notes}</p>
                                        )}
                                        {req.status === 'rejected' && req.admin_notes && (
                                            <p className="text-sm text-red-300 bg-red-900/30 p-2 rounded border border-red-700 mb-3">
                                                Admin Feedback: {req.admin_notes}
                                            </p>
                                        )}

                                        {/* Upload Section (only if pending or rejected) */}
                                        {(req.status === 'pending' || req.status === 'rejected') && (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-3 border-t border-neutral-700 pt-3">
                                                <input
                                                    type="file"
                                                    id={`file-${req.user_document_id}`}
                                                    ref={el => fileInputRefs.current[req.user_document_id] = el}
                                                    onChange={(e) => handleFileChange(req.user_document_id, e)}
                                                    accept=".pdf,.doc,.docx" // Use constant ALLOWED_FILE_TYPES if available via context/props
                                                    className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                                />
                                                <button
                                                    onClick={() => handleFileUpload(req.user_document_id)}
                                                    disabled={!fileInputs[req.user_document_id]}
                                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                                >
                                                    Submit Document
                                                </button>
                                            </div>
                                        )}
                                        {/* Status Messages */}
                                        {req.status === 'submitted' && (
                                            <p className="text-sm text-yellow-300 mt-2 border-t border-neutral-700 pt-3">Document submitted, pending review.</p>
                                        )}
                                        {req.status === 'approved' && (
                                            <p className="text-sm text-green-300 mt-2 border-t border-neutral-700 pt-3">Document approved.</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                 {/* --- Step 3: Documents Under Review --- */}
                {statusInfo.step === 3 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Documents Under Review</h2>
                        <p className="text-neutral-400">Your submitted documents are currently being reviewed by the administration. You will be notified once the review is complete, or if any further action is required.</p>
                         {/* Optionally, display the list of submitted/approved documents here without upload buttons */}
                    </>
                )}

                 {/* --- Steps 4+ --- */}
                 {statusInfo.step > 3 && (
                     <>
                        <h2 className="text-2xl font-semibold mb-4">{STEP_DEFINITIONS[statusInfo.step]}</h2>
                        <p className="text-neutral-400">Details for this step will appear here.</p>
                     </>
                 )}

            </section>
        </div>
    );
};

export default UserStatusPage;