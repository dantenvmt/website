import React, { useState, useEffect, useCallback } from 'react';

// --- Define Your Onboarding Steps ---
const STEP_DEFINITIONS = {
    1: 'Step 1: Gathering Documents',
    2: 'Step 2: Change name later',
    3: 'Step 3: Change name later',
    4: 'Step 4: Change name later',
    5: 'Step 5: Change name later',
};
const MAX_STEP = Math.max(...Object.keys(STEP_DEFINITIONS).map(Number));

// Reusable input component
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

// --- Main Admin Page Component ---
const AdminPage = () => {
    // --- State for Create User Form ---
    const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user', firstName: '', lastName: '' });
    const [createUserMessage, setCreateUserMessage] = useState({ type: '', text: '' });
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    // --- State for Managing User Requirements ---
    const [usersList, setUsersList] = useState([]); // Full list of users
    const [selectedUserId, setSelectedUserId] = useState(''); // The user we are managing
    const [selectedUserCurrentStep, setSelectedUserCurrentStep] = useState(null);
    const [assignedRequirements, setAssignedRequirements] = useState([]); // List of requirements for the selected user
    const [newRequirement, setNewRequirement] = useState({ document_name: '', document_notes: '' });
    const [assignmentMessage, setAssignmentMessage] = useState({ type: '', text: '' });
    const [stepMessage, setStepMessage] = useState({ type: '', text: '' });
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
    const [isUpdatingStep, setIsUpdatingStep] = useState(false);

    const [rejectionNotes, setRejectionNotes] = useState({}); // { [user_document_id]: "notes text" }
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(null); // Track which doc status is being updated
    // --- Fetch initial list of users ---
    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        setAssignmentMessage({ type: '', text: '' });
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

    // --- Fetch assigned requirements when a user is selected ---
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
    }, [fetchUserRequirements]); // This re-runs whenever fetchUserRequirements (which depends on selectedUserId) changes

    // --- Handlers for Create User ---
    const handleNewUserChange = (e) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUserSubmit = async (e) => {
        e.preventDefault();
        setIsCreatingUser(true);
        setCreateUserMessage({ type: '', text: '' });
        if (!newUser.email || !newUser.password) {
            setCreateUserMessage({ type: 'error', text: 'Email and Password are required.' });
            setIsCreatingUser(false);
            return;
        }

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
                fetchUsers(); // Refresh the user list
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

    // --- Handlers for Managing Requirements ---
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
                setNewRequirement({ document_name: '', document_notes: '' }); // Clear form
                fetchUserRequirements(); // Refresh the list
            } else {
                setAssignmentMessage({ type: 'error', text: `Failed to add: ${result.message}` });
            }
        } catch (error) {
            console.error("Error adding requirement:", error);
            setAssignmentMessage({ type: 'error', text: 'An error occurred while adding the requirement.' });
        }
    };

    const handleRemoveRequirement = async (userDocumentId) => {
        if (!window.confirm("Are you sure you want to remove this requirement for this user?")) {
            return;
        }

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
                fetchUserRequirements(); // Refresh the list
            } else {
                setAssignmentMessage({ type: 'error', text: `Failed to remove: ${result.message}` });
            }
        } catch (error) {
            console.error("Error removing requirement:", error);
            setAssignmentMessage({ type: 'error', text: 'An error occurred while removing the requirement.' });
        }
    };

    // Handler when admin selects a user from the dropdown
    const handleUserSelectionChange = (e) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        setStepMessage({ type: '', text: '' });

        if (userId) {
            const user = usersList.find(u => u.user_id == userId);
            if (user) {
                setSelectedUserCurrentStep(user.onboarding_step);
            }
        } else {
            setSelectedUserCurrentStep(null);
        }
    };

    // Handler for the "Move to Next Step" button
    const handleMoveToNextStep = async () => {
        if (!selectedUserId || isUpdatingStep || selectedUserCurrentStep >= MAX_STEP) return;

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
                // Update the main usersList state locally
                setUsersList(prevList => prevList.map(u =>
                    u.user_id == selectedUserId ? { ...u, onboarding_step: nextStep } : u
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
    const handleRejectionNoteChange = (userDocumentId, value) => {
        setRejectionNotes(prev => ({ ...prev, [userDocumentId]: value }));
    };

    const handleUpdateStatus = async (userDocumentId, newStatus) => {
        const notes = newStatus === 'rejected' ? rejectionNotes[userDocumentId] || '' : null;

        if (newStatus === 'rejected' && !notes.trim()) {
            setAssignmentMessage({ type: 'error', text: 'Please enter rejection notes.' });
            return;
        }

        setIsUpdatingStatus(userDocumentId);
        setAssignmentMessage({ type: '', text: '' });

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
                setAssignmentMessage({ type: 'success', text: `Document status updated to ${newStatus}.` });
                // Clear rejection note for this item if successful
                setRejectionNotes(prev => {
                    const newState = { ...prev };
                    delete newState[userDocumentId];
                    return newState;
                });
                fetchUserRequirements(); // Refresh the list
            } else {
                setAssignmentMessage({ type: 'error', text: `Failed to update status: ${result.message}` });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            setAssignmentMessage({ type: 'error', text: 'An error occurred while updating status.' });
        } finally {
            setIsUpdatingStatus(null); // Clear loading state
        }
    };
    // --- Helper variables ---
    const currentStepName = STEP_DEFINITIONS[selectedUserCurrentStep] || 'Unknown Step';
    const nextStepName = STEP_DEFINITIONS[selectedUserCurrentStep + 1];
    const atMaxStep = selectedUserCurrentStep >= MAX_STEP;

    const getSelectedUserDisplay = () => {
        if (!selectedUserId) return '';
        const user = usersList.find(u => u.user_id == selectedUserId);
        if (!user) return '';
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name} (${user.email})`;
        }
        return user.email;
    };
    const selectedUserDisplay = getSelectedUserDisplay();

    return (
        <div className="p-8 md:p-12 text-white space-y-12">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>

            {/* --- Section: Create User --- */}
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

            {/* --- Section: Manage User Status & Requirements --- */}
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

                {/* This entire section appears once a user is selected */}
                {selectedUserId && (
                    <div className="space-y-8">

                        {/* User Status / Step Management */}
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

                        {/* Assigned Requirements Table */}
                        <div>
                            <h3 className="text-lg font-medium mb-2 text-neutral-300">
                                Assigned Requirements for {selectedUserDisplay}
                            </h3>
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
                                            <tr><td colSpan="4" className="text-center p-4 text-neutral-400">Loading requirements...</td></tr>
                                        )}
                                        {!isLoadingRequirements && assignedRequirements.length === 0 && (
                                            <tr><td colSpan="4" className="text-center p-4 text-neutral-400">No requirements assigned to this user.</td></tr>
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
                                                    {/* View Link (only if submitted or reviewed) */}
                                                    {(req.status === 'submitted' || req.status === 'approved' || req.status === 'rejected') ? (
                                                        <a
                                                            href={`https://renaisons.com/api/download_user_document.php?doc_id=${req.user_document_id}`}
                                                            target="_blank" // Open in new tab
                                                            rel="noopener noreferrer" // Security best practice
                                                            className="text-blue-400 hover:text-blue-300 hover:underline mr-3"
                                                        >
                                                            View File
                                                        </a>
                                                    ) : (
                                                        <span className="text-neutral-500 mr-3">No File</span>
                                                    )}

                                                    {/* Approve/Reject Buttons (only if submitted) */}
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
                                                                    placeholder="Rejection notes (optional)"
                                                                    rows="2"
                                                                    className="w-full text-xs bg-neutral-700 border border-neutral-600 rounded p-1 focus:ring-blue-500 focus:border-blue-500 text-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}{req.status === 'rejected' && req.admin_notes && (
                                                        <p className="text-xs text-red-300 mt-1">Notes: {req.admin_notes}</p>
                                                    )}
                                                    {/* Placeholder if Pending/Approved */}
                                                    {(req.status === 'pending' || req.status === 'approved') && (
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
                        </div>

                        {/* Add New Requirement Form */}
                        <form onSubmit={handleAddRequirement} className="border-t border-neutral-700 pt-6">
                            <h4 className="text-md font-medium mb-2 text-neutral-300">
                                Add New Requirement for {selectedUserDisplay}
                            </h4>
                            {assignmentMessage.text && (
                                <p className={`text-sm mb-2 ${assignmentMessage.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                    {assignmentMessage.text}
                                </p>
                            )}
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-grow w-full">
                                    <AdminFormInput label="Document Name" name="document_name" value={newRequirement.document_name} onChange={handleNewRequirementChange} placeholder="e.g., Signed NDA" />
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
            </section>
        </div>
    );
};

export default AdminPage;