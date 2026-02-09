// src/components/layout/SideNav.js
import React, { useState } from 'react';
import { navLinks, subNavLinks } from '../../data/mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// --- Icon Components ---
const ToggleIconOpen = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="4" y="4" width="10" height="16" fill="currentColor" />
    </svg>
);

const ToggleIconClosed = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="10" y="4" width="10" height="16" fill="currentColor" />
    </svg>
);

const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BackArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// --- Sub-Components for SideNav ---

const NavHeader = ({ isDesktopNavOpen, onToggle }) => (
    <div className={`flex items-center mb-6 ${isDesktopNavOpen ? 'justify-between' : 'justify-center'}`}>
        {isDesktopNavOpen && <img src="/logoa.png" alt="Logo" className="h-14" />}
        <button onClick={onToggle} className="p-1 rounded-md hover:bg-neutral-800">
            {isDesktopNavOpen ? <ToggleIconOpen /> : <ToggleIconClosed />}
        </button>
    </div>
);

const MainNavPanel = ({ handleNavClick, user }) => {
    const movedLinkIds = ['admin', 'my-status'];

    return (
        <nav className="flex flex-col space-y-2">
            {navLinks
                .filter(link => {
                    if (movedLinkIds.includes(link.id)) return false;
                    // Allow the 'resume' link to be visible to everyone
                    if (link.id === 'resume') return true;
                    if (!link.adminOnly && !link.userOnly) return true;
                    if (link.adminOnly && user?.role === 'admin') return true;
                    if (link.userOnly && user) return true;
                    return false;
                })
                .map(link => (
                    <Link
                        key={link.id}
                        to={link.id === 'home' ? '/' : `/${link.id}`}
                        onClick={() => handleNavClick(link)}
                        className="group flex items-center justify-between px-3 py-2 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        title={link.title}
                    >
                        <span>{link.title}</span>
                        {subNavLinks[link.id] && (
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowIcon />
                            </span>
                        )}
                    </Link>
                ))}
        </nav>
    );
};

const SubNavPanel = ({ subNavData, onBack, handleSubNavClick, activeSubPage, parentId }) => (
    <div className="flex flex-col h-full">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white mb-4">
            <BackArrowIcon />
            <span>Home</span>
        </button>
        <nav className="flex flex-col space-y-2">
            {subNavData.links.map(link => (
                <Link
                    key={link.id}
                    to={`/${parentId}/${link.id}`}
                    onClick={() => handleSubNavClick(link)}
                    className={`px-3 py-2 rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white ${activeSubPage === link.id ? 'bg-neutral-800' : ''}`}
                >
                    {link.title}
                </Link>
            ))}
        </nav>
    </div>
);

// --- Main SideNav Component ---
const SideNav = ({ isNavOpen, isDesktopNavOpen, setIsNavOpen, setIsDesktopNavOpen }) => {
    const [activeSubNav, setActiveSubNav] = useState(null);
    const [activeSubPage, setActiveSubPage] = useState(null);
    const { user } = useAuth();

    const handleNavClick = (link) => {
        if (subNavLinks[link.id]) {
            setActiveSubNav(link.id);
            setActiveSubPage(subNavLinks[link.id].links[0].id);
        } else {
            setActiveSubNav(null);
            setIsNavOpen(false); // Closes mobile nav on click
        }
    };

    const handleSubNavClick = (subLink) => {
        setActiveSubPage(subLink.id);
        setIsNavOpen(false);
    };

    const desktopNavClasses = `hidden md:flex md:flex-col transition-all duration-300 ease-in-out ${isDesktopNavOpen ? 'w-64' : 'w-20'} bg-black h-screen sticky top-0`;
    const mobileNavClasses = `fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ease-in-out bg-black transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} w-64 md:hidden`;

    return (
        <>
            <aside className={mobileNavClasses}>
                <NavHeader isDesktopNavOpen={true} onToggle={() => setIsNavOpen(false)} />
                <div className="relative flex-grow px-4">
                    <div className={`transition-transform duration-300 ${activeSubNav ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
                        <MainNavPanel handleNavClick={handleNavClick} user={user} />
                    </div>
                    {activeSubNav && (
                        <div className="absolute inset-0 px-4">
                            <SubNavPanel
                                parentId={activeSubNav}
                                subNavData={subNavLinks[activeSubNav]}
                                onBack={() => setActiveSubNav(null)}
                                handleSubNavClick={handleSubNavClick}
                                activeSubPage={activeSubPage}
                            />
                        </div>
                    )}
                </div>
            </aside>

            {isNavOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsNavOpen(false)} />}

            <aside className={desktopNavClasses}>
                <NavHeader isDesktopNavOpen={isDesktopNavOpen} onToggle={() => setIsDesktopNavOpen(!isDesktopNavOpen)} />
                {isDesktopNavOpen && (
                    <div className="relative flex-grow px-4">
                        {!activeSubNav ? (
                            <MainNavPanel handleNavClick={handleNavClick} user={user} />
                        ) : (
                            <SubNavPanel
                                parentId={activeSubNav}
                                subNavData={subNavLinks[activeSubNav]}
                                onBack={() => setActiveSubNav(null)}
                                handleSubNavClick={handleSubNavClick}
                                activeSubPage={activeSubPage}
                            />
                        )}
                    </div>
                )}
            </aside>
        </>
    );
};

export default SideNav;