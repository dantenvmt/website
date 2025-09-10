import React from 'react';

const AddItemButton = ({ onClick, children }) => {
    return (
        <div className="flex justify-center mt-8">
            <button
                onClick={onClick}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
            >
                {children}
            </button>
        </div>
    );
};

export default AddItemButton;
