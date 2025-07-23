import React, { useState } from 'react';
import { navLinks, subNavLinks } from '../../data/mockData';
import { Link, useLocation } from 'react-router-dom';

// --- Icon Components ---
// These could also be in their own files in a larger project.
const ArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const BackArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12 8H4M4 8L8 12M4 8L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const ToggleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="10" y="4" width="10" height="16" fill="currentColor" />
    </svg>
);

// --- Sub-Components for SideNav ---

// Header section of the sidebar
const NavHeader = ({ isNavOpen, setIsNavOpen, setPage }) => (
    <div className="flex items-center justify-between mb-6 h-8">
        {/* This container animates its width to solve the button push issue */}
        <div
            className={`cursor-pointer transition-all duration-300 ease-in-out overflow-hidden ${isNavOpen ? 'max-w-xs' : 'max-w-0'}`}
            onClick={() => setPage('home')}
            aria-label="Go to Homepage"
        >
            <img src={process.env.PUBLIC_URL + '/logo.png'} alt="YourBrand Logo" />
        </div>
        <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="p-1 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800"
            aria-label={isNavOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
            <ToggleIcon />
        </button>
    </div>
);

// Primary navigation panel
const MainNavPanel = ({ handleNavClick }) => (
    <nav className="flex flex-col space-y-2">
        {navLinks.map(link => (
            <a
                key={link.id}
                href="#"
                onClick={(e) => { e.preventDefault(); handleNavClick(link); }}
                className="group flex items-center justify-between px-3 py-2 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
                <span>{link.title}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowIcon />
                </span>
            </a>
        ))}
    </nav>
);

// Secondary (sub-navigation) panel
const SubNavPanel = ({ subNavData, onBack, handleSubNavClick, activeSubPage }) => (
    <div className="flex flex-col h-full">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 text-neutral-300 hover:text-white mb-4">
            <BackArrowIcon />
            <span>Home</span>
        </button>
        <nav className="flex flex-col space-y-2">
            {subNavData.links.map(link => (
                <a
                    key={link.id}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleSubNavClick(link); }}
                    className={`px-3 py-2 rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white ${activeSubPage === link.id ? 'bg-neutral-800' : ''}`}
                >
                    {link.title}
                </a>
            ))}
            {subNavData.sections?.map(section => (
                <div key={section.title} className="pt-4">
                    <h4 className="px-3 text-sm text-neutral-500 mb-2">{section.title}</h4>
                    {section.links.map(link => (
                        <a
                            key={link.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); handleSubNavClick(link); }}
                            className={`block px-3 py-2 rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white ${activeSubPage === link.id ? 'bg-neutral-800' : ''}`}
                        >
                            {link.title}
                        </a>
                    ))}
                </div>
            ))}
        </nav>
    </div>
);


// --- Main SideNav Component ---
const SideNav = ({ currentPage, setPage, activeSubPage, setActiveSubPage, isNavOpen, setIsNavOpen }) => {
    const [activeSubNav, setActiveSubNav] = useState(null);

    const handleNavClick = (link) => {
        if (subNavLinks[link.id]) {
            setActiveSubNav(link.id);
            setPage(link.id);
            // Set the default sub-page when opening a new section
            setActiveSubPage(subNavLinks[link.id].links[0].id);
        } else {
            setPage(link.id);
            setActiveSubNav(null);
        }
    };

    const handleSubNavClick = (subLink) => {
        setActiveSubPage(subLink.id);
    };

    return (
        <aside className={`bg-black p-4 flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ease-in-out ${isNavOpen ? 'w-60' : 'w-20'}`}>
            <NavHeader isNavOpen={isNavOpen} setIsNavOpen={setIsNavOpen} setPage={setPage} />
            <div className={`flex flex-col flex-grow overflow-hidden transition-opacity duration-200 ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="relative flex-grow">
                    <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${activeSubNav ? '-translate-x-full' : 'translate-x-0'}`}>
                        <nav className="flex flex-col space-y-2">
                            {navLinks.map(link => (
                                <a key={link.id} href="#" onClick={(e) => { e.preventDefault(); handleNavClick(link); }} className="group flex items-center justify-between px-3 py-2 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white">
                                    <span>{link.title}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity"><ArrowIcon /></span>
                                </a>
                            ))}
                        </nav>
                    </div>
                    <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${activeSubNav ? 'translate-x-0' : 'translate-x-full'}`}>
                        {activeSubNav && <SubNavPanel subNavData={subNavLinks[activeSubNav]} onBack={() => setActiveSubNav(null)} handleSubNavClick={handleSubNavClick} activeSubPage={activeSubPage} />}
                    </div>
                </div>

            </div>
        </aside>
    );
};

export default SideNav;
