import React from 'react';
import Toggle from './Toggle';

const FormSelect = ({ label, name, value, onChange, children, showOnResume, onToggle }) => (
    <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
            <label htmlFor={name} className="block text-xs font-bold text-gray-400 uppercase">
                {label}
            </label>
            {onToggle && <Toggle label="Show on resume" checked={showOnResume} onChange={onToggle} />}
        </div>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 appearance-none"
        >
            {children}
        </select>
    </div>
);

export default FormSelect;
