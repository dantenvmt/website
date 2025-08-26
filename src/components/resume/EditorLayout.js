import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

const EditorLayout = ({ children }) => {
    // We can get the resumeId from the URL to build the links
    const { resumeId } = useParams();

    const navItems = ['Contact', 'Experience', 'Education', 'Skills', 'Summary'];

    return (
        <div className="bg-black text-white min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Editor Navigation */}
                <nav className="flex items-center space-x-4 mb-8 border-b border-gray-700 pb-4">
                    <button className="flex items-center space-x-2 bg-gray-800 border border-gray-700 px-3 py-2 rounded-md font-semibold hover:bg-gray-700">
                        <span>Job Title</span>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md p-1 space-x-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item}
                                to={`/resume/${item.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `px-3 py-1.5 text-sm font-medium rounded-md ${
                                    isActive
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                {item.toUpperCase()}
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* Page-specific content will be rendered here */}
                <main>{children}</main>
            </div>
        </div>
    );
};

export default EditorLayout;