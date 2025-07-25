import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TopHeader = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="flex-shrink-0 h-16 flex items-center justify-end px-6 border-b border-neutral-800">
            <div className="flex items-center space-x-4">
                {token ? (
                    <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors">
                        Log out
                    </button>
                ) : (
                    <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-md hover:bg-neutral-800 transition-colors">
                        Log in
                    </Link>
                )}

            </div>
        </header>
    );
};

export default TopHeader;