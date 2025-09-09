import React from 'react';

const FormTextarea = ({ label, name, value, onChange, onKeyDown, placeholder, rows = 4 }) => (
    <div>
        <label htmlFor={name} className="block text-xs font-bold text-gray-400 uppercase mb-2">
            {label}
        </label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
        />
    </div>
);

export default FormTextarea;
