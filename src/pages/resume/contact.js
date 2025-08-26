import React, { useState } from 'react';
import EditorLayout from '../../components/resume/EditorLayout';

// --- Reusable Helper Components ---

const Toggle = ({ label, checked, onChange }) => (
    <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">{label}</span>
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                checked ? 'bg-cyan-500' : 'bg-gray-600'
            }`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    </div>
);

const FormInput = ({ label, name, value, onChange, placeholder }) => (
    <div className="flex-1">
        <label htmlFor={name} className="block text-xs font-bold text-gray-400 uppercase mb-2">
            {label}
        </label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500"
        />
    </div>
);

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
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-3 focus:ring-cyan-500 focus:border-cyan-500 appearance-none"
        >
            {children}
        </select>
    </div>
);


// --- Main Contact Page Component ---

const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        linkedin: '',
        website: '',
        country: '',
        state: '',
        city: '',
    });

    const [toggles, setToggles] = useState({
        country: true,
        state: false,
        city: false,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name) => {
        setToggles(prev => ({ ...prev, [name]: !prev[name] }));
    };

    return (
        <EditorLayout>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" />
                        <FormInput label="Email Address" name="email" value={formData.email} onChange={handleInputChange} placeholder="john.doe@example.com" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="(123) 456-7890"/>
                        
                        {/* LinkedIn URL Input */}
                        <div className="flex-1">
                            <label htmlFor="linkedin" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                LinkedIn URL
                            </label>
                            <div className="relative">
                                <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500">
                                    <span className="pl-3 text-gray-500">https://linkedin.com/in/</span>
                                    <input
                                        type="text"
                                        id="linkedin"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleInputChange}
                                        placeholder="your-username"
                                        className="flex-1 bg-transparent p-3 text-white border-none focus:ring-0"
                                    />
                                </div>
                                <a
                                    href={formData.linkedin ? `https://linkedin.com/in/${formData.linkedin}` : undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${!formData.linkedin ? 'pointer-events-none' : 'cursor-pointer'}`}
                                    onClick={(e) => !formData.linkedin && e.preventDefault()}
                                >
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="Personal Website or Relevant Link" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://www.johndoe.com"/>
                        <FormSelect label="Country" name="country" value={formData.country} onChange={handleInputChange} showOnResume={toggles.country} onToggle={() => handleToggle('country')}>
                            <option value="" disabled>Select a country</option>
                            <option>United States</option>
                            <option>Canada</option>
                        </FormSelect>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <FormSelect label="State" name="state" value={formData.state} onChange={handleInputChange} showOnResume={toggles.state} onToggle={() => handleToggle('state')}>
                            <option value="" disabled>Select a state</option>
                            <option>Texas</option>
                            <option>California</option>
                        </FormSelect>
                         <FormSelect label="City" name="city" value={formData.city} onChange={handleInputChange} showOnResume={toggles.city} onToggle={() => handleToggle('city')}>
                            <option value="" disabled>Select a city</option>
                            <option>Richardson</option>
                            <option>Dallas</option>
                        </FormSelect>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                        >
                            SAVE BASIC INFO
                        </button>
                    </div>
                </form>
            </div>
        </EditorLayout>
    );
};

export default Contact;