// src/pages/admin/AdminPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ConfirmModal from '../../components/common/ConfirmModal.js';
import { useAuth } from '../../context/AuthContext.js';

// --- Define Updated Onboarding Steps (Unchanged) ---
const STEP_DEFINITIONS = {
    0: 'Step 0: New User',
    1: 'Step 1: Contract Upload',
    2: 'Step 2: Gathering Documents',
    3: 'Step 3: Documents Under Review',
    4: 'Step 4: Final Draft Review',
    5: 'Step 5: Documents Submission',
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
    // --- State ---
    const { user: adminUser } = useAuth();
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user', firstName: '', lastName: '' });
    const [createUserMessage, setCreateUserMessage] = useState({ type: '', text: '' });
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [usersList, setUsersList] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedUserCurrentStep, setSelectedUserCurrentStep] = useState(null);
    const [assignedRequirements, setAssignedRequirements] = useState([]);
    const [newRequirement, setNewRequirement] = useState({ document_name: '', document_notes: '' });
    const [assignmentMessage, setAssignmentMessage] = useState({ type: '', text: '' });
    const [stepMessage, setStepMessage] = useState({ type: '', text: '' }); // General message for step/delete actions
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
    const [newContractName, setNewContractName] = useState('');
    const [stepNoteInput, setStepNoteInput] = useState('');
    const [currentStepNote, setCurrentStepNote] = useState('');
    const [isSavingStepNote, setIsSavingStepNote] = useState(false);
    const [deleteUserMessage, setDeleteUserMessage] = useState({ type: '', text: '' }); // Message specifically for delete user section
    const [isDeletingUser, setIsDeletingUser] = useState(false); // Loading state for delete button
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
                console.error(`Failed to load users: ${result.message}`);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);
    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const fetchUserRequirements = useCallback(async () => {
        if (!selectedUserId) {
            setAssignedRequirements([]);
            return;
        }
        setIsLoadingRequirements(true);
        setAssignmentMessage({ type: '', text: '' });
        setContractMessage({ type: '', text: '' });
        try {
            const response = await fetch(`https://renaisons.com/api/get_user_requirements.php?user_id=${selectedUserId}`, {
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setAssignedRequirements(result.requirements);
            } else {
                console.error(`Failed to load requirements: ${result.message}`);
                setAssignedRequirements([]);
            }
        } catch (error) {
            console.error("Error fetching user requirements:", error);
        } finally {
            setIsLoadingRequirements(false);
        }
    }, [selectedUserId]);
    useEffect(() => { fetchUserRequirements(); }, [fetchUserRequirements]);
    // --- End of Fetching Functions ---

    // --- Handlers for Create User (Unchanged) ---
    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };
    const handleCreateUserSubmit = async (e) => {
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

    // --- Handlers for Managing Requirements (Unchanged) ---
    const handleNewRequirementChange = (e) => {
        const { name, value } = e.target;
        setNewRequirement(prev => ({ ...prev, [name]: value }));
    };
    const handleAddRequirement = async (e) => {
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
        const req = assignedRequirements.find(r => r.user_document_id === userDocumentId);
        setModalState({
            isOpen: true,
            title: `Confirm Removal`,
            message: `Are you sure you want to remove "${req?.document_name || 'this requirement'}" for this user? This action cannot be undone.`,
            confirmText: 'Remove',
            onConfirm: () => performRemoveRequirement(userDocumentId)
        });
    };
    // Delete Logic (Unchanged)
    const performRemoveRequirement = async (userDocumentId) => {
        handleModalClose();
        const setMessage = (selectedUserCurrentStep === 1) ? setContractMessage : setAssignmentMessage;
        try {
            const response = await fetch('https://renaisons.com/api/remove_requirement.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_document_id: userDocumentId }),
                credentials: 'include'
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: 'Requirement removed.' });
                fetchUserRequirements();
            } else {
                setMessage({ type: 'error', text: `Failed to remove: ${result.message}` });
            }
        } catch (error) {
            console.error("Error removing requirement:", error);
            setMessage({ type: 'error', text: 'An error occurred while removing the requirement.' });
        }
    };

    // Approve/Reject Logic (Unchanged)
    const handleUpdateStatus = async (userDocumentId, newStatus) => {
        let notes = null;
        if (newStatus === 'rejected') {
            notes = rejectionNotes[userDocumentId] || '';
        } else if (newStatus === 'approved') {
            const req = assignedRequirements.find(r => r.user_document_id === userDocumentId);
            notes = `${req?.document_name || 'Document'} approved`;
        }

        const setMessage = (selectedUserCurrentStep === 1) ? setContractMessage : setAssignmentMessage;

        if (newStatus === 'rejected' && !notes.trim()) {
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
                    admin_notes: notes
                }),
                credentials: 'include'
            });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: `Status updated to ${newStatus}.` });
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
            setMessage({ type: 'error', text: 'An error occurred while updating status.' });
        } finally {
            setIsUpdatingStatus(null);
        }
    };
    const handleRejectionNoteChange = (userDocumentId, value) => {
        setRejectionNotes(prev => ({ ...prev, [userDocumentId]: value }));
    };
    // --- End of Requirement Handlers ---

    // --- Handler for User Selection (Unchanged) ---
    const handleUserSelectionChange = (e) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        // Clear all messages and inputs
        setStepMessage({ type: '', text: '' });
        setDeleteUserMessage({ type: '', text: '' }); // <-- Clear delete message too
        setContractMessage({ type: '', text: '' });
        setAssignmentMessage({ type: '', text: '' });
        setContractFile(null);
        setContractFileName('');
        setRejectionNotes({});
        setNewRequirement({ document_name: '', document_notes: '' });
        setStepNoteInput('');
        setCurrentStepNote('');
        if (userId) {
            const user = usersList.find(u => u.user_id == userId); // Loose equality
            if (user) {
                setSelectedUserCurrentStep(user.onboarding_step);
                setCurrentStepNote(user.step_notes || '');
                setStepNoteInput(user.step_notes || '');
            } else {
                setSelectedUserCurrentStep(null);
            }
        } else {
            setSelectedUserCurrentStep(null);
        }
    };

    // --- Handler for Step Note (Unchanged) ---
    const handleSaveStepNote = async () => {
        if (!selectedUserId) return;

        setIsSavingStepNote(true);
        setStepMessage({ type: 'info', text: 'Saving note...' });

        try {
            const response = await fetch('https://renaisons.com/api/add_step_note.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: selectedUserId,
                    note_content: stepNoteInput
                }),
                credentials: 'include'
            });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setStepMessage({ type: 'success', text: 'Step note saved!' });
                setCurrentStepNote(stepNoteInput);
                setUsersList(prev => prev.map(u =>
                    u.user_id == selectedUserId ? { ...u, step_notes: stepNoteInput } : u
                ));
            } else {
                setStepMessage({ type: 'error', text: `Failed to save note: ${result.message || 'Server error'}` });
            }
        } catch (error) {
            console.error("Error saving step note:", error);
            setStepMessage({ type: 'error', text: 'An error occurred while saving the note.' });
        } finally {
            setIsSavingStepNote(false);
        }
    };

    // --- Handler for Move to Next Step (Unchanged) ---
    const handleMoveToNextStep = async () => {
        if (!selectedUserId || isUpdatingStep || selectedUserCurrentStep >= MAX_STEP) return;

        if (selectedUserCurrentStep === 1) {
            const contracts = assignedRequirements.filter(r => r.document_type === 'contract');
            const allContractsApproved = contracts.length === 0 || contracts.every(c => c.status === 'approved');

            if (!allContractsApproved) {
                setStepMessage({ type: 'error', text: 'All submitted contracts must be approved before moving to Step 2.' });
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
    const handleContractFileChange = (e) => {
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
    const handleContractUpload = async () => {
        if (!selectedUserId || !contractFile || !newContractName.trim()) {
            setContractMessage({ type: 'error', text: 'Please select a user, choose a file, and enter a contract name.' });
            return;
        }
        if (isUploadingContract) return;

        setIsUploadingContract(true);
        setContractMessage({ type: 'info', text: 'Uploading contract...' });

        const formData = new FormData();
        formData.append('userId', selectedUserId);
        formData.append('contractFile', contractFile);
        formData.append('document_name', newContractName.trim());

        try {
            const response = await fetch('https://renaisons.com/api/upload_admin_contract.php', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setContractMessage({ type: 'success', text: `Contract "${newContractName.trim()}" uploaded successfully!` });
                setContractFile(null);
                setContractFileName('');
                setNewContractName('');
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
    // --- End of Contract Upload Handlers ---

    // --- Handlers for Delete User (Unchanged) ---
    const handleDeleteUserClick = () => {
        if (!selectedUserId) return;

        const user = usersList.find(u => u.user_id == selectedUserId);
        const userName = user ? (user.first_name || user.email) : 'this user';

        if (adminUser && user && adminUser.userId === user.user_id) {
            setModalState({
                isOpen: true,
                title: 'Action Not Allowed',
                message: 'You cannot delete your own admin account.',
                confirmText: 'OK',
                onConfirm: handleModalClose
            });
            return;
        }

        setModalState({
            isOpen: true,
            title: `Delete User: ${userName}`,
            message: `Are you sure you want to permanently delete this user? All their associated documents, contracts, and status will be erased. This action cannot be undone.`,
            confirmText: 'Delete User',
            onConfirm: () => performDeleteUser(user.user_id)
        });
    };

    const performDeleteUser = async (userIdToDelete) => {
        handleModalClose();
        setIsDeletingUser(true); // <-- Set loading state
        setDeleteUserMessage({ type: 'info', text: 'Deleting user...' });

        try {
            const response = await fetch('https://renaisons.com/api/delete_user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userIdToDelete }),
                credentials: 'include'
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setDeleteUserMessage({ type: 'success', text: 'User deleted successfully.' });
                setSelectedUserId(''); // <-- Deselect user
                setSelectedUserCurrentStep(null);
                setAssignedRequirements([]);
                fetchUsers(); // Refresh list
            } else {
                setDeleteUserMessage({ type: 'error', text: `Failed to delete user: ${result.message}` });
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            setDeleteUserMessage({ type: 'error', text: 'An error occurred while deleting the user.' });
        } finally {
            setIsDeletingUser(false); // <-- Clear loading state
        }
    };
    // --- END: Handlers for Delete User ---


    // --- Helper variables ---
    const currentStepName = STEP_DEFINITIONS[selectedUserCurrentStep] || 'Unknown Step';
    const nextStepName = STEP_DEFINITIONS[selectedUserCurrentStep + 1];
    const atMaxStep = selectedUserCurrentStep >= MAX_STEP;
    const getSelectedUserDisplay = (full = false) => { // Added 'full' parameter
        if (!selectedUserId) return '';
        const user = usersList.find(u => u.user_id == selectedUserId); // Use == for loose comparison
        if (!user) return '';
        if (user.first_name && user.last_name) {
            return full ? `${user.first_name} ${user.last_name} (${user.email})` : `${user.first_name} ${user.last_name}`;
        }
        return user.email;
    };
    const selectedUserDisplayFull = getSelectedUserDisplay(true); // For main section
    const selectedUserDisplayShort = getSelectedUserDisplay(false); // For delete button
    const step1Contracts = assignedRequirements.filter(
        req => req.document_type === 'contract'
    );
    const step2Requirements = assignedRequirements.filter(
        req => req.document_type === 'other'
    );
    // --- *** END OF CHANGE *** ---


    // --- Render Logic ---
    return (
        <div className="p-8 md:p-12 text-white space-y-12">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>

            {/* --- Section: Create User (Unchanged) --- */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <h2 className="text-2xl font-semibold mb-4">Create New User</h2>
                <form onSubmit={handleCreateUserSubmit} className="space-y-4 max-w-lg">
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

            {/* --- NEW: Section: Delete User --- */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <h2 className="text-2xl font-semibold mb-4 text-red-400">Delete User Account</h2>
                <div className="mb-4">
                    <label htmlFor="deleteUserSelect" className="block text-sm font-medium text-neutral-300 mb-1">Select User to Delete</label>
                    {/* Re-using the same state variable for selection */}
                    <select
                        id="deleteUserSelect"
                        value={selectedUserId}
                        onChange={handleUserSelectionChange}
                        disabled={isLoadingUsers}
                        className="w-full md:w-1/2 bg-neutral-700 border border-neutral-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    >
                        <option value="">-- Select a User --</option>
                        {usersList.map(u => (
                            <option key={u.user_id} value={u.user_id}>
                                {u.last_name || u.first_name ? `${u.last_name}, ${u.first_name} (${u.email})` : u.email}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedUserId && (
                    <div className="border-t border-red-700/30 pt-4 mt-4">
                        <p className="text-sm text-neutral-400 mb-4">
                            Permanently delete <span className='font-semibold text-white'>{selectedUserDisplayFull}</span> and all their associated data. This action cannot be undone.
                        </p>
                        <button
                            onClick={handleDeleteUserClick}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 transition-colors flex-shrink-0"
                            disabled={!selectedUserId || (adminUser && adminUser.userId == selectedUserId) || isDeletingUser}
                            title={adminUser && adminUser.userId == selectedUserId ? "Cannot delete yourself" : "Delete User"}
                        >
                            {isDeletingUser ? 'Deleting...' : `Delete ${selectedUserDisplayShort ? selectedUserDisplayShort : 'User'}'s Account`}
                        </button>
                    </div>
                )}
                {/* Message display for delete section */}
                {deleteUserMessage.text && (
                    <p className={`text-sm mt-4 ${deleteUserMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                        {deleteUserMessage.text}
                    </p>
                )}
            </section>


            {/* --- Section: Manage User Status & Requirements (Delete button moved from here) --- */}
            <section className="bg-neutral-800 p-6 rounded-lg border border-neutral-700">
                <h2 className="text-2xl font-semibold mb-4">Manage User Status & Requirements</h2>

                {/* User Selection Dropdown */}
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
                        {/* User Status / Step Management */}
                        <div className="border border-neutral-700 rounded-lg p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium mb-3 text-neutral-300">
                                        User Status: <span className="font-semibold text-white">{selectedUserDisplayFull}</span>
                                    </h3>
                                    <p className="text-md mb-3 text-neutral-200">
                                        Current Step: <span className="font-semibold">{currentStepName}</span>
                                    </p>
                                </div>
                                {/* Delete button removed from here */}
                            </div>

                            {/* General message display (can show step update success/error here) */}
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
                        {/* Step Note (Unchanged) */}
                        <div className="pt-4 border-t border-neutral-600">
                            <label htmlFor="stepNotes" className="block text-sm font-medium text-neutral-300 mb-1">
                                Admin Notes for this Step (Visible to User):
                            </label>
                            <textarea
                                id="stepNotes"
                                rows="3"
                                className="w-full bg-neutral-700 border border-neutral-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 text-white text-sm mb-2"
                                placeholder="Enter notes for the user regarding this step..."
                                value={stepNoteInput}
                                onChange={(e) => setStepNoteInput(e.target.value)}
                                disabled={isSavingStepNote}
                            />
                            <button
                                onClick={handleSaveStepNote}
                                disabled={isSavingStepNote || stepNoteInput === currentStepNote}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3 rounded-md text-sm disabled:opacity-50 transition-colors"
                            >
                                {isSavingStepNote ? 'Saving...' : 'Save Step Note'}
                            </button>
                        </div>


                        {/* Step 1: Contracts (Unchanged) */}
                        {selectedUserCurrentStep === 1 && (
                            <div className="border border-neutral-700 rounded-lg p-4 space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-neutral-300">
                                        Step 1: Contracts for {selectedUserDisplayFull}
                                    </h3>
                                    {contractMessage.text && (
                                        <p className={`text-sm mt-2 p-2 rounded ${contractMessage.type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-300' :
                                            contractMessage.type === 'success' ? 'bg-green-900/50 border border-green-700 text-green-300' :
                                                'bg-blue-900/50 border border-blue-700 text-blue-300'
                                            }`}>
                                            {contractMessage.text}
                                        </p>
                                    )}
                                </div>
                                <div className="overflow-x-auto border border-neutral-600 rounded-lg">
                                    <table className="min-w-full divide-y divide-neutral-600">
                                        <thead className="bg-neutral-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Contract Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">Review/Actions</th>
                                                <th scope="col" className="relative px-6 py-3 w-12"><span className="sr-only">Actions</span></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-neutral-800 divide-y divide-neutral-700">
                                            {isLoadingRequirements && (
                                                <tr><td colSpan="4" className="text-center p-4 text-neutral-400">Loading contracts...</td></tr>
                                            )}
                                            {!isLoadingRequirements && step1Contracts.length === 0 && (
                                                <tr><td colSpan="4" className="text-center p-4 text-neutral-400">No contracts uploaded for this user yet.</td></tr>
                                            )}
                                            {!isLoadingRequirements && step1Contracts.map((contract) => (
                                                <tr key={contract.user_document_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{contract.document_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${contract.status === 'approved' ? 'bg-green-800 text-green-100' :
                                                            contract.status === 'submitted' ? 'bg-yellow-800 text-yellow-100' :
                                                                contract.status === 'rejected' ? 'bg-red-800 text-red-100' :
                                                                    'bg-gray-700 text-gray-100'
                                                            }`}>
                                                            {contract.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm space-y-2">
                                                        {(contract.status === 'submitted' || contract.status === 'approved' || contract.status === 'rejected') ? (
                                                            <a
                                                                href={`https://renaisons.com/api/download_user_document.php?doc_id=${contract.user_document_id}`}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="text-blue-400 hover:text-blue-300 hover:underline mr-3"
                                                            >
                                                                View File
                                                            </a>
                                                        ) : (
                                                            <span className="text-neutral-500 mr-3">No User File</span>
                                                        )}
                                                        {contract.status === 'submitted' && (
                                                            <div className="flex flex-col sm:flex-row gap-2 items-start">
                                                                <button
                                                                    onClick={() => handleUpdateStatus(contract.user_document_id, 'approved')}
                                                                    disabled={isUpdatingStatus === contract.user_document_id}
                                                                    className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 text-xs rounded disabled:opacity-50"
                                                                >
                                                                    {isUpdatingStatus === contract.user_document_id ? '...' : 'Approve'}
                                                                </button>
                                                                <div className="flex flex-col items-start w-full">
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(contract.user_document_id, 'rejected')}
                                                                        disabled={isUpdatingStatus === contract.user_document_id}
                                                                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs rounded disabled:opacity-50 mb-1"
                                                                    >
                                                                        {isUpdatingStatus === contract.user_document_id ? '...' : 'Reject'}
                                                                    </button>
                                                                    <textarea
                                                                        value={rejectionNotes[contract.user_document_id] || ''}
                                                                        onChange={(e) => handleRejectionNoteChange(contract.user_document_id, e.target.value)}
                                                                        placeholder="Rejection notes (required)" rows="2"
                                                                        className="w-full text-xs bg-neutral-700 border border-neutral-600 rounded p-1 focus:ring-blue-500 focus:border-blue-500 text-white"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {contract.admin_notes && (contract.status === 'rejected' || contract.status === 'approved') && (
                                                            <p className={`text-xs mt-1 ${contract.status === 'rejected' ? 'text-red-300' : 'text-green-300'}`}>
                                                                Notes: {contract.admin_notes}
                                                            </p>
                                                        )}
                                                        {(contract.status === 'pending') && (
                                                            <span className="text-neutral-500 text-xs">No actions needed</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <button
                                                            onClick={() => handleRemoveRequirement(contract.user_document_id)}
                                                            className="text-red-400 hover:text-red-600"
                                                            title="Remove Contract"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="border-t border-neutral-700 pt-6">
                                    <h4 className="text-md font-medium mb-2 text-neutral-300">
                                        Upload New Blank Document for User (Step 1)
                                    </h4>
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                                        <div className="flex-grow w-full">
                                            <AdminFormInput
                                                label="Document Name"
                                                name="newContractName"
                                                value={newContractName}
                                                onChange={(e) => setNewContractName(e.target.value)}
                                                placeholder="e.g., Master Service Agreement"
                                                required
                                            />
                                        </div>
                                        <div className="flex-grow w-full">
                                            <AdminFileInput
                                                label="Document File"
                                                name="contractFile"
                                                onChange={handleContractFileChange}
                                                fileName={contractFileName}
                                                required
                                                ref={contractInputRef}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleContractUpload}
                                            disabled={isUploadingContract || !contractFile || !newContractName.trim()}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md whitespace-nowrap w-full md:w-auto disabled:opacity-50 flex-shrink-0"
                                        >
                                            {isUploadingContract ? 'Uploading...' : 'Upload Document'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* --- Requirements Section (Step 2) --- */}
                        {selectedUserCurrentStep === 2 && (
                            <div>
                                <h3 className="text-lg font-medium mb-2 text-neutral-300">
                                    Step 2: Assigned Requirements for {selectedUserDisplayFull}
                                </h3>
                                {assignmentMessage.text && (
                                    <p className={`text-sm mb-4 p-3 rounded ${assignmentMessage.type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-300' : 'bg-green-900/50 border border-green-700 text-green-300'}`}>
                                        {assignmentMessage.text}
                                    </p>
                                )}
                                <div className="overflow-x-auto mb-6 border border-neutral-600 rounded-lg">
                                    <table className="min-w-full divide-y divide-neutral-600">
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
                                            {!isLoadingRequirements && step2Requirements.length === 0 && (
                                                <tr><td colSpan="5" className="text-center p-4 text-neutral-400">No requirements assigned for this step.</td></tr>
                                            )}
                                            {!isLoadingRequirements && step2Requirements.map((req) => (
                                                <tr key={req.user_document_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{req.document_name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{req.document_notes}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${req.status === 'approved' ? 'bg-green-800 text-green-100' :
                                                            req.status === 'submitted' ? 'bg-yellow-800 text-yellow-100' :
                                                                req.status === 'rejected' ? 'bg-red-800 text-red-100' :
                                                                    'bg-gray-700 text-gray-100'}`}>
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
                                {/* Add New Requirement Form */}
                                <form onSubmit={handleAddRequirement} className="border-t border-neutral-700 pt-6">
                                    <h4 className="text-md font-medium mb-2 text-neutral-300">
                                        Add New Requirement for {selectedUserDisplayFull}
                                    </h4>
                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-grow w-full">
                                            <AdminFormInput label="Document Name" name="document_name" value={newRequirement.document_name} onChange={handleNewRequirementChange} placeholder="e.g., ID Card, Passport" required />
                                        </div>
                                        <div className="flex-grow w-full">
                                            <AdminFormInput label="Notes (Optional)" name="document_notes" value={newRequirement.document_notes} onChange={handleNewRequirementChange} placeholder="e.g., Must be valid for 6 months" />
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

                        {/* --- Placeholder for Steps 3+ --- */}
                        {selectedUserCurrentStep >= 3 && (
                            <div className="border border-neutral-700 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-neutral-300">
                                    {STEP_DEFINITIONS[selectedUserCurrentStep]} for {selectedUserDisplayFull}
                                </h3>
                                <p className="text-neutral-400">Content for this step goes here.</p>
                            </div>
                        )}

                        {/* --- Delete section removed from here --- */}

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

