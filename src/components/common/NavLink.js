import React from 'react';

const NavLink = ({ page, currentPage, setPage, children }) => (
    <a
        href={`#${page}`}
        onClick={(e) => {
            e.preventDefault();
            setPage(page);
        }}
        className={`text-neutral-300 hover:text-white transition-colors ${currentPage === page ? 'text-white font-semibold' : ''}`}
    >
        {children}
    </a>
);

export default NavLink;