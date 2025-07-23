import React from 'react';
import { Link } from 'react-router-dom';

const TopHeader = ({ setPage }) => (
    // The "See plans" button has been removed from this component.
    <header className="p-4 flex justify-end items-center flex-shrink-0">
        <div className="flex items-center gap-4">
            <button
                className="bg-neutral-900 text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-neutral-200 transition-colors"
            >
                <Link to="/login">Log in</Link>
            </button>
        </div>
    </header>
);

export default TopHeader;
