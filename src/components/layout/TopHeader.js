// src/components/layout/TopHeader.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Verify path
import HamburgerIcon from './HamburgerIcon';
import LoginModal from '../auth/LoginModal'; // Verify path
import Toast from '../common/Toast'; // Verify path

const TopHeader = ({ isNavOpen, setIsNavOpen }) => {
    // Get user state, loading status, and logout function from context
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });

    // This function is passed to LoginModal and called on successful API login
    const handleLoginSuccess = (userData) => { // Receives user data
        setShowLogin(false); // Close modal immediately
        setToast({ show: true, message: 'Login successful!' });
        setTimeout(() => {
            window.location.reload();
        }, 100);

        setTimeout(() => {

            // --- MODIFIED: Navigate based on role ---
            if (userData.role === 'admin') {
                navigate('/admin');
            } else if (userData.role === 'user') {
                // Check if they have a resume or status to go to, otherwise default
                navigate('/my-status'); // Default to status page for user
            } else {
                navigate('/'); // Fallback to home
            }
            // window.location.href = '/'; // Avoid full page reload
        }, 100); // 100ms delay
    };

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        setToast({ show: true, message: 'Logged out successfully.' });
        navigate('/'); // Redirect to home page after logout
    };

    // --- MODIFIED: This function now includes role-based links ---
    const renderAuthSection = () => {
        // While checking initial auth status, show nothing or a placeholder
        if (loading) {
            return <div className="w-20 h-8 bg-neutral-800 rounded animate-pulse"></div>; // Placeholder
        }

        // If loading is done and user exists, show user info and Logout button
        if (user) {
            return (
                <>
                    {/* Display user email or name */}
                    <span className="text-sm text-neutral-400 hidden md:inline" title={user.role}>
                        {user.email}
                    </span>

                    {/* --- NEW: Conditional Link for Admin --- */}
                    {user.role.toLowerCase() === 'admin' && ( // <-- CHANGED
                        <Link
                            to="/admin"
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                            title="Admin Dashboard"
                        >
                            Admin
                        </Link>
                    )}

                    {/* --- NEW: Conditional Link for User --- */}
                    {user.role.toLowerCase() === 'user' && ( // <-- CHANGED
                        <Link
                            to="/my-status"
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                            title="My Status"
                        >
                            My Status
                        </Link>
                    )}

                    {/* --- MODIFIED: Renamed "Settings" to "Change Password" --- */}
                    <Link
                        to="/settings/change-password" // Path from App.js is correct
                        className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                        title="Change Password"
                    >
                        Change Password
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                    >
                        Log out
                    </button>
                </>
            );
        }

        // If loading is done and no user, show Login button
        return (
            <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
            >
                Log in
            </button>
        );
    };
    return (
        <>
            <header className="flex-shrink-0 h-16 flex items-center justify-between md:justify-end px-6 border-b border-neutral-800">
                {/* Hamburger for mobile */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        className="p-1 rounded-md hover:bg-neutral-800"
                    >
                        <HamburgerIcon />
                    </button>
                </div>

                {/* Authentication Section */}
                <div className="flex items-center space-x-4">
                    {renderAuthSection()}
                </div>
            </header>

            {/* Login Modal Component */}
            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onLoginSuccess={handleLoginSuccess} // Pass the success handler
            />

            {/* Toast Notification Component */}
            <Toast
                show={toast.show}
                message={toast.message}
                onClose={() => setToast({ show: false, message: '' })}
            />
        </>
    );
};

export default TopHeader;