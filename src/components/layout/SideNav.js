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
const MainNavPanel = ({ handleNavClick, user, onOpenLoginModal }) => {
    // --- ADDED: Define IDs of links moved to TopHeader ---
    const movedLinkIds = ['admin', 'my-status'];

    return (
        <nav className="flex flex-col space-y-2">
            {navLinks
                // --- MODIFIED: Filter logic ---
                .filter(link => {
                    // 1. Exclude links that were moved
                    if (movedLinkIds.includes(link.id)) {
                        return false;
                    }
                    // 2. Keep public links
                    if (!link.adminOnly && !link.userOnly) {
                        return true;
                    }
                    // 3. Keep admin links ONLY if user is admin
                    if (link.adminOnly && user?.role === 'admin') {
                        return true;
                    }
                    // 4. Keep user links ONLY if user is logged in (role doesn't matter for userOnly links like Resume)
                    // Updated this check to allow both 'user' and 'admin' roles for userOnly links
                    if (link.userOnly && user) {
                        return true;
                    }
                    return false;
                })
                .map(link => {
                    const requiresAuth = link.id === 'resume'; // Adjusted based on mockData

                    return (
                        <Link
                            key={link.id}
                            to={link.id === 'home' ? '/' : `/${link.id}`}
                            onClick={(e) => {
                                if (requiresAuth && !user) {
                                    e.preventDefault();
                                    if (onOpenLoginModal) onOpenLoginModal();
                                    return;
                                }
                                handleNavClick(link);
                            }}
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
                    );
                })}
        </nav>
    );
};

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
            setIsNavOpen(false);
        }
    };

    const handleSubNavClick = (subLink) => {
        setActiveSubPage(subLink.id);
        setIsNavOpen(false);
    };

    const desktopNavClasses = `hidden md:flex md:flex-col transition-all duration-300 ease-in-out ${isDesktopNavOpen ? 'w-64' : 'w-20'}`;
    const mobileNavClasses = `fixed inset-y-0 left-0 z-40 flex flex-col transition-transform duration-300 ease-in-out bg-black transform ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} w-64 md:hidden`;

    return (
        <>
            {/* Mobile Nav */}
            <aside className={mobileNavClasses}>
                <NavHeader isDesktopNavOpen={true} onToggle={() => setIsNavOpen(false)} />
                <div className={`flex flex-col flex-grow overflow-hidden transition-opacity duration-200 opacity-100`}>
                    <div className="relative flex-grow">
                        <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${activeSubNav ? '-translate-x-full' : 'translate-x-0'}`}>
                            <MainNavPanel handleNavClick={handleNavClick} user={user} />
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

            {/* Overlay for Mobile */}
            {isNavOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
                    onClick={() => setIsNavOpen(false)}
                ></div>
            )}

            {/* Desktop Nav */}
            <aside className={desktopNavClasses}>
                <NavHeader isDesktopNavOpen={isDesktopNavOpen} onToggle={() => setIsDesktopNavOpen(!isDesktopNavOpen)} />
                <div className={`flex flex-col flex-grow overflow-hidden transition-opacity duration-200 ${isDesktopNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="relative flex-grow">
                        <div className={`absolute inset-0 transition-transform duration-300 ease-in-out ${activeSubNav ? '-translate-x-full' : 'translate-x-0'}`}>
                            <MainNavPanel handleNavClick={handleNavClick} user={user} /> {/* Pass user */}
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
        </>
    );
};
export default SideNav;