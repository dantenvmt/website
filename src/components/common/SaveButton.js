import React from 'react';

const SaveButton = ({ onClick, children, type = 'button' }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
            {children}
        </button>
    );
};

export default SaveButton;
