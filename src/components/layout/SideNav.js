import React, { useState } from 'react';
import { navLinks, subNavLinks } from '../../data/mockData';
import { Link } from 'react-router-dom';

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

const NavHeader = ({ isNavOpen, onToggle }) => (
    <div className={`flex items-center mb-6 ${isNavOpen ? 'justify-between' : 'justify-center'}`}>
        {isNavOpen && <img src="/logoa.png" alt="Logo" className="h-8" />}
        <button onClick={onToggle} className="p-1 rounded-md hover:bg-neutral-800">
            {isNavOpen ? <ToggleIconOpen /> : <ToggleIconClosed />}
        </button>
    </div>
);

const MainNavPanel = ({ handleNavClick }) => (
    <nav className="flex flex-col space-y-2">
        {navLinks.map(link => (
            <Link
                key={link.id}
                to={link.id === 'home' ? '/' : `/${link.id}`}
                onClick={() => handleNavClick(link)}
                className="group flex items-center justify-between px-3 py-2 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
                <span>{link.title}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowIcon />
                </span>
            </Link>
        ))}
    </nav>
);

// Secondary (sub-navigation) panel
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

            {subNavData.sections && subNavData.sections.map((section, index) => (
                <div key={index} className="pt-4 mt-2 border-t border-neutral-800">
                    <h3 className="px-3 mb-2 text-xs font-semibold uppercase text-neutral-500 tracking-wider">{section.title}</h3>
                    {section.links.map(link => (
                        <Link
                            key={link.id}
                            to={`/${parentId}/${link.id}`}
                            onClick={() => handleSubNavClick(link)}
                            className={`px-3 py-2 block rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white ${activeSubPage === link.id ? 'bg-neutral-800' : ''}`}
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>
            ))}
        </nav>
    </div>
);

// --- Main SideNav Component ---
const SideNav = ({ isNavOpen, setIsNavOpen }) => {
    const [activeSubNav, setActiveSubNav] = useState(null);
    const [activeSubPage, setActiveSubPage] = useState(null);

    const handleNavClick = (link) => {
        if (subNavLinks[link.id]) {
            setActiveSubNav(link.id);
            setActiveSubPage(subNavLinks[link.id].links[0].id);
        } else {
            setActiveSubNav(null);
        }
    };

    const handleSubNavClick = (subLink) => {
        setActiveSubPage(subLink.id);
    };

    return (
        <aside className={`bg-black p-4 flex-shrink-0 hidden md:flex flex-col transition-all duration-300 ease-in-out ${isNavOpen ? 'w-64' : 'w-20'}`}>
            <NavHeader isNavOpen={isNavOpen} onToggle={() => setIsNavOpen(!isNavOpen)} />
            <div className={`flex flex-col flex-grow overflow-hidden transition-opacity duration-200 ${isNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="relative flex-grow">
                    <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${activeSubNav ? '-translate-x-full' : 'translate-x-0'}`}>
                        <MainNavPanel handleNavClick={handleNavClick} />
                    </div>
                    <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${activeSubNav ? 'translate-x-0' : 'translate-x-full'}`}>
                        {activeSubNav && (
                            <SubNavPanel
                                parentId={activeSubNav}
                                subNavData={subNavLinks[activeSubNav]}
                                onBack={() => setActiveSubNav(null)}
                                handleSubNavClick={handleSubNavClick}
                                activeSubPage={activeSubPage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default SideNav;