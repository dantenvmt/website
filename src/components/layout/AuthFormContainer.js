import React from 'react';
import Logo from '../common/Logo';

const AuthFormContainer = ({ title, children, footerLink, setPage }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
        <div className="w-full max-w-sm p-8">
            <div className="text-center mb-8 cursor-pointer" onClick={() => setPage('home')}>
                <Logo />
            </div>
            <h1 className="text-2xl font-semibold text-center text-white mb-6">{title}</h1>
            {children}
            <p className="text-center text-sm text-neutral-400 mt-8">
                {footerLink.text} <a href="#" onClick={(e) => { e.preventDefault(); setPage(footerLink.page); }} className="font-medium text-[#00A67E] hover:underline">{footerLink.linkText}</a>
            </p>
        </div>
    </div>
);

export default AuthFormContainer;