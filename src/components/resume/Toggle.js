import React from 'react';

const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">{label}</span>
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

export default Toggle;
