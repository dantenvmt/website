import React, { useState, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HamburgerIcon from './HamburgerIcon';
import LoginModal from '../auth/LoginModal';
import SignupModal from '../auth/SignUpModal.jsx'; // <--- 1. Import SignupModal
import Toast from '../common/Toast.jsx';
import { Menu, Transition } from '@headlessui/react';
import {
    UserCircleIcon,
    ShieldCheckIcon,
    ClipboardDocumentListIcon,
    KeyIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon,
    NewspaperIcon
} from '@heroicons/react/24/outline';

const TopHeader = ({ isNavOpen, setIsNavOpen }) => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    // State for modals
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false); // <--- 2. Add state for Sign Up
    const [toast, setToast] = useState({ show: false, message: '' });

    const handleLoginSuccess = (userData) => {
        setShowLogin(false);
        setToast({ show: true, message: 'Login successful!' });

        setTimeout(() => {
            window.location.reload();
        }, 100);

        setTimeout(() => {
            if (userData.role === 'admin') {
                navigate('/admin');
            } else if (userData.role === 'client') {
                navigate('/my-status');
            } else {
                navigate('/dashboard');
            }
        }, 100);
    };

    // <--- 3. Add handler for Sign Up Success
    const handleSignupSuccess = (userData) => {
        setShowSignup(false);
        setToast({ show: true, message: 'Account created successfully!' });

        // If your app auto-logs in after signup, redirect them:
        handleLoginSuccess(userData);

        // OR if they need to verify email/login manually:
        // setTimeout(() => setShowLogin(true), 500); 
    };

    const handleLogout = () => {
        logout();
        setToast({ show: true, message: 'Logged out successfully.' });
        navigate('/');
    };

    const renderAuthSection = () => {
        if (loading) {
            return <div className="w-20 h-8 bg-neutral-800 rounded animate-pulse"></div>;
        }

        if (user) {
            let displayName = user.full_name;

            if (!displayName && user.first_name && user.last_name) {
                displayName = `${user.first_name} ${user.last_name}`;
            }

            if (!displayName) {
                displayName = user.email;
            }

            return (
                <Menu as="div" className="relative inline-block text-left">
                    <div>
                        <Menu.Button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                            <UserCircleIcon className="h-6 w-6" />
                            <span className="hidden md:inline capitalize">{displayName}</span>
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
                            {/* User Info Header */}
                            <div className="px-1 py-1 ">
                                <div className="flex items-center space-x-3 px-4 py-3 mb-1">
                                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                        {displayName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-white truncate capitalize">{displayName}</p>
                                        <p className="text-xs text-neutral-400 uppercase">{user.role}</p>
                                    </div>
                                </div>

                                {/* ADMIN LINKS */}
                                {user.role === 'admin' && (
                                    <>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link to="/admin" className={`${active ? 'bg-neutral-800 text-white' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}>
                                                    <ShieldCheckIcon className="mr-3 h-5 w-5" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link to="/admin/content-manager" className={`${active ? 'bg-neutral-800 text-white' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}>
                                                    <NewspaperIcon className="mr-3 h-5 w-5" />
                                                    Manage Content
                                                </Link>
                                            )}
                                        </Menu.Item>
                                    </>
                                )}

                                {/* CLIENT LINKS */}
                                {user.role === 'client' && (
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link to="/my-status" className={`${active ? 'bg-neutral-800 text-white' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}>
                                                <ClipboardDocumentListIcon className="mr-3 h-5 w-5" />
                                                My Status
                                            </Link>
                                        )}
                                    </Menu.Item>
                                )}

                                {/* USER LINKS */}
                                {user.role === 'user' && (
                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link to="/dashboard" className={`${active ? 'bg-neutral-800 text-white' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}>
                                                <ClipboardDocumentListIcon className="mr-3 h-5 w-5" />
                                                Dashboard
                                            </Link>
                                        )}
                                    </Menu.Item>
                                )}
                            </div>

                            {/* SETTINGS */}
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link to="/settings/change-password" className={`${active ? 'bg-neutral-800 text-white' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}>
                                            <KeyIcon className="mr-3 h-5 w-5" />
                                            Change Password
                                        </Link>
                                    )}
                                </Menu.Item>
                            </div>

                            {/* LOGOUT */}
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button onClick={handleLogout} className={`${active ? 'bg-neutral-800 text-red-400' : 'text-neutral-300'} group flex w-full items-center rounded-md px-4 py-3 text-sm`}>
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

        // <--- 4. Updated Non-Logged In View to include Sign Up
        return (
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                >
                    Log in
                </button>
                <button
                    onClick={() => setShowSignup(true)}
                    className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    Sign Up
                </button>
            </div>
        );
    };

    return (
        <>
            <header className="flex-shrink-0 h-16 flex items-center justify-between md:justify-end px-6 border-b border-neutral-800 bg-black text-white">
                <div className="md:hidden">
                    <button onClick={() => setIsNavOpen(!isNavOpen)} className="p-1 rounded-md hover:bg-neutral-800">
                        <HamburgerIcon />
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    {renderAuthSection()}
                </div>
            </header>

            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onLoginSuccess={handleLoginSuccess}
            />

            {/* <--- 5. Add SignupModal Component */}
            <SignupModal
                isOpen={showSignup}
                onClose={() => setShowSignup(false)}
                onSignupSuccess={handleSignupSuccess}
            />

            <Toast
                show={toast.show}
                message={toast.message}
                onClose={() => setToast({ show: false, message: '' })}
            />
        </>
    );
};

export default TopHeader;