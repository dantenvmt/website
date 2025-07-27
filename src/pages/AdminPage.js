import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    // State for jobs
    const [jobs, setJobs] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newDepartment, setNewDepartment] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newDescription, setNewDescription] = useState('');

    // State for editing jobs
    const [isEditing, setIsEditing] = useState(false);
    const [currentJob, setCurrentJob] = useState(null);

    // ✅ State for users
    const [users, setUsers] = useState([]);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('user');

    const navigate = useNavigate();

    // --- Data Fetching ---
    const API_URL = 'https://renaisons-api.onrender.com';

    const fetchJobs = async () => {
        try {
            const response = await fetch(`${API_URL}/api/jobs`);
            const data = await response.json();
            setJobs(data);
        } catch (error) { console.error('Failed to fetch jobs:', error); }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                headers: { 'x-auth-token': token },
            });
            const data = await response.json();
            if (response.ok) setUsers(data);
            else console.error('Failed to fetch users:', data.msg);
        } catch (error) { console.error('Failed to fetch users:', error); }
    };

    useEffect(() => {
        fetchJobs();
        fetchUsers();
    }, []);

    const handleAddJob = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const newJob = { title: newTitle, department: newDepartment, location: newLocation, description: newDescription };
        try {
            const response = await fetch(`${API_URL}/api/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(newJob),
            });
            if (response.ok) {
                setNewTitle(''); setNewDepartment(''); setNewLocation(''); setNewDescription('');
                fetchJobs();
            } else { alert('Failed to add job.'); }
        } catch (error) { console.error('Error submitting form:', error); }
    };

    const handleDeleteJob = async (jobId) => {
        const token = localStorage.getItem('token');
        if (window.confirm('Are you sure?')) {
            try {
                const response = await fetch(`${API_URL}/api/jobs/${jobId}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token },
                });
                if (response.ok) fetchJobs();
                else alert('Failed to delete job.');
            } catch (error) { console.error('Error deleting job:', error); }
        }
    };

    const handleUpdateJob = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_URL}/api/jobs/${currentJob._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(currentJob),
            });
            if (response.ok) {
                setIsEditing(false); setCurrentJob(null); fetchJobs();
            } else { alert('Failed to update job.'); }
        } catch (error) { console.error('Error updating job:', error); }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const newUser = { email: newUserEmail, password: newUserPassword, role: newUserRole };
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(newUser),
            });
            const data = await response.json();
            if (response.ok) {
                alert('User created successfully!');
                setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('user');
                fetchUsers();
            } else { alert(`Failed to add user: ${data.msg}`); }
        } catch (error) { console.error('Error creating user:', error); }
    };

    const handleEditClick = (job) => { setCurrentJob(job); setIsEditing(true); };
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };


    return (
        <div className="bg-neutral-900 text-white min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Admin Panel</h1>
                    <button onClick={handleLogout} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md">Log Out</button>
                </div>

                {/* --- User Management Section --- */}
                <div className="bg-neutral-800 p-6 rounded-lg mb-12">
                    <h2 className="text-2xl font-semibold mb-4">User Management ({users.length})</h2>

                    {/* Add User Form */}
                    <form onSubmit={handleAddUser} className="mb-6 p-4 bg-neutral-900 rounded-md">
                        <h3 className="text-lg font-semibold mb-3">Create New User</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="email" placeholder="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required className="bg-neutral-700 p-2 rounded-md focus:outline-none" />
                            <input type="password" placeholder="Password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required className="bg-neutral-700 p-2 rounded-md focus:outline-none" />
                            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="bg-neutral-700 p-2 rounded-md focus:outline-none">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md">Add User</button>
                    </form>

                    {/* Existing User List */}
                    <div className="space-y-3">
                        {users.map(user => (
                            <div key={user._id} className="bg-neutral-700 p-3 rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{user.email}</p>
                                    <p className="text-sm text-neutral-400">Role: <span className={`font-bold ${user.role === 'admin' ? 'text-yellow-400' : 'text-blue-400'}`}>{user.role}</span></p>
                                </div>
                                <p className="text-sm text-neutral-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* --- Job Management Section --- */}
                <div className="bg-neutral-800 p-6 rounded-lg mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Add New Job</h2>
                    <form onSubmit={handleAddJob} className="space-y-4">
                        <input type="text" placeholder="Job Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className="w-full bg-neutral-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="Department" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} required className="w-full bg-neutral-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="Location" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} required className="w-full bg-neutral-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <textarea placeholder="Job Description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} required rows="6" className="w-full bg-neutral-700 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">Add Job</button>
                    </form>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Existing Jobs ({jobs.length})</h2>
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <div key={job._id} className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold">{job.title}</h3>
                                    <p className="text-neutral-400">{job.department} - {job.location}</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => handleEditClick(job)} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-1 px-3 rounded-md">Edit</button>
                                    <button onClick={() => handleDeleteJob(job._id)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {isEditing && currentJob && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-neutral-800 p-8 rounded-lg w-full max-w-lg">
                            <h2 className="text-2xl font-semibold mb-4">Edit Job</h2>
                            <form onSubmit={handleUpdateJob} className="space-y-4">
                                <input type="text" placeholder="Job Title" value={currentJob.title} onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })} required className="w-full bg-neutral-700 p-2 rounded-md" />
                                <input type="text" placeholder="Department" value={currentJob.department} onChange={(e) => setCurrentJob({ ...currentJob, department: e.target.value })} required className="w-full bg-neutral-700 p-2 rounded-md" />
                                <input type="text" placeholder="Location" value={currentJob.location} onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })} required className="w-full bg-neutral-700 p-2 rounded-md" />
                                <textarea placeholder="Job Description" value={currentJob.description} onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })} required rows="10" className="w-full bg-neutral-700 p-2 rounded-md"></textarea>
                                <div className="flex justify-end space-x-4">
                                    <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md">Cancel</button>
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPage;