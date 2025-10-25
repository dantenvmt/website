import React from 'react';
import { Link } from 'react-router-dom';

const AuthFormContainer = ({ title, children }) => {
    return (
        <div className="bg-black text-white flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-sm">
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
                    <h1 className="text-2xl font-bold text-center mb-6">{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthFormContainer;