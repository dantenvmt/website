// src/components/layout/TopHeader.js
import React, { useState, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Verify path
import HamburgerIcon from './HamburgerIcon';
import LoginModal from '../auth/LoginModal'; // Verify path
import Toast from '../common/Toast.jsx'; // Corrected extension
import { Menu, Transition } from '@headlessui/react';
import {
    UserCircleIcon,
    ShieldCheckIcon,
    ClipboardDocumentListIcon,
    KeyIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline'; // Using outline icons

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
        }, 100); // 100ms delay
    };

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        setToast({ show: true, message: 'Logged out successfully.' });
        navigate('/'); // Redirect to home page after logout
    };

    // --- REBUILT RENDER FUNCTION ---
    const renderAuthSection = () => {
        // While checking initial auth status, show nothing or a placeholder
        if (loading) {
            return <div className="w-20 h-8 bg-neutral-800 rounded animate-pulse"></div>; // Placeholder
        }

        // If loading is done and user exists, show the new user dropdown menu
        if (user) {
            return (
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <Menu.Button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                            <UserCircleIcon className="h-6 w-6" />
                            <span className="hidden md:inline">{user.email}</span>
                            <ChevronDownIcon className="h-4 w-4 text-neutral-400" />
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-64 origin-top-right divide-y divide-neutral-700 rounded-md bg-neutral-900 shadow-lg ring-1 ring-black ring-opacity-5 border border-neutral-700 focus:outline-none z-50">
                            <div className="px-1 py-1 ">
                                {/* Profile Info Section */}
                                <div className="flex items-center space-x-3 px-4 py-3 mb-1">
                                    <UserCircleIcon className="h-10 w-10 text-neutral-400" />
                                    <div>
                                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                        <p className="text-xs text-neutral-400 uppercase">{user.role}</p>
                                    </div>
                                </div>

                                {/* --- NEW: Conditional Link for Admin --- */}
                                {user.role.toLowerCase() === 'admin' && (
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                to="/admin"
                                                className={`${active ? 'bg-neutral-800 text-white' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}
                                            >
                                                <ShieldCheckIcon className="mr-3 h-5 w-5" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                    </Menu.Item>
                                )}

                                {/* --- NEW: Conditional Link for User --- */}
                                {user.role.toLowerCase() === 'user' && (
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                to="/my-status"
                                                className={`${active ? 'bg-neutral-800 text-white' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}
                                            >
                                                <ClipboardDocumentListIcon className="mr-3 h-5 w-5" />
                                                My Status
                                            </Link>
                                        )}
                                    </Menu.Item>
                                )}
                            </div>
                            <div className="px-1 py-1">
                                {/* --- MODIFIED: Renamed "Settings" to "Change Password" --- */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/settings/change-password" // Path from App.js
                                            className={`${active ? 'bg-neutral-800 text-white' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}
                                        >
                                            <KeyIcon className="mr-3 h-5 w-5" />
                                            Change Password
                                        </Link>
                                    )}
                                </Menu.Item>
                            </div>

                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={handleLogout}
                                            className={`${active ? 'bg-neutral-800 text-red-400' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}
                                        >
                                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                                            Log out
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
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