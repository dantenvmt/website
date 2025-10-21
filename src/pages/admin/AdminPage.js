// src/pages/admin/AdminPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ConfirmModal from '../../components/common/ConfirmModal';

// --- Define Updated Onboarding Steps ---
const STEP_DEFINITIONS = {
    0: 'Step 0: New User',
    1: 'Step 1: Contract Upload',
    2: 'Step 2: Gathering Documents',
    3: 'Step 3: Documents Under Review',
    4: 'Step 4: Change name later',
    5: 'Step 5: Change name later',
};
const MAX_STEP = Math.max(...Object.keys(STEP_DEFINITIONS).map(Number));

// --- Reusable Input Components (Unchanged) ---
const AdminFormInput = ({ label, name, type = 'text', value, onChange, required = false, placeholder = '' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-1">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-white"
        />
    </div>
);
const AdminFileInput = React.forwardRef(({ label, name, onChange, required = false, fileName, accept = ".pdf,.doc,.docx" }, ref) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-neutral-300 mb-2">
            {label}{required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <svg className="mx-auto h-10 w-10 text-neutral-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                <label htmlFor={name} className="relative cursor-pointer bg-neutral-700 hover:bg-neutral-600 rounded-md font-medium text-white px-3 py-1 text-xs">
                    <span>Choose file</span>
                    <input id={name} name={name} type="file" className="sr-only" onChange={onChange} accept={accept} required={required} ref={ref} />
                </label>
                {fileName ? (
                    <p className="text-xs text-green-400 pt-1">{fileName}</p>
                ) : (
                    <p className="text-xs text-neutral-500 pt-1">PDF, DOC, DOCX up to 10MB</p>
                )}
            </div>
        </div>
    </div>
));
// --- End of Reusable Components ---

// --- Main Admin Page Component ---
const AdminPage = () => {
    // --- State (Unchanged) ---
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user', firstName: '', lastName: '' });
    const [createUserMessage, setCreateUserMessage] = useState({ type: '', text: '' });
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserCurrentStep, setSelectedUserCurrentStep] = useState(null);
    const [assignedRequirements, setAssignedRequirements] = useState([]);
    const [newRequirement, setNewRequirement] = useState({ document_name: '', document_notes: '' });
    const [assignmentMessage, setAssignmentMessage] = useState({ type: '', text: '' });
    const [stepMessage, setStepMessage] = useState({ type: '', text: '' });
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
    const [isUpdatingStep, setIsUpdatingStep] = useState(false);
    const [rejectionNotes, setRejectionNotes] = useState({});
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(null);
    const [contractFile, setContractFile] = useState(null);
    const [contractFileName, setContractFileName] = useState('');
    const [isUploadingContract, setIsUploadingContract] = useState(false);
    const [contractMessage, setContractMessage] = useState({ type: '', text: '' });
    const contractInputRef = useRef(null);
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        confirmText: 'Confirm'
    });
    // --- End of State ---

    // --- Fetching Functions (Unchanged) ---
    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        try {
            const response = await fetch('https://renaisons.com/api/get_users.php', {
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setUsersList(result.users);
            } else {
                setAssignmentMessage({ type: 'error', text: `Failed to load users: ${result.message}` });
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setAssignmentMessage({ type: 'error', text: 'Failed to load users.' });
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const fetchUserRequirements = useCallback(async () => {
        if (!selectedUserId) {
            setAssignedRequirements([]);
            return;
        }
        setIsLoadingRequirements(true);
        setAssignmentMessage({ type: '', text: '' });
        try {
            const response = await fetch(`https://renaisons.com/api/get_user_requirements.php?user_id=${selectedUserId}`, {
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setAssignedRequirements(result.requirements);
            } else {
                setAssignmentMessage({ type: 'error', text: `Failed to load requirements: ${result.message}` });
                setAssignedRequirements([]);
            }
        } catch (error) {
            console.error("Error fetching user requirements:", error);
            setAssignmentMessage({ type: 'error', text: 'An error occurred while fetching requirements.' });
        } finally {
            setIsLoadingRequirements(false);
        }
    }, [selectedUserId]);

    useEffect(() => {
        fetchUserRequirements();
    }, [fetchUserRequirements]);
    // --- End of Fetching Functions ---

    // --- Handlers for Create User (Unchanged) ---
    const handleNewUserChange = (e) => {/* ... */
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };
    const handleCreateUserSubmit = async (e) => {/* ... */
        e.preventDefault();
        setIsCreatingUser(true);
        setCreateUserMessage({ type: '', text: '' });
        try {
            const response = await fetch('https://renaisons.com/api/create_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setCreateUserMessage({ type: 'success', text: `User ${newUser.email} created successfully!` });
                setNewUser({ email: '', password: '', role: 'user', firstName: '', lastName: '' });
                fetchUsers();
            } else {
                setCreateUserMessage({ type: 'error', text: result.message || 'Failed to create user.' });
            }
        } catch (error) {
            console.error("Create User Error:", error);
            setCreateUserMessage({ type: 'error', text: 'An error occurred while creating the user.' });
        } finally {
            setIsCreatingUser(false);
        }
    };
    // --- End of Create User Handlers ---

    // --- Modal Controls (Unchanged) ---
    const handleModalClose = () => {
        setModalState({ isOpen: false });
    };

    // --- Handlers for Managing Requirements ---
    const handleNewRequirementChange = (e) => {/* ... */
        const { name, value } = e.target;
        setNewRequirement(prev => ({ ...prev, [name]: value }));
    };

    const handleAddRequirement = async (e) => {/* ... */
        e.preventDefault();
        if (!newRequirement.document_name.trim()) {
            setAssignmentMessage({ type: 'error', text: 'Document name cannot be empty.' });
            return;
        }
        try {
            const response = await fetch('https://renaisons.com/api/add_requirement_to_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: selectedUserId, ...newRequirement }),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setAssignmentMessage({ type: 'success', text: 'Requirement added.' });
                setNewRequirement({ document_name: '', document_notes: '' });
                fetchUserRequirements();
            } else {
                setAssignmentMessage({ type: 'error', text: `Failed to add: ${result.message}` });
            }
        } catch (error) {
            console.error("Error adding requirement:", error);
            setAssignmentMessage({ type: 'error', text: 'An error occurred while adding the requirement.' });
        }
    };

    // Modal Opener (Unchanged)
    const handleRemoveRequirement = (userDocumentId) => {
        setModalState({
            isOpen: true,
            title: 'Confirm Removal',
            message: 'Are you sure you want to remove this requirement for this user? This action cannot be undone.',
            confirmText: 'Remove',
            onConfirm: () => performRemoveRequirement(userDocumentId)
        });
    };

    // Delete Logic (Unchanged)
    const performRemoveRequirement = async (userDocumentId) => {
        handleModalClose();
        try {
            const response = await fetch('https://renaisons.com/api/remove_requirement.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_document_id: userDocumentId }),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setAssignmentMessage({ type: 'success', text: 'Requirement removed.' });
                fetchUserRequirements();
            } else {
                setAssignmentMessage({ type: 'error', text: `Failed to remove: ${result.message}` });
            }
        } catch (error) {
            console.error("Error removing requirement:", error);
            setAssignmentMessage({ type: 'error', text: 'An error occurred while removing the requirement.' });
        }
    };


    // --- *** CHANGE 1: Modify handleUpdateStatus *** ---
    // This function is for Approve/Reject buttons
    const handleUpdateStatus = async (userDocumentId, newStatus) => {

        // --- MODIFIED LOGIC ---
        let notes = null;
        if (newStatus === 'rejected') {
            notes = rejectionNotes[userDocumentId] || '';
        } else if (newStatus === 'approved') {
            // Check if the document being updated is the contract
            const contract = assignedRequirements.find(r => r.document_name === 'Contract Agreement');
            if (contract && contract.user_document_id === userDocumentId) {
                notes = 'Contract approved'; // User's requested note
            } else {
                notes = 'Document approved'; // Generic note for other docs
            }
        }
        // --- END OF MODIFICATION ---

        if (newStatus === 'rejected' && !notes.trim()) {
            const setMessage = (selectedUserCurrentStep === 1) ? setContractMessage : setAssignmentMessage;
            setMessage({ type: 'error', text: 'Please enter rejection notes.' });
            return;
        }

        setIsUpdatingStatus(userDocumentId);
        setAssignmentMessage({ type: '', text: '' });
        setContractMessage({ type: '', text: '' });

        try {
            const response = await fetch('https://renaisons.com/api/update_requirement_status.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_document_id: userDocumentId,
                    new_status: newStatus,
                    admin_notes: notes // This now sends the "Contract approved" note
                }),
                credentials: 'include'
            });
            const result = await response.json();
            const setMessage = (selectedUserCurrentStep === 1) ? setContractMessage : setAssignmentMessage;

            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: `Document status updated to ${newStatus}.` });
                setRejectionNotes(prev => {
                    const newState = { ...prev };
                    delete newState[userDocumentId];
                    return newState;
                });
                fetchUserRequirements();
            } else {
                setMessage({ type: 'error', text: `Failed to update status: ${result.message}` });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            const setMessage = (selectedUserCurrentStep === 1) ? setContractMessage : setAssignmentMessage;
            setMessage({ type: 'error', text: 'An error occurred while updating status.' });
        } finally {
            setIsUpdatingStatus(null);
        }
    };
    // --- *** END OF CHANGE 1 *** ---

    const handleRejectionNoteChange = (userDocumentId, value) => {
        setRejectionNotes(prev => ({ ...prev, [userDocumentId]: value }));
    };


    // --- Handler for User Selection (Unchanged) ---
    const handleUserSelectionChange = (e) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        setStepMessage({ type: '', text: '' });
        setContractMessage({ type: '', text: '' });
        setContractFile(null);
        setContractFileName('');
        setAssignmentMessage({ type: '', text: '' });
        setRejectionNotes({});

        if (userId) {
            const user = usersList.find(u => u.user_id === userId);
            if (user) {
                setSelectedUserCurrentStep(user.onboarding_step);
            }
        } else {
            setSelectedUserCurrentStep(null);
        }
    };

    // --- Handler for Step Update (Unchanged, already has contract check) ---
    const handleMoveToNextStep = async () => {
        if (!selectedUserId || isUpdatingStep || selectedUserCurrentStep >= MAX_STEP) return;

        if (selectedUserCurrentStep === 1) {
            const contract = assignedRequirements.find(r => r.document_name === 'Contract Agreement');
            if (!contract || contract.status !== 'approved') {
                setStepMessage({ type: 'error', text: 'You must approve the user\'s submitted contract before moving to Step 2.' });
                return;
            }
        }

        const nextStep = selectedUserCurrentStep + 1;
        setIsUpdatingStep(true);
        setStepMessage({ type: '', text: '' });
        try {
            const response = await fetch('https://renaisons.com/api/update_user_step.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: selectedUserId, new_step: nextStep }),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setStepMessage({ type: 'success', text: 'User moved to next step!' });
                setSelectedUserCurrentStep(nextStep);
                setUsersList(prevList => prevList.map(u =>
                    u.user_id === selectedUserId ? { ...u, onboarding_step: nextStep } : u
                ));
            } else {
                setStepMessage({ type: 'error', text: `Failed to update step: ${result.message}` });
            }
        } catch (error) {
            console.error("Error updating step:", error);
            setStepMessage({ type: 'error', text: 'An error occurred while updating the step.' });
        } finally {
            setIsUpdatingStep(false);
        }
    };

    // --- Handlers for Contract Upload (Unchanged) ---
    const handleContractFileChange = (e) => {/* ... */
        const file = e.target.files[0];
        setContractMessage({ type: '', text: '' });
        if (file) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            const allowedExtensions = ['.pdf', '.doc', '.docx'];
            const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
                setContractMessage({ type: 'error', text: 'Invalid file type. Please upload PDF, DOC, or DOCX.' });
                setContractFile(null);
                setContractFileName('');
                if (contractInputRef.current) contractInputRef.current.value = '';
                return;
            }
            setContractFile(file);
            setContractFileName(file.name);
        } else {
            setContractFile(null);
            setContractFileName('');
        }
    };
    const handleContractUpload = async () => {/* ... */
        if (!selectedUserId || !contractFile) {
            setContractMessage({ type: 'error', text: 'Please select a user and a file.' });
            return;
        }
        if (isUploadingContract) return;

        setIsUploadingContract(true);
        setContractMessage({ type: 'info', text: 'Uploading contract...' });

        const formData = new FormData();
        formData.append('userId', selectedUserId);
        formData.append('contractFile', contractFile);

        try {
            const response = await fetch('https://renaisons.com/api/upload_admin_contract.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setContractMessage({ type: 'success', text: 'Contract uploaded successfully!' });
                setContractFile(null);
                setContractFileName('');
                if (contractInputRef.current) contractInputRef.current.value = '';
                fetchUserRequirements();
            } else {
                setContractMessage({ type: 'error', text: `Upload failed: ${result.message || 'Server error'}` });
            }
        } catch (error) {
            console.error("Error uploading contract:", error);
            setContractMessage({ type: 'error', text: 'An error occurred during upload.' });
        } finally {
            setIsUploadingContract(false);
        }
    };

    // --- Helper variables (Unchanged) ---
    const currentStepName = STEP_DEFINITIONS[selectedUserCurrentStep] || 'Unknown Step';
    const nextStepName = STEP_DEFINITIONS[selectedUserCurrentStep + 1];
    const atMaxStep = selectedUserCurrentStep >= MAX_STEP;
    const getSelectedUserDisplay = () => {
        if (!selectedUserId) return '';
        const user = usersList.find(u => u.user_id === selectedUserId);
        if (!user) return '';
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name} (${user.email})`;
        }
        return user.email;
    };
    const selectedUserDisplay = getSelectedUserDisplay();

    const existingContract = assignedRequirements.find(
        req => req.document_name === 'Contract Agreement'
    );
    // --- End of Helper Variables ---

    // --- Render Logic ---
    return (
        <div className="p-8 md:p-12 text-white space-y-12">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>

            {/* --- Section: Create User (Unchanged) --- */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
                <form onSubmit={handleCreateUserSubmit} className="space-y-4 max-w-lg">
                    {/* ... form inputs ... */}
                    <AdminFormInput
                        label="First Name"
                        name="firstName"
                        value={newUser.firstName}
                        onChange={handleNewUserChange}
                        placeholder="John"
                    />
                    <AdminFormInput
                        label="Last Name"
                        name="lastName"
                        value={newUser.lastName}
                        onChange={handleNewUserChange}
                        placeholder="Doe"
                    />
                    <AdminFormInput label="Email" name="email" type="email" value={newUser.email} onChange={handleNewUserChange} required placeholder="newuser@example.com" />
                    <AdminFormInput label="Password" name="password" type="password" value={newUser.password} onChange={handleNewUserChange} required placeholder="Enter temporary password" />
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-neutral-300 mb-1">Role</label>
                        <select id="role" name="role" value={newUser.role} onChange={handleNewUserChange} className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-white">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    {createUserMessage.text && <p className={`text-sm ${createUserMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{createUserMessage.text}</p>}
                    <button type="submit" disabled={isCreatingUser} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 transition-colors">
                        {isCreatingUser ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </section>

            {/* --- Section: Manage User (Unchanged) --- */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <h2 className="text-2xl font-semibold mb-4">Manage User Status & Requirements</h2>

                {/* User Selection Dropdown (Unchanged) */}
                <div className="mb-6">
                    <label htmlFor="userSelect" className="block text-sm font-medium text-neutral-300 mb-1">Select User to Manage</label>
                    <select
                        id="userSelect"
                        value={selectedUserId}
                        onChange={handleUserSelectionChange}
                        disabled={isLoadingUsers}
                        className="w-full md:w-1/2 bg-neutral-700 border border-neutral-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    >
                        <option value="">-- Select a User --</option>
                        {usersList.map(u => (
                            <option key={u.user_id} value={u.user_id}>
                                {u.last_name || u.first_name ? `${u.last_name}, ${u.first_name} (${u.email})` : u.email} (Step {u.onboarding_step})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Section appears once a user is selected */}
                {selectedUserId && (
                    <div className="space-y-8">
                        {/* User Status / Step Management (Unchanged) */}
                        <div className="border border-neutral-700 rounded-lg p-4">
                            <h3 className="text-lg font-medium mb-3 text-neutral-300">
                                User Status: <span className="font-semibold text-white">{selectedUserDisplay}</span>
                            </h3>
                            <p className="text-md mb-3 text-neutral-200">
                                Current Step: <span className="font-semibold">{currentStepName}</span>
                            </p>
                            {stepMessage.text && (
                                <p className={`text-sm mb-3 ${stepMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                    {stepMessage.text}
                                </p>
                            )}
                            <button
                                onClick={handleMoveToNextStep}
                                disabled={isUpdatingStep || atMaxStep}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isUpdatingStep ? 'Moving...' :
                                    atMaxStep ? 'At Final Step' :
                                        `Move to: ${nextStepName || 'Next Step'}`}
                            </button>
                        </div>

                        {/* --- Contract Upload Section (Visible only in Step 1) --- */}
                        {selectedUserCurrentStep === 1 && (
                            <div className="border border-neutral-700 rounded-lg p-4 space-y-4">
                                <h3 className="text-lg font-medium text-neutral-300">
                                    Step 1: Contract for {selectedUserDisplay}
                                </h3>

                                {/* Display Existing Contract Info */}
                                {isLoadingRequirements ? (
                                    <p className="text-sm text-neutral-400">Loading contract info...</p>
                                ) : existingContract ? (
                                    <div className="bg-neutral-900/50 p-3 border border-neutral-600 rounded space-y-3">
                                        {/* Status and View Link Row */}
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-neutral-300">
                                                Current Contract Status:
                                                <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${existingContract.status === 'approved' ? 'bg-green-800 text-green-100' :
                                                    existingContract.status === 'submitted' ? 'bg-yellow-800 text-yellow-100' :
                                                        existingContract.status === 'rejected' ? 'bg-red-800 text-red-100' :
                                                            'bg-gray-700 text-gray-100' // pending
                                                    }`}>
                                                    {existingContract.status}
                                                </span>
                                            </p>
                                            {(existingContract.status === 'submitted' || existingContract.status === 'approved' || existingContract.status === 'rejected') ? (
                                                <a
                                                    href={`https://renaisons.com/api/download_user_document.php?doc_id=${existingContract.user_document_id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 hover:underline text-sm"
                                                >
                                                    View File
                                                </a>
                                            ) : (
                                                <span className="text-neutral-500 text-sm">No user file</span>
                                            )}
                                        </div>

                                        {/* --- *** CHANGE 2: Modify Admin Notes Display *** --- */}
                                        {/* Show Admin Notes if they exist (for approved or rejected) */}
                                        {existingContract.admin_notes && (existingContract.status === 'rejected' || existingContract.status === 'approved') && (
                                            <p className={`text-xs ${existingContract.status === 'rejected' ? 'text-red-300' : 'text-green-300'}`}>
                                                <b>Admin Notes:</b> {existingContract.admin_notes}
                                            </p>
                                        )}
                                        {/* --- *** END OF CHANGE 2 *** --- */}


                                        {/* ADMIN ACTION BLOCK (Approve/Reject) */}
                                        {existingContract.status === 'submitted' && (
                                            <div className="border-t border-neutral-700 pt-3 space-y-2">
                                                <h4 className="text-sm font-medium text-neutral-300">Admin Actions: Review Submitted Contract</h4>
                                                <div className="flex flex-col sm:flex-row gap-2 items-start">
                                                    <button
                                                        onClick={() => handleUpdateStatus(existingContract.user_document_id, 'approved')}
                                                        disabled={isUpdatingStatus === existingContract.user_document_id}
                                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-sm rounded disabled:opacity-50"
                                                    >
                                                        {isUpdatingStatus === existingContract.user_document_id ? '...' : 'Approve'}
                                                    </button>
                                                    <div className="flex flex-col items-start w-full">
                                                        <button
                                                            onClick={() => handleUpdateStatus(existingContract.user_document_id, 'rejected')}
                                                            disabled={isUpdatingStatus === existingContract.user_document_id}
                                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm rounded disabled:opacity-50 mb-1"
                                                        >
                                                            {isUpdatingStatus === existingContract.user_document_id ? '...' : 'Reject'}
                                                        </button>
                                                        <textarea
                                                            value={rejectionNotes[existingContract.user_document_id] || ''}
                                                            onChange={(e) => handleRejectionNoteChange(existingContract.user_document_id, e.target.value)}
                                                            placeholder="Rejection notes (required)"
                                                            rows="2"
                                                            className="w-full text-xs bg-neutral-700 border border-neutral-600 rounded p-1 focus:ring-blue-500 focus:border-blue-500 text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-neutral-400">No contract currently uploaded for this user.</p>
                                )}

                                {/* Upload/Replace Contract Form (Unchanged) */}
                                <p className="text-sm text-neutral-400 pt-4 border-t border-neutral-700">
                                    {existingContract ? 'Upload a new version (replaces existing):' : 'Upload the blank contract for the user:'}
                                </p>
                                {contractMessage.text && (
                                    <p className={`text-sm ${contractMessage.type === 'error' ? 'text-red-400' :
                                        contractMessage.type === 'success' ? 'text-green-400' :
                                            'text-blue-400'
                                        }`}>
                                        {contractMessage.text}
                                    </p>
                                )}
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-grow w-full">
                                        <AdminFileInput
                                            label="Contract Document"
                                            name="contractFile"
                                            onChange={handleContractFileChange}
                                            fileName={contractFileName}
                                            required={!existingContract}
                                            ref={contractInputRef}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleContractUpload}
                                        disabled={isUploadingContract || !contractFile}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md whitespace-nowrap w-full md:w-auto disabled:opacity-50"
                                    >
                                        {isUploadingContract ? 'Uploading...' : (existingContract ? 'Replace Contract' : 'Upload Contract')}
                                    </button>
                                </div>
                            </div>
                        )}


                        {/* --- Requirements Section (Step 2) (Unchanged) --- */}
                        {selectedUserCurrentStep === 2 && (
                            <div>
                                <h3 className="text-lg font-medium mb-2 text-neutral-300">
                                    Step 2: Assigned Requirements for {selectedUserDisplay}
                                </h3>
                                {assignmentMessage.text && (
                                    <p className={`text-sm mb-4 p-3 rounded ${assignmentMessage.type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-300' : 'bg-green-900/50 border border-green-700 text-green-300'}`}>
                                        {assignmentMessage.text}
                                    </p>
                                )}
                                <div className="overflow-x-auto mb-6 border border-neutral-600 rounded-lg">
                                    <table className="min-w-full divide-y divide-neutral-600">
                                        {/* ... table head ... */}
                                        <thead className="bg-neutral-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Document Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Notes</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Review/Actions</th>
                                                <th scope="col" className="relative px-6 py-3 w-12"><span className="sr-only">Actions</span></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                                            {isLoadingRequirements && (
                                                <tr><td colSpan="5" className="text-center p-4 text-neutral-400">Loading requirements...</td></tr>
                                            )}
                                            {!isLoadingRequirements && assignedRequirements.length === 0 && (
                                                <tr><td colSpan="5" className="text-center p-4 text-neutral-400">No requirements assigned for this step.</td></tr>
                                            )}
                                            {!isLoadingRequirements && assignedRequirements.map((req) => (
                                                <tr key={req.user_document_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.document_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{req.document_notes}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'approved' ? 'bg-green-800 text-green-100' : req.status === 'submitted' ? 'bg-yellow-800 text-yellow-100' : req.status === 'rejected' ? 'bg-red-800 text-red-100' : 'bg-gray-700 text-gray-100'}`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm space-y-2">
                                                        {(req.status === 'submitted' || req.status === 'approved' || req.status === 'rejected') ? (
                                                            <a
                                                                href={`https://renaisons.com/api/download_user_document.php?doc_id=${req.user_document_id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-400 hover:text-blue-300 hover:underline mr-3"
                                                            >
                                                                View File
                                                            </a>
                                                        ) : (
                                                            <span className="text-neutral-500 mr-3">No File</span>
                                                        )}

                                                        {req.status === 'submitted' && (
                                                            <div className="flex flex-col sm:flex-row gap-2 items-start">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(req.user_document_id, 'approved')}
                                                                    disabled={isUpdatingStatus === req.user_document_id}
                                                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs rounded disabled:opacity-50"
                                                                >
                                                                    {isUpdatingStatus === req.user_document_id ? '...' : 'Approve'}
                                                                </button>
                                                                <div className="flex flex-col items-start w-full">
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(req.user_document_id, 'rejected')}
                                                                        disabled={isUpdatingStatus === req.user_document_id}
                                                                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded disabled:opacity-50 mb-1"
                                                                    >
                                                                        {isUpdatingStatus === req.user_document_id ? '...' : 'Reject'}
                                                                    </button>
                                                                    <textarea
                                                                        value={rejectionNotes[req.user_document_id] || ''}
                                                                        onChange={(e) => handleRejectionNoteChange(req.user_document_id, e.target.value)}
                                                                        placeholder="Rejection notes (required)"
                                                                        rows="2"
                                                                        className="w-full text-xs bg-neutral-700 border border-neutral-600 rounded p-1 focus:ring-blue-500 focus:border-blue-500 text-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {req.status === 'rejected' && req.admin_notes && (
                                                            <p className="text-xs text-red-300 mt-1">Notes: {req.admin_notes}</p>
                                                        )}
                                                        {/* --- MODIFICATION: Show "Document approved" note here too --- */}
                                                        {req.status === 'approved' && req.admin_notes && (
                                                            <p className="text-xs text-green-300 mt-1">Notes: {req.admin_notes}</p>
                                                        )}
                                                        {(req.status === 'pending') && (
                                                            <span className="text-neutral-500 text-xs">No actions needed</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <button
                                                            onClick={() => handleRemoveRequirement(req.user_document_id)}
                                                            className="text-red-400 hover:text-red-600"
                                                            title="Remove Requirement"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* Add New Requirement Form (Unchanged) */}
                                <form onSubmit={handleAddRequirement} className="border-t border-neutral-700 pt-6">
                                    <h4 className="text-md font-medium mb-2 text-neutral-300">
                                        Add New Requirement for {selectedUserDisplay}
                                    </h4>
                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-grow w-full">
                                            <AdminFormInput label="Document Name" name="document_name" value={newRequirement.document_name} onChange={handleNewRequirementChange} placeholder="e.g., Signed NDA" required />
                                        </div>
                                        <div className="flex-grow w-full">
                                            <AdminFormInput label="Notes (Optional)" name="document_notes" value={newRequirement.document_notes} onChange={handleNewRequirementChange} placeholder="e.g., Must be returned by EOD Friday" />
                                        </div>
                                        <button
                                            type="submit"
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md whitespace-nowrap w-full md:w-auto"
                                        >
                                            Add Requirement
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* --- Modal Component (Unchanged) --- */}
            <ConfirmModal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                onConfirm={modalState.onConfirm}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
            />

        </div>
    );
};

export default AdminPage;