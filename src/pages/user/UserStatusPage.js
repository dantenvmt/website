// src/pages/user/UserStatusPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast'; // Toast component for messages
import { CheckCircleIcon, ClockIcon, ExclamationTriangleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline'; // Icons


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
    // --- MODIFIED: State now holds 'contracts' array ---
    const [statusInfo, setStatusInfo] = useState({
        step: 1,
        requirements: [], // For Step 2+ docs
        contracts: [],    // For Step 1 contracts
    });
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    // Use one state object to hold files being prepared for upload
    const [filesToUpload, setFilesToUpload] = useState({}); // { user_document_id: File }
    // Refs for clearing file inputs visually
    const fileInputRefs = useRef({});

    // --- Function to fetch user's status and requirements ---
    const fetchUserStatus = useCallback(async () => {
        // ... (guard clauses for authLoading/user remain same) ...
        if (authLoading || !user || !user.userId) {
            if (!authLoading && !user) setIsLoading(false);
            return;
        }
        setIsLoading(true);
        // Don't clear message on auto-refresh
        // setMessage({ type: '', text: '' });
        try {
            const response = await fetch(`https://renaisons.com/api/get_my_status.php`, {
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                // --- MODIFIED: Update state based on new API response ---
                setStatusInfo({
                    step: result.onboarding_step || 1,
                    // Use the contracts array from API for step 1
                    contracts: result.contracts || [],
                    // Use the requirements array from API for step 2+
                    requirements: result.requirements || []
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
    }, [user, authLoading]); // Dependency array is correct

    useEffect(() => {
        // ... (logic remains same: fetch if user loaded, clear if no user) ...
        if (!authLoading && user) {
            fetchUserStatus();
        } else if (!authLoading && !user) {
            setIsLoading(false);
            // Clear state correctly
            setStatusInfo({ step: 1, requirements: [], contracts: [] });
        }
    }, [authLoading, user, fetchUserStatus]);

    // --- File Input Handling ---
    const handleFileChange = (userDocumentId, event) => {
        const file = event.target.files[0];
        if (file) {
            // Basic validation (optional)
            const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']; // Add image types if needed
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
            // Store the file keyed by its document ID
            setFilesToUpload(prev => ({ ...prev, [userDocumentId]: file }));
            setMessage({ type: '', text: '' }); // Clear error on valid selection
        } else {
            // Clear the file if user cancels selection
            setFilesToUpload(prev => {
                const newState = { ...prev };
                delete newState[userDocumentId];
                return newState;
            });
        }
    };

    // --- File Upload Submission ---
    // This function works for BOTH contracts (Step 1) and requirements (Step 2)
    const handleFileUpload = async (userDocumentId) => {
        const file = filesToUpload[userDocumentId];
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first.' });
            return;
        }

        setMessage({ type: 'info', text: 'Uploading...' });
        const formData = new FormData();
        formData.append('user_document_id', userDocumentId); // Required by upload_user_document.php
        formData.append('documentFile', file);             // Required by upload_user_document.php

        try {
            // Use the correct script for user uploads
            const response = await fetch('https://renaisons.com/api/upload_user_document.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: `Document submitted successfully!` });
                fetchUserStatus(); // Refresh status after successful upload
                // Clear the specific file from state and visually
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
        // No finally block needed here, message state handles loading text
    };

    // --- Helper function for status badge color (Unchanged) ---
    const getStatusColor = (status) => { /* ... */
        switch (status) {
            case 'approved': return 'bg-green-800 text-green-100';
            case 'submitted': return 'bg-yellow-800 text-yellow-100';
            case 'rejected': return 'bg-red-800 text-red-100';
            case 'pending':
            default: return 'bg-gray-700 text-gray-100';
        }
    };
    // --- Helper function for status icon ---
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

    // --- Step Indicator Component (Unchanged) ---
    const StepIndicator = ({ currentStep }) => { /* ... */
        return (
            <nav className="flex items-center justify-center space-x-2 md:space-x-4 mb-10 overflow-x-auto pb-2" aria-label="Progress">
                {Object.entries(STEP_DEFINITIONS).map(([stepNumStr, stepName]) => {
                    const stepNum = parseInt(stepNumStr, 10);
                    const isCompleted = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;
                    // const isUpcoming = stepNum > currentStep; // Not currently used

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

    // --- *** NEW: Component to render a single document row *** ---
    // This is used for BOTH contracts (Step 1) and requirements (Step 2)
    const DocumentRow = ({ doc }) => {
        const docId = doc.user_document_id;
        const currentFile = filesToUpload[docId];

        // Determine download link based on status
        let downloadUrl = '#';
        let downloadText = 'Download Document';
        if (doc.status === 'pending' || doc.status === 'rejected') {
            // For pending/rejected, link to the *original* admin upload.
            // Your download_contract.php specifically fetches the 'Contract Agreement' for the user.
            // If this row *is* a contract, use that. Otherwise, use download_user_document.php
            if (doc.document_type === 'contract') {
                // Assuming download_contract.php always gets the latest admin version for this user
                downloadUrl = `https://renaisons.com/api/download_contract.php`;
                downloadText = '1. Download Blank Contract';
            } else {
                // If it's an 'other' document type that's pending, admin needs to upload first.
                // Or maybe this state shouldn't happen for 'other'? Assuming admin uploads first.
                // For safety, link to download_user_document if a path exists.
                downloadUrl = doc.submitted_file_path ? `https://renaisons.com/api/download_user_document.php?doc_id=${docId}` : '#';
                downloadText = '1. Download Document'; // May need adjustment based on workflow
            }
        } else if (doc.status === 'submitted' || doc.status === 'approved') {
            // For submitted/approved, link to the version the user uploaded (or admin approved)
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
                {/* Show Download/Upload form if pending or rejected */}
                {(doc.status === 'pending' || doc.status === 'rejected') && (
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

                        {/* Upload Section */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                                type="file"
                                id={`file-${docId}`}
                                // Assign the ref using the docId
                                ref={el => fileInputRefs.current[docId] = el}
                                onChange={(e) => handleFileChange(docId, e)}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" // Match allowed types
                                className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-600 file:text-white hover:file:bg-neutral-500 cursor-pointer"
                            />
                            <button
                                onClick={() => handleFileUpload(docId)}
                                disabled={!currentFile || message.type === 'info'} // Disable during upload
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                {message.type === 'info' && filesToUpload[docId] ? 'Uploading...' : '2. Submit File'}
                            </button>
                        </div>
                    </div>
                )}
                {/* Show status messages for submitted/approved */}
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

            <StepIndicator currentStep={statusInfo.step} />

            {/* Overall messages */}
            {message.text && (
                <p className={`text-sm mb-4 p-3 rounded max-w-4xl mx-auto `}>
                    {message.text}
                </p>
            )}

            {/* Conditional Content */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 max-w-4xl mx-auto">

                {/* --- Step 1: Contracts --- */}
                {statusInfo.step === 1 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Contract Agreements</h2>
                        {statusInfo.contracts.length === 0 ? (
                            <p className="text-neutral-400">Please wait for the administrator to upload your contract(s).</p>
                        ) : (
                            <div className="space-y-6">
                                {/* Map over the contracts array */}
                                {statusInfo.contracts.map(contract => (
                                    <DocumentRow key={contract.user_document_id} doc={contract} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* --- Step 2: Gathering Documents --- */}
                {statusInfo.step === 2 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Required Documents</h2>
                        {statusInfo.requirements.length === 0 ? (
                            <p className="text-neutral-400">No additional documents are currently required for this step.</p>
                        ) : (
                            <div className="space-y-6">
                                {/* Map over the requirements array */}
                                {statusInfo.requirements.map(req => (
                                    <DocumentRow key={req.user_document_id} doc={req} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* --- Step 3+ --- */}
                {statusInfo.step >= 3 && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">{STEP_DEFINITIONS[statusInfo.step] || 'Onboarding'}</h2>
                        {/* Optionally list all docs with final status */}
                        <div className="space-y-4">
                            {[...statusInfo.contracts, ...statusInfo.requirements]
                                .sort((a, b) => a.document_name.localeCompare(b.document_name)) // Sort alphabetically
                                .map(doc => (
                                    <div key={doc.user_document_id} className="flex justify-between items-center p-3 bg-neutral-900/50 border border-neutral-700 rounded">
                                        <span className="text-white">{doc.document_name}</span>
                                        <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                                            {getStatusIcon(doc.status)} {doc.status}
                                        </span>
                                    </div>
                                ))}
                        </div>
                        {statusInfo.step === 3 && <p className="text-neutral-400 mt-4">Your documents are under review.</p>}
                        {statusInfo.step === 5 && <p className="text-green-400 mt-4">Onboarding complete!</p>}
                    </>
                )}

            </section>

            {/* Toast component for displaying messages */}
            {message.text && (
                <Toast
                    message={message.text}
                    type={message.type}
                    onDismiss={() => setMessage({ type: '', text: '' })}
                />
            )}
        </div>
    );
};

export default UserStatusPage;