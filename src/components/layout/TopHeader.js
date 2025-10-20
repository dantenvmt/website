import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import HamburgerIcon from './HamburgerIcon';
import LoginModal from '../auth/LoginModal';
import Toast from '../common/Toast';

const TopHeader = ({ isNavOpen, setIsNavOpen }) => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogin, setShowLogin] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '' });
    // ✅ Handle login success callback
    const handleLoginSuccess = (user) => {
        setShowLogin(false);
        setToast({ show: true, message: 'Login successful!' });
        navigate('/resume');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <header className="flex-shrink-0 h-16 flex items-center justify-between md:justify-end px-6 border-b border-neutral-800">
                <div className="md:hidden">
                    <button
                        onClick={() => setIsNavOpen(!isNavOpen)}
                        className="p-1 rounded-md hover:bg-neutral-800"
                    >
                        <HamburgerIcon />
                    </button>
                </div>
                <div className="flex items-center space-x-4">
                    {token ? (
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                        >
                            Log out
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowLogin(true)}
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors"
                        >
                            Log in
                        </button>
                    )}
                </div>
            </header>

            {/* ✅ Pass in onLoginSuccess */}
            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onLoginSuccess={handleLoginSuccess}
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
