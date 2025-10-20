// src/components/resume/FormInput.js
import React from 'react';

const FormInput = ({ 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    type = 'text', // <-- Add default type
    required = false, // <-- Add required prop
    autoComplete // <-- Add autocomplete prop
}) => (
    <div>
        <label htmlFor={name} className="block text-xs font-bold text-gray-400 uppercase mb-2">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
            type={type} // <-- Use type prop
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required} // <-- Use required prop
            autoComplete={autoComplete} // <-- Use autocomplete prop
            className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 text-white" // <-- Applied text-white
        />
    </div>
);

export default FormInput;