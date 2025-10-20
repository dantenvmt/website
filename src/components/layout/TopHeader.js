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

        // --- Add a small delay before navigating ---
        // This gives AuthContext a moment to update its state
        setTimeout(() => {
            console.log("Navigating after delay..."); // Debug log
            window.location.href = '/';
            // We hope the updated 'user' state is now available when UserStatusPage mounts
        }, 100); // 100ms delay - adjust if needed, but keep it short

    };

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        setToast({ show: true, message: 'Logged out successfully.' });
        navigate('/'); // Redirect to home page after logout
    };

    // Render function for Login/Logout button area
    const renderAuthSection = () => {
        // While checking initial auth status, show nothing or a placeholder
        if (loading) {
            return <div className="w-20 h-8 bg-neutral-800 rounded animate-pulse"></div>; // Placeholder
        }

        // If loading is done and user exists, show user info and Logout button
        if (user) {
            return (
                <>
                    {/* Optional: Display user email or name */}
                    <span className="text-sm text-neutral-400 hidden md:inline" title={user.role}>
                        {user.email}
                    </span>
                    <Link
                        to="/settings/change-password"
                        className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                        title="Change Password"
                    >
                         Settings
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