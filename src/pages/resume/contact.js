import React from 'react';
import EditorLayout from '../../components/resume/EditorLayout';
import SaveButton from '../../components/common/SaveButton';
import FormInput from '../../components/resume/FormInput';
import Toggle from '../../components/resume/Toggle';
import FormSelect from '../../components/resume/FormSelect';
import { useResume } from '../../context/ResumeContext';

const Contact = () => {
    const { contact, setContact, contactToggles, setContactToggles } = useResume();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContact(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name) => {
        setContactToggles(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSave = () => {
        console.log("Saving Contact Info:", contact);
        console.log("Saving Toggles:", contactToggles);
        alert("Contact info saved!");
    };

    return (
        <EditorLayout>
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="Full Name" name="fullName" value={contact.fullName} onChange={handleInputChange} placeholder="John Doe" />
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase">Email Address</label>
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={contact.email}
                                onChange={handleInputChange}
                                placeholder="john.doe@example.com"
                                className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="phone" className="block text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                                <Toggle label="Show on resume" checked={contactToggles.phone} onChange={() => handleToggle('phone')} />
                            </div>
                            <input
                                type="text"
                                id="phone"
                                name="phone"
                                value={contact.phone}
                                onChange={handleInputChange}
                                placeholder="(123) 456-7890"
                                className="w-full bg-[#0f172a] border border-gray-600 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="linkedin" className="block text-xs font-bold text-gray-400 uppercase mb-2">
                                    LinkedIn URL
                                </label>
                                <Toggle label="Show on resume" checked={contactToggles.linkedin} onChange={() => handleToggle('linkedin')} />
                            </div>

                            <div className="flex items-center bg-[#0f172a] border border-gray-600 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                <span className="pl-3 text-gray-500">linkedin.com/in/</span>
                                <input
                                    type="text"
                                    id="linkedin"
                                    name="linkedin"
                                    value={contact.linkedin}
                                    onChange={handleInputChange}
                                    placeholder="your-username"
                                    className="flex-1 bg-transparent p-3 text-white border-none focus:ring-0"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="Personal Website or Relevant Link" name="website" value={contact.website} onChange={handleInputChange} placeholder="https://www.johndoe.com" />
                        <FormSelect
                            label="Country"
                            name="country"
                            value={contact.country}
                            onChange={handleInputChange}
                            showOnResume={contactToggles.country}
                            onToggle={() => handleToggle('country')}
                        >
                            <option value="">Select a country</option>
                            <option>United States</option>
                            <option>Canada</option>
                        </FormSelect>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect
                            label="State"
                            name="state"
                            value={contact.state}
                            onChange={handleInputChange}
                            showOnResume={contactToggles.state}
                            onToggle={() => handleToggle('state')}
                        >
                            <option value="">Select a state</option>
                            <option>Texas</option>
                            <option>California</option>
                        </FormSelect>
                        <FormSelect
                            label="City"
                            name="city"
                            value={contact.city}
                            onChange={handleInputChange}
                            showOnResume={contactToggles.city}
                            onToggle={() => handleToggle('city')}
                        >
                            <option value="">Select a city</option>
                            <option>Richardson</option>
                            <option>Dallas</option>
                        </FormSelect>
                    </div>
                    <div className="flex justify-end pt-4">
                        <SaveButton onClick={handleSave}>SAVE BASIC INFO</SaveButton>
                    </div>
                </form>
            </div>
        </EditorLayout>
    );
};

export default Contact;

