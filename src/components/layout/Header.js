import React from 'react';
import Logo from '../common/Logo';
import NavLink from '../common/NavLink';
import { PrimaryButton } from '../common/Button';

const Header = ({ currentPage, setPage }) => (
    <header className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Logo />
            <nav className="hidden md:flex items-center space-x-8">
                <NavLink page="home" currentPage={currentPage} setPage={setPage}>Home</NavLink>
                <NavLink page="about" currentPage={currentPage} setPage={setPage}>About</NavLink>
                <NavLink page="plans" currentPage={currentPage} setPage={setPage}>Pricing</NavLink>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
                <NavLink page="login" currentPage={currentPage} setPage={setPage}>Log In</NavLink>
                <PrimaryButton onClick={() => setPage('register')}>Sign Up</PrimaryButton>
            </div>
            <div className="md:hidden">
                <button onClick={() => alert('Mobile menu coming soon!')} className="text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
        </div>
    </header>
);

export default Header;