// src/pages/user/UserStatusPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js'; // Added .js extension
import Toast from '../../components/common/Toast.jsx'; // Added .jsx extension
// --- END FIX ---
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

// Helper function to format date/time
const formatNoteTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
        // Adjust timezone if necessary, assumes server stores in UTC or local server time
        const date = new Date(timestamp);
        // Format to something like "Oct 25, 2025, 1:15:30 AM" (will vary by locale)
        return date.toLocaleString();
    } catch (e) {
        console.error("Error formatting timestamp:", e);
        return timestamp; // Fallback to raw timestamp
    }
};


// --- Main User Status Page Component ---
const UserStatusPage = () => {
    const { user, loading: authLoading } = useAuth();
    // --- State: Store a list of notes ---
    const [statusInfo, setStatusInfo] = useState({
        step: 1, // User's actual current step
        stepNotesList: [], // Store all notes as an array
        requirements: [],
        contracts: [],
    });
    const [viewingStep, setViewingStep] = useState(1); // The step the user is currently looking at
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [filesToUpload, setFilesToUpload] = useState({});
    const fileInputRefs = useRef({});

    // --- Function to fetch user's status and requirements ---
    const fetchUserStatus = useCallback(async () => {
        // Prevent fetching if auth is loading or user is not available
        if (authLoading || !user || !user.userId) {
            // If auth check is done but there's no user, stop loading
            if (!authLoading && !user) setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // Fetch status data from the backend
            const response = await fetch(`https://renaisons.com/api/get_my_status.php`, {
                credentials: 'include' // Important for sending session cookies
            });
            const result = await response.json();

            // Check if the request was successful
            if (response.ok && result.status === 'success') {
                const currentStep = result.onboarding_step || 1; // Default to step 1 if not set
                // Update state with fetched data
                setStatusInfo({
                    step: currentStep,
                    stepNotesList: result.step_notes_list || [], // Get the list of notes
                    contracts: result.contracts || [],
                    requirements: result.requirements || []
                });
                setViewingStep(currentStep); // Initially view the user's current step
            } else {
                // Set an error message if fetching failed
                setMessage({ type: 'error', text: result.message || 'Failed to load status.' });
            }
        } catch (error) {
            // Handle network or other errors during fetch
            console.error("Error fetching user status:", error);
            setMessage({ type: 'error', text: 'An error occurred while fetching your status.' });
        } finally {
            // Stop loading indicator regardless of outcome
            setIsLoading(false);
        }
    }, [user, authLoading]); // Dependencies for useCallback

    // Effect to fetch status when auth state is ready or changes
    useEffect(() => {
        if (!authLoading && user) {
            fetchUserStatus();
        } else if (!authLoading && !user) {
            // If auth check is done and there's no user, reset state and stop loading
            setIsLoading(false);
            setStatusInfo({ step: 1, requirements: [], contracts: [], stepNotesList: [] });
            setViewingStep(1);
        }
    }, [authLoading, user, fetchUserStatus]); // Dependencies for useEffect

    // --- File Input Handling ---
    const handleFileChange = (userDocumentId, event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file extension
            const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                setMessage({ type: 'error', text: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}` });
                // Reset the file input visually and clear state
                if (fileInputRefs.current[userDocumentId]) fileInputRefs.current[userDocumentId].value = '';
                setFilesToUpload(prev => {
                    const newState = { ...prev };
                    delete newState[userDocumentId];
                    return newState;
                });
                return; // Stop processing invalid file
            }
            // Store valid file in state
            setFilesToUpload(prev => ({ ...prev, [userDocumentId]: file }));
            setMessage({ type: '', text: '' }); // Clear any previous messages
        } else {
            // Clear file from state if user cancels selection
            setFilesToUpload(prev => {
                const newState = { ...prev };
                delete newState[userDocumentId];
                return newState;
            });
        }
    };

    // --- File Upload Submission ---
    const handleFileUpload = async (userDocumentId) => {
        const file = filesToUpload[userDocumentId];
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first.' });
            return;
        }

        setMessage({ type: 'info', text: 'Uploading...' }); // Show uploading message
        const formData = new FormData();
        formData.append('user_document_id', userDocumentId);
        formData.append('documentFile', file);

        try {
            // Send file to the backend API
            const response = await fetch('https://renaisons.com/api/upload_user_document.php', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Send session cookies
            });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: `Document submitted successfully!` });
                fetchUserStatus(); // Refresh the status and document list
                // Clear the uploaded file from state
                setFilesToUpload(prev => {
                    const newState = { ...prev };
                    delete newState[userDocumentId];
                    return newState;
                });
                // Reset the file input visually
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

    // --- Helper function for status badge color ---
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) { // Added null check and lowercase
            case 'approved': return 'bg-green-800 text-green-100';
            case 'submitted': return 'bg-yellow-800 text-yellow-100';
            case 'rejected': return 'bg-red-800 text-red-100';
            case 'pending':
            default: return 'bg-gray-700 text-gray-100';
        }
    };
    // --- Helper function for status icon ---
    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) { // Added null check and lowercase
            case 'approved': return <CheckCircleIcon className="h-4 w-4 mr-1.5" />;
            case 'submitted': return <ClockIcon className="h-4 w-4 mr-1.5" />;
            case 'rejected': return <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />;
            case 'pending': return <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />;
            default: return null;
        }
    };


    // --- Render Logic ---
    // Show loading state while auth or status data is being fetched
    if (authLoading || isLoading) {
        return <div className="p-8 md:p-12 text-center text-neutral-400">Loading your status...</div>;
    }
    // Show message if user is not logged in after auth check
    if (!user) {
        return <div className="p-8 md:p-12 text-center text-neutral-400">Please log in to view your status.</div>;
    }

    // --- Step Indicator Component ---
    // Renders the clickable step navigation bar
    const StepIndicator = ({ currentStep, viewingStep, onStepClick }) => {
        return (
            <nav className="flex items-center justify-center space-x-2 md:space-x-4 mb-10 overflow-x-auto pb-2" aria-label="Progress">
                {Object.entries(STEP_DEFINITIONS).map(([stepNumStr, stepName]) => {
                    const stepNum = parseInt(stepNumStr, 10);
                    const isCompleted = stepNum < currentStep; // Step is done
                    const isCurrent = stepNum === currentStep; // User is currently on this step
                    const isViewing = stepNum === viewingStep; // User is looking at this step's details
                    const isClickable = stepNum <= currentStep; // User can view this step or previous ones

                    return (
                        <React.Fragment key={stepNum}>
                            {/* Button for each step */}
                            <button
                                type="button"
                                onClick={() => isClickable && onStepClick(stepNum)} // Change view on click if allowed
                                disabled={!isClickable} // Disable future steps
                                className={`
                                    flex flex-col items-center p-3 md:p-4 rounded-lg border-2 min-w-[120px] md:min-w-[150px] text-center transition-colors duration-300
                                    ${isViewing ? 'border-blue-500 bg-blue-900/50 shadow-lg' : 'border-neutral-700 bg-neutral-800'}
                                    ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-neutral-500'}
                                    ${isCompleted && !isViewing ? 'opacity-60' : ''} {/* Dim completed steps not being viewed */}
                                `}
                            >
                                <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isViewing ? 'text-blue-300' : 'text-neutral-400'}`}>
                                    Step {stepNum}
                                </span>
                                <span className={`text-sm font-medium ${isViewing ? 'text-white' : 'text-neutral-300'}`}>
                                    {stepName.split(': ')[1]} {/* Show only the name part */}
                                </span>
                            </button>

                            {/* Arrow connector between steps */}
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

    // --- Document Row Component ---
    // Renders details and actions for a single contract or requirement
    const DocumentRow = ({ doc, isCurrentStep }) => {
        const docId = doc.user_document_id;
        const currentFile = filesToUpload[docId]; // File currently selected in input
        // User can upload if the doc is pending/rejected AND they are viewing their current step
        const canUpload = (doc.status === 'pending' || doc.status === 'rejected') && isCurrentStep;

        let downloadUrl = '#'; // Default URL
        let downloadText = 'Download Document'; // Default button text

        // Determine download URL and text based on document type and status
        if (doc.status === 'pending' || doc.status === 'rejected') {
            if (doc.document_type === 'contract') {
                // Specific URL for downloading blank contracts
                downloadUrl = `https://renaisons.com/api/download_contract.php`; // Adjust if needed
                downloadText = '1. Download Blank Contract';
            } else if (doc.submitted_file_path) { // For rejected 'other' documents that had a previous submission
                downloadUrl = `https://renaisons.com/api/download_user_document.php?doc_id=${docId}`;
                downloadText = 'View Rejected File';
            } else { // For pending 'other' documents with no initial file submitted
                downloadText = ''; // No file to download yet
            }
        } else if (doc.status === 'submitted' || doc.status === 'approved') {
            // URL to download the file the user submitted
            downloadUrl = `https://renaisons.com/api/download_user_document.php?doc_id=${docId}`;
            downloadText = 'View Submitted/Approved File';
        }

        return (
            <div key={docId} className="p-4 border border-neutral-700 rounded-md bg-neutral-900/50">
                {/* Document Name and Status Badge */}
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-2 gap-2">
                    <h3 className="text-lg font-medium text-white">{doc.document_name}</h3>
                    <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)} flex-shrink-0`}>
                        {getStatusIcon(doc.status)} {doc.status || 'Unknown'} {/* Added fallback */}
                    </span>
                </div>
                {/* Admin notes specific to this document (if any) */}
                {doc.document_notes && (
                    <p className="text-sm text-neutral-400 mb-3">Notes: {doc.document_notes}</p>
                )}
                {/* Admin feedback if the document was rejected */}
                {doc.status === 'rejected' && doc.admin_notes && (
                    <p className="text-sm text-red-300 bg-red-900/30 p-2 rounded border border-red-700 mb-3">
                        Admin Feedback: {doc.admin_notes}
                    </p>
                )}

                {/* Actions Section (Download/Upload) */}
                {/* Show upload controls only if status is pending/rejected AND user is viewing their current step */}
                {canUpload && (
                    <div className="space-y-4 mt-3 border-t border-neutral-700 pt-3">
                        {/* Download Button (only shown if there's a valid URL and text) */}
                        {downloadUrl !== '#' && downloadText && (
                            <a
                                href={downloadUrl}
                                target="_blank" // Open in new tab
                                rel="noopener noreferrer" // Security best practice
                                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                            >
                                <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                                {downloadText}
                            </a>
                        )}

                        {/* File Upload UI */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            {/* Button styled as a label to trigger file input */}
                            <label htmlFor={`file-${docId}`} className="cursor-pointer bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors text-center flex-shrink-0">
                                Choose File
                            </label>
                            {/* Actual file input, visually hidden */}
                            <input
                                type="file"
                                id={`file-${docId}`}
                                name={`file-${docId}`}
                                ref={el => fileInputRefs.current[docId] = el} // Store ref to clear later
                                onChange={(e) => handleFileChange(docId, e)}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Allowed file types
                                className="sr-only" // Tailwind class to hide
                            />
                            {/* Display the name of the chosen file */}
                            <span className="text-sm text-neutral-400 truncate flex-grow" style={{ minHeight: '1.5rem' }}>
                                {currentFile ? currentFile.name : 'No file chosen'}
                            </span>
                            {/* Submit Button */}
                            <button
                                onClick={() => handleFileUpload(docId)}
                                disabled={!currentFile || message.type === 'info'} // Disable if no file or uploading
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                {/* Show dynamic text during upload */}
                                {message.type === 'info' && filesToUpload[docId] ? 'Uploading...' : '2. Submit File'}
                            </button>
                        </div>
                    </div>
                )}
                {/* Display messages for states where user cannot upload */}
                {!canUpload && (doc.status === 'pending' || doc.status === 'rejected') && (
                    <p className="text-sm text-neutral-400 mt-2 border-t border-neutral-700 pt-3">
                        {(doc.status === 'rejected' && !isCurrentStep) ? 'This document was rejected. Please go to your current step to re-upload.' : ''}
                        {(doc.status === 'pending' && !isCurrentStep) ? 'This document is pending submission.' : ''}
                    </p>
                )}
                {/* Message for submitted documents */}
                {doc.status === 'submitted' && (
                    <p className="text-sm text-yellow-300 mt-2 border-t border-neutral-700 pt-3">Document submitted, pending review.</p>
                )}
                {/* Message and link for approved documents */}
                {doc.status === 'approved' && (
                    <div className="mt-2 border-t border-neutral-700 pt-3">
                        <p className="text-sm text-green-300 mb-2">Document approved.</p>
                        <a
                            href={downloadUrl} // Link to view the approved file
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

    // --- Filter the notes list to get only notes relevant to the step being viewed ---
    const notesForViewingStep = statusInfo.stepNotesList.filter(note => note.step_number === viewingStep);

    return (
        <div className="p-8 md:p-12 text-white">
            <h1 className="text-4xl font-bold mb-6 text-center">My Onboarding Status</h1>

            {/* Render the step navigation */}
            <StepIndicator
                currentStep={statusInfo.step}
                viewingStep={viewingStep}
                onStepClick={setViewingStep} // Allow changing the viewed step
            />

            {/* Display overall messages (like upload success/failure) */}
            {message.text && (
                <div className="max-w-4xl mx-auto mb-4">
                    <p className={`text-sm p-3 rounded text-center ${message.type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-300' :
                        message.type === 'success' ? 'bg-green-900/50 border border-green-700 text-green-300' :
                            'bg-blue-900/50 border border-blue-700 text-blue-300' // Info color
                        }`}>
                        {message.text}
                    </p>
                </div>
            )}

            {/* Main content section */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 max-w-4xl mx-auto">
                {/* Display note history for the viewed step */}
                {notesForViewingStep.length > 0 && (
                    <div className="mb-6 space-y-4">
                        <h3 className="text-lg font-medium text-blue-300 flex items-center">
                            <InformationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true" />
                            Notes from Admin Regarding Step {viewingStep}:
                        </h3>
                        {/* Map through the filtered notes and display each one */}
                        {notesForViewingStep.map((note) => (
                            <div key={note.note_id} className="p-3 border border-blue-900 bg-blue-950/30 rounded-md">
                                <p className="text-sm text-neutral-200 whitespace-pre-wrap">{note.note_content}</p>
                                <p className="text-xs text-neutral-500 mt-2 text-right">{formatNoteTimestamp(note.created_at)}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Conditional rendering based on the step being viewed */}
                {/* Step 1 Content: Contracts */}
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
                                        isCurrentStep={statusInfo.step === viewingStep} // Pass if user can interact
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Step 2 Content: Requirements */}
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
                                        isCurrentStep={statusInfo.step === viewingStep} // Pass if user can interact
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Content for Steps 3+: Summary view */}
                {viewingStep >= 3 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">{STEP_DEFINITIONS[viewingStep] || 'Onboarding'}</h2>
                        {/* List all documents with their status */}
                        <div className="space-y-4">
                            {[...statusInfo.contracts, ...statusInfo.requirements]
                                .sort((a, b) => a.document_name.localeCompare(b.document_name)) // Sort alphabetically
                                .map(doc => (
                                    <div key={doc.user_document_id} className="flex justify-between items-center p-3 bg-neutral-900/50 border border-neutral-700 rounded">
                                        <span className="text-white">{doc.document_name}</span>
                                        <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                                            {getStatusIcon(doc.status)} {doc.status || 'Unknown'}
                                        </span>
                                    </div>
                                ))}
                        </div>
                        {/* Status messages for steps 3+ */}
                        {viewingStep === 3 && statusInfo.step === 3 && <p className="text-neutral-400 mt-4">Your documents are under review.</p>}
                        {viewingStep >= 4 && viewingStep === statusInfo.step && <p className="text-neutral-400 mt-4">Please wait for admin action.</p>}
                        {viewingStep < statusInfo.step && <p className="text-green-400 mt-4">This step is complete.</p>}
                        {viewingStep === 5 && statusInfo.step === 5 && <p className="text-green-400 mt-4">Onboarding complete!</p>}
                    </>
                )}

            </section>

            {/* Toast component for displaying success/error messages */}
            <Toast
                show={message.type === 'success' || message.type === 'error'}
                message={message.text}
                onClose={() => setMessage({ type: '', text: '' })} // Clear message on close
            />
        </div>
    );
};

export default UserStatusPage;

