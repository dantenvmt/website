// src/pages/user/UserStatusPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import Toast from '../../components/common/Toast.jsx';
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, ArrowDownCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';


// --- Define Updated Onboarding Steps (Keep as is) ---
const STEP_DEFINITIONS = {
    1: 'Step 1: Contract Upload',
    2: 'Step 2: Gathering Documents',
    3: 'Step 3: Documents Under Review',
    4: 'Step 4: Final Draft Review',
    5: 'Step 5: Documents Submission',
};
const TOTAL_STEPS = Object.keys(STEP_DEFINITIONS).length;

// --- Main User Status Page Component ---
const UserStatusPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [statusInfo, setStatusInfo] = useState({
        step: 1, // This is the user's *current* step
        step_note: null,
        requirements: [],
        contracts: [],
    });
    const [viewingStep, setViewingStep] = useState(1); // <-- NEW: The step the user is currently looking at
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filesToUpload, setFilesToUpload] = useState({});
    const fileInputRefs = useRef({});

    // --- Function to fetch user's status and requirements ---
    const fetchUserStatus = useCallback(async () => {
        if (authLoading || !user || !user.userId) {
            if (!authLoading && !user) setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`https://renaisons.com/api/get_my_status.php`, {
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                const currentStep = result.onboarding_step || 1; // Get the user's actual step
                setStatusInfo({
                    step: currentStep,
                    step_note: result.step_note || null,
                    contracts: result.contracts || [],
                    requirements: result.requirements || []
                });
                setViewingStep(currentStep); // <-- NEW: Set the initial view to the user's current step
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to load status.' });
            }
        } catch (error) {
            console.error("Error fetching user status:", error);
            setMessage({ type: 'error', text: 'An error occurred while fetching your status.' });
        } finally {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (!authLoading && user) {
            fetchUserStatus();
        } else if (!authLoading && !user) {
            setIsLoading(false);
            setStatusInfo({ step: 1, requirements: [], contracts: [], step_note: null });
            setViewingStep(1); // <-- NEW: Reset view on logout
        }
    }, [authLoading, user, fetchUserStatus]);

    // --- File Input Handling (Unchanged) ---
    const handleFileChange = (userDocumentId, event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                setMessage({ type: 'error', text: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}` });
                if (fileInputRefs.current[userDocumentId]) fileInputRefs.current[userDocumentId].value = '';
                setFilesToUpload(prev => {
                    const newState = { ...prev };
                    delete newState[userDocumentId];
                    return newState;
                });
                return;
            }
            setFilesToUpload(prev => ({ ...prev, [userDocumentId]: file }));
            setMessage({ type: '', text: '' });
        } else {
            setFilesToUpload(prev => {
                const newState = { ...prev };
                delete newState[userDocumentId];
                return newState;
            });
        }
    };

    // --- File Upload Submission (Unchanged) ---
    const handleFileUpload = async (userDocumentId) => {
        const file = filesToUpload[userDocumentId];
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first.' });
            return;
        }

        setMessage({ type: 'info', text: 'Uploading...' });
        const formData = new FormData();
        formData.append('user_document_id', userDocumentId);
        formData.append('documentFile', file);

        try {
            const response = await fetch('https://renaisons.com/api/upload_user_document.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: `Document submitted successfully!` });
                fetchUserStatus();
                setFilesToUpload(prev => {
                    const newState = { ...prev };
                    delete newState[userDocumentId];
                    return newState;
                });
                if (fileInputRefs.current[userDocumentId]) {
                    fileInputRefs.current[userDocumentId].value = '';
                }
            } else {
                setMessage({ type: 'error', text: `Upload failed: ${result.message || 'Server error'}` });
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            setMessage({ type: 'error', text: 'An error occurred during upload.' });
        }
    };

    // --- Helper function for status badge color (Unchanged) ---
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-800 text-green-100';
            case 'submitted': return 'bg-yellow-800 text-yellow-100';
            case 'rejected': return 'bg-red-800 text-red-100';
            case 'pending':
            default: return 'bg-gray-700 text-gray-100';
        }
    };
    // --- Helper function for status icon (Unchanged) ---
    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <CheckCircleIcon className="h-4 w-4 mr-1.5" />;
            case 'submitted': return <ClockIcon className="h-4 w-4 mr-1.5" />;
            case 'rejected': return <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />;
            case 'pending': return <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />;
            default: return null;
        }
    };


    // --- Render Logic ---
    if (authLoading || isLoading) {
        return <div className="p-8 md:p-12 text-center text-neutral-400">Loading your status...</div>;
    }
    if (!user) {
        return <div className="p-8 md:p-12 text-center text-neutral-400">Please log in to view your status.</div>;
    }

    // --- MODIFIED: Step Indicator Component ---
    const StepIndicator = ({ currentStep, viewingStep, onStepClick }) => {
        return (
            <nav className="flex items-center justify-center space-x-2 md:space-x-4 mb-10 overflow-x-auto pb-2" aria-label="Progress">
                {Object.entries(STEP_DEFINITIONS).map(([stepNumStr, stepName]) => {
                    const stepNum = parseInt(stepNumStr, 10);
                    const isCompleted = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;
                    const isViewing = stepNum === viewingStep; // <-- Check if this step is being viewed
                    const isClickable = stepNum <= currentStep; // <-- Can only view past/current steps

                    return (
                        <React.Fragment key={stepNum}>
                            {/* The Step Box (now a button) */}
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick(stepNum)} // <-- Add onClick
                                disabled={!isClickable} // <-- Disable button for future steps
                                className={`
                                    flex flex-col items-center p-3 md:p-4 rounded-lg border-2 min-w-[120px] md:min-w-[150px] text-center transition-colors duration-300
                                    ${isViewing ? 'border-blue-500 bg-blue-900/50 shadow-lg' : 'border-neutral-700 bg-neutral-800'}
                                    ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                                    ${isCompleted && !isViewing ? 'opacity-60' : ''}
                                `}
                            >
                                <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isViewing ? 'text-blue-300' : 'text-neutral-400'}`}>
                                    Step {stepNum}
                                </span>
                                <span className={`text-sm font-medium ${isViewing ? 'text-white' : 'text-neutral-300'}`}>
                                    {stepName.split(': ')[1]} {/* Get name part only */}
                                </span>
                            </button>

                            {/* The Pointer */}
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

    // --- MODIFIED: Component to render a single document row ---
    const DocumentRow = ({ doc, isCurrentStep }) => {
        const docId = doc.user_document_id;
        const currentFile = filesToUpload[docId];
        const canUpload = (doc.status === 'pending' || doc.status === 'rejected') && isCurrentStep;

        let downloadUrl = '#';
        let downloadText = 'Download Document';
        if (doc.status === 'pending' || doc.status === 'rejected') {
            if (doc.document_type === 'contract') {
                downloadUrl = `https://renaisons.com/api/download_contract.php`;
                downloadText = '1. Download Blank Contract';
            } else {
                if (doc.submitted_file_path) {
                    downloadUrl = `https://renaisons.com/api/download_user_document.php?doc_id=${docId}`;
                    downloadText = '1. Download Document';
                } else if (doc.document_type !== 'contract') {
                    downloadUrl = '#';
                }
            }
        } else if (doc.status === 'submitted' || doc.status === 'approved') {
            downloadUrl = `https://renaisons.com/api/download_user_document.php?doc_id=${docId}`;
            downloadText = 'View Submitted/Approved File';
        }


        return (
            <div key={docId} className="p-4 border border-neutral-700 rounded-md bg-neutral-900/50">
                {/* Document Info */}
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-2">
                    <h3 className="text-lg font-medium text-white">{doc.document_name}</h3>
                    <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)} flex-shrink-0`}>
                        {getStatusIcon(doc.status)} {doc.status}
                    </span>
                </div>
                {doc.document_notes && (
                    <p className="text-sm text-neutral-400 mb-3">Notes: {doc.document_notes}</p>
                )}
                {doc.status === 'rejected' && doc.admin_notes && (
                    <p className="text-sm text-red-300 bg-red-900/30 p-2 rounded border border-red-700 mb-3">
                        Admin Feedback: {doc.admin_notes}
                    </p>
                )}

                {/* Actions */}
                {canUpload && (
                    <div className="space-y-4 mt-3 border-t border-neutral-700 pt-3">
                        {/* Download Button */}
                        {downloadUrl !== '#' && (
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                            >
                                <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                                {downloadText}
                            </a>
                        )}

                        {/* --- MODIFIED FILE UPLOAD UI --- */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Custom File Input Button */}
                            <label htmlFor={`file-${docId}`} className="cursor-pointer bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors text-center flex-shrink-0">
                                Choose File
                            </label>
                            {/* Visually hidden actual file input */}
                            <input
                                type="file"
                                id={`file-${docId}`}
                                name={`file-${docId}`}
                                ref={el => fileInputRefs.current[docId] = el}
                                onChange={(e) => handleFileChange(docId, e)}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                className="sr-only" // This Tailwind class hides it
                            />
                            {/* Display selected file name or "No file chosen" */}
                            <span className="text-sm text-neutral-400 truncate flex-grow" style={{ minHeight: '1.5rem' }}>
                                {currentFile ? currentFile.name : 'No file chosen'}
                            </span>

                            {/* Submit Button */}
                            <button
                                onClick={() => handleFileUpload(docId)}
                                disabled={!currentFile || message.type === 'info'} // Disable during upload
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                {message.type === 'info' && filesToUpload[docId] ? 'Uploading...' : '2. Submit File'}
                            </button>
                        </div>
                        {/* --- END MODIFIED FILE UPLOAD UI --- */}

                    </div>
                )}

                {!canUpload && (doc.status === 'pending' || doc.status === 'rejected') && (
                    <p className="text-sm text-neutral-400 mt-2 border-t border-neutral-700 pt-3">
                        {doc.status === 'rejected' ? 'This document was rejected. Please go to your current step to re-upload.' : 'This document is pending submission.'}
                    </p>
                )}
                {doc.status === 'submitted' && (
                    <p className="text-sm text-yellow-300 mt-2 border-t border-neutral-700 pt-3">Document submitted, pending review.</p>
                )}
                {doc.status === 'approved' && (
                    <div className="mt-2 border-t border-neutral-700 pt-3">
                        <p className="text-sm text-green-300 mb-2">Document approved.</p>
                        <a
                            href={downloadUrl} // Should be download_user_document URL
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
                        >
                            View Approved File
                        </a>
                    </div>
                )}
            </div>
        );
    };
    // --- *** END OF DocumentRow Component *** ---


    return (
        <div className="p-8 md:p-12 text-white">
            <h1 className="text-4xl font-bold mb-6 text-center">My Onboarding Status</h1>

            <StepIndicator
                currentStep={statusInfo.step}
                viewingStep={viewingStep}
                onStepClick={setViewingStep}
            />

            {/* Overall messages */}
            {message.text && (
                <div className="max-w-4xl mx-auto mb-4">
                    <p className={`text-sm p-3 rounded text-center ${message.type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-300' :
                        message.type === 'success' ? 'bg-green-900/50 border border-green-700 text-green-300' :
                            'bg-blue-900/50 border border-blue-700 text-blue-300'
                        }`}>
                        {message.text}
                    </p>
                </div>
            )}

            {/* Conditional Content */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 max-w-4xl mx-auto">
                {statusInfo.step_note && viewingStep === statusInfo.step && (
                    <div className="mb-6 p-4 border border-blue-700 bg-blue-900/30 rounded-md flex items-start space-x-3">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-300">Note from Admin Regarding This Step:</h3>
                            <p className="text-sm text-neutral-200 whitespace-pre-wrap">{statusInfo.step_note}</p>
                        </div>
                    </div>
                )}

                {viewingStep === 1 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Contract Agreements</h2>
                        {statusInfo.contracts.length === 0 ? (
                            <p className="text-neutral-400">Please wait for the administrator to upload your contract(s).</p>
                        ) : (
                            <div className="space-y-6">
                                {statusInfo.contracts.map(contract => (
                                    <DocumentRow
                                        key={contract.user_document_id}
                                        doc={contract}
                                        isCurrentStep={statusInfo.step === viewingStep} // Pass check
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {viewingStep === 2 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Required Documents</h2>
                        {statusInfo.requirements.length === 0 ? (
                            <p className="text-neutral-400">No additional documents are currently required for this step.</p>
                        ) : (
                            <div className="space-y-6">
                                {statusInfo.requirements.map(req => (
                                    <DocumentRow
                                        key={req.user_document_id}
                                        doc={req}
                                        isCurrentStep={statusInfo.step === viewingStep} // Pass check
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {viewingStep >= 3 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">{STEP_DEFINITIONS[viewingStep] || 'Onboarding'}</h2>
                        <div className="space-y-4">
                            {[...statusInfo.contracts, ...statusInfo.requirements]
                                .sort((a, b) => a.document_name.localeCompare(b.document_name))
                                .map(doc => (
                                    <div key={doc.user_document_id} className="flex justify-between items-center p-3 bg-neutral-900/50 border border-neutral-700 rounded">
                                        <span className="text-white">{doc.document_name}</span>
                                        <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                                            {getStatusIcon(doc.status)} {doc.status}
                                        </span>
                                    </div>
                                ))}
                        </div>
                        {viewingStep === 3 && statusInfo.step === 3 && <p className="text-neutral-400 mt-4">Your documents are under review.</p>}
                        {viewingStep === 5 && <p className="text-green-400 mt-4">Onboarding complete!</p>}
                    </>
                )}

            </section>

            {/* Toast component for displaying messages */}
            <Toast
                show={message.type === 'success' || message.type === 'error'} // Only show toast for success/error
                message={message.text}
                onClose={() => setMessage({ type: '', text: '' })}
            />
        </div>
    );
};

export default UserStatusPage;

