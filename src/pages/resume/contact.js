import React, { useState } from 'react';
import EditorLayout from '../../components/resume/EditorLayout';
import SaveButton from '../../components/common/SaveButton';
import FormInput from '../../components/resume/FormInput';
import FormSelect from '../../components/resume/FormSelect';
import { useResume } from '../../context/ResumeContext';

const Contact = () => {
    const { contact, setContact } = useResume();

    const [toggles, setToggles] = useState({
        country: true,
        state: false,
        city: false,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContact(prev => ({ ...prev, [name]: value }));
    };

    const handleToggle = (name) => {
        setToggles(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSave = () => {
        console.log("Saving contact info from context:", contact);
        alert("Contact info saved!");
    };

    return (
        <EditorLayout>
            <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-8">
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="Full Name" name="fullName" value={contact.fullName} onChange={handleInputChange} placeholder="John Doe" />
                        <FormInput label="Email Address" name="email" value={contact.email} onChange={handleInputChange} placeholder="john.doe@example.com" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="Phone Number" name="phone" value={contact.phone} onChange={handleInputChange} placeholder="(123) 456-7890" />
                        <FormInput label="LinkedIn URL" name="linkedin" value={contact.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/your-username" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="Personal Website or Relevant Link" name="website" value={contact.website} onChange={handleInputChange} placeholder="https://www.johndoe.com" />
                        <FormSelect label="Country" name="country" value={contact.country} onChange={handleInputChange} showOnResume={toggles.country} onToggle={() => handleToggle('country')}>
                            <option value="" disabled>Select a country</option>
                            <option>United States</option>
                            <option>Canada</option>
                        </FormSelect>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormSelect label="State" name="state" value={contact.state} onChange={handleInputChange} showOnResume={toggles.state} onToggle={() => handleToggle('state')}>
                            <option value="" disabled>Select a state</option>
                            <option>Texas</option>
                            <option>California</option>
                        </FormSelect>
                        <FormSelect label="City" name="city" value={contact.city} onChange={handleInputChange} showOnResume={toggles.city} onToggle={() => handleToggle('city')}>
                            <option value="" disabled>Select a city</option>
                            <option>Richardson</option>
                            <option>Dallas</option>
                        </FormSelect>
                    </div>
                    <div className="flex justify-end pt-4">
                        <SaveButton onClick={handleSave}>
                            SAVE BASIC INFO
                        </SaveButton>
                    </div>
                </form>
            </div>
        </EditorLayout>
    );
};

export default Contact;

